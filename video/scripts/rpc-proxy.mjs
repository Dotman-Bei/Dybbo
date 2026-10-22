// A thin JSON-RPC proxy in front of the local Monad fork, for capture only. Everything is forwarded
// unchanged except eth_gasPrice, which answers with Monad mainnet's gas price (~102 gwei) so the app's
// gas estimate shows the real mainnet cost. The fork's own fees stay low, so transactions never stall.
// The app's server-side reads (owner lists for all 1,969 Chogs) go to mainnet itself: they do not depend
// on the fork's state, and a cold fork would take most of an hour to answer them.
//   node scripts/rpc-proxy.mjs <listen port> <upstream url> [gas price wei] [mainnet url]
import http from "node:http";

const [port = "8547", upstream = "http://127.0.0.1:8545", gasPrice = "102000000000", mainnet = "https://rpc.monad.xyz"] = process.argv.slice(2);
const GAS = "0x" + BigInt(gasPrice).toString(16);

http
  .createServer(async (req, res) => {
    res.setHeader("access-control-allow-origin", "*");
    res.setHeader("access-control-allow-headers", "content-type");
    if (req.method === "OPTIONS") return res.end();
    let body = "";
    for await (const chunk of req) body += chunk;
    let msg;
    try {
      msg = JSON.parse(body);
    } catch {
      res.statusCode = 400;
      return res.end();
    }
    const target = /Mozilla/.test(req.headers["user-agent"] || "") ? upstream : mainnet;
    const one = async (m) => {
      if (m.method === "eth_gasPrice") return { jsonrpc: "2.0", id: m.id, result: GAS };
      try {
        return await (await fetch(target, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(m) })).json();
      } catch (e) {
        // Keep serving if the fork restarts; the app retries.
        return { jsonrpc: "2.0", id: m.id, error: { code: -32603, message: String(e.message) } };
      }
    };
    const out = Array.isArray(msg) ? await Promise.all(msg.map(one)) : await one(msg);
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify(out));
  })
  .listen(Number(port), () => console.log(`rpc proxy :${port} -> ${upstream}, eth_gasPrice = ${gasPrice}`));
