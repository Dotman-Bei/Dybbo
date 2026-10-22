// Captures every UI state the demo shows, from the real app running against a Monad mainnet fork.
// Each capture is a 2x screenshot of a 1440x900 viewport plus the rects of the elements the edit
// points at, so the cursor and camera in the video land on real coordinates.
//
//   CDP_LIB=<path to cdp.mjs> APP=http://localhost:3005 RPC=http://127.0.0.1:8545 node scripts/capture.mjs
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const { Browser } = await import(pathToFileURL(process.env.CDP_LIB).href);
const APP = process.env.APP || "http://localhost:3005";
const RPC = process.env.RPC || "http://127.0.0.1:8545";
const OUT = "public/shots";
mkdirSync(OUT, { recursive: true });

const POSSESSOR = "0x90F79bf6EB2c4f870365E785982E1f101E93b906"; // Foundry test account #3, unlocked on the fork
const HOLDER = "0x3D38FeE3E1a4c43d8fcF715aA6C9ff025074E7E0"; // the real holder of #1462, impersonated on the fork
const TARGET_NUMBER = "1469"; // CHOG #1469 is token 8
const TARGET_TOKEN = 8;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const rpc = (method, params) =>
  fetch(RPC, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }) }).then((r) => r.json());
await rpc("anvil_setBalance", [POSSESSOR, "0x" + (4_210_000_000_000_000_000n).toString(16)]); // 4.21 MON
await rpc("anvil_impersonateAccount", [HOLDER]);
// The app reads through scripts/rpc-proxy.mjs, which reports Monad mainnet's gas price for display.

const wallet = (acct) => `(() => {
  const acct = "${acct}";
  const rpc = (method, params) => fetch("${RPC}", { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method, params }) }).then(r => r.json()).then(j => { if (j.error) { const e = new Error(j.error.message); e.code = j.error.code; e.data = j.error.data; throw e; } return j.result; });
  window.ethereum = { isMetaMask: true,
    request: async ({ method, params }) => {
      if (method === "eth_requestAccounts" || method === "eth_accounts") return [acct];
      if (method === "eth_chainId") return "0x8f";
      if (method === "wallet_switchEthereumChain" || method === "wallet_addEthereumChain") return null;
      if (method === "wallet_requestPermissions" || method === "wallet_getPermissions") return [{ parentCapability: "eth_accounts" }];
      return rpc(method, params ?? []);
    },
    on: () => {}, removeListener: () => {} };
})();`;

// Shots not retaken this run keep their earlier capture.
const shots = existsSync(`${OUT}/shots.json`) ? JSON.parse(readFileSync(`${OUT}/shots.json`, "utf8")) : {};
const b = await Browser.launch({ width: 1440, height: 900 });

async function page(acct) {
  const p = await b.newPage({ width: 1440, height: 900, dsf: 2 });
  if (acct) await p.send("Page.addScriptToEvaluateOnNewDocument", { source: wallet(acct) });
  // Hide the scrollbar; it is not part of the product.
  await p.send("Page.addScriptToEvaluateOnNewDocument", { source: "addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent='::-webkit-scrollbar{display:none}html{scrollbar-width:none}';document.head.appendChild(s)})" });
  return p;
}
const waitFor = async (p, expr, ms = 240000) => { // generous: a cold fork reads slowly
  const end = Date.now() + ms;
  while (Date.now() < end) {
    try { if (await p.eval(expr)) return true; } catch {}
    await sleep(200);
  }
  throw new Error("timeout waiting for " + expr);
};
const rects = (p, sels) =>
  p.eval(`(() => { const o = {}; for (const [k, s] of Object.entries(${JSON.stringify(sels)})) {
    const el = typeof s === "string" && s.startsWith("text:") ? [...document.querySelectorAll("button,a,summary,.kv,.pill,.row,h1,p,span")].find(e => e.textContent.trim().startsWith(s.slice(5))) : document.querySelector(s);
    if (el) { const r = el.getBoundingClientRect(); o[k] = { x: r.x, y: r.y, w: r.width, h: r.height }; } } return o; })()`);
async function snap(p, name, sels = {}) {
  await sleep(250);
  await p.screenshot({ path: `${OUT}/${name}.png`, format: "png" });
  shots[name] = { t: Date.now(), rects: await rects(p, sels) };
  console.log("shot", name, Object.keys(shots[name].rects).join(","));
  writeFileSync(`${OUT}/shots.json`, JSON.stringify(shots, null, 1)); // saved after every shot
}
const center = (r) => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });
async function mouse(p, x, y) { await p.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y }); }
async function click(p, x, y) {
  await mouse(p, x, y);
  await p.send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
  await p.send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
}
async function connect(p, prefix) {
  // The wallet reconnects on its own when the browser already connected it once.
  await sleep(1500);
  if (await p.eval(`document.body.innerText.toLowerCase().includes("${prefix.toLowerCase()}")`)) return;
  await waitFor(p, `[...document.querySelectorAll('button')].some(b => b.textContent.startsWith('Connect wallet') && !b.disabled)`, 30000);
  await clickSel(p, "text:Connect wallet");
  await waitFor(p, `document.body.innerText.toLowerCase().includes("${prefix.toLowerCase()}")`, 30000);
}
async function clickSel(p, sel) {
  const r = (await rects(p, { t: sel })).t;
  if (!r) throw new Error("no element " + sel);
  const c = center(r);
  await click(p, c.x, c.y);
  return c;
}
const park = (p) => mouse(p, 1430, 890); // keep the real pointer out of the shot; the video draws its own

// ---------------------------------------------------------------- home and browse (no wallet)
{
  const p = await page(null);
  await p.goto(`${APP}/`, { settleMs: 3500 });
  await park(p);
  await snap(p, "home", { title: "#hero-title", button: ".hero .button", nav: "header a[href='/chogs'], a[href='/chogs']" });
  // A cold fork reads the status of all 1,969 Chogs slowly (about a second each); KEEP_BROWSE reuses the last one.
  if (!process.env.KEEP_BROWSE) {
    await p.goto(`${APP}/chogs`, { settleMs: 2000 });
    await waitFor(p, `document.querySelector('.sub')?.innerText.includes('open at')`, 240000);
    await waitFor(p, `[...document.querySelectorAll('.ctile img')].slice(0,12).every(i => i.complete && i.naturalWidth > 0)`, 60000);
    await park(p);
    await snap(p, "browse", { sub: ".sub", grid: ".cgrid", first: ".ctile" });
  }
  await p.close();
}

// ---------------------------------------------------------------- possessor
const p = await page(POSSESSOR);
await p.goto(`${APP}/about`, { settleMs: 2500 });
await connect(p, "0x90F7");

await p.goto(`${APP}/chog/1?minutes=1`, { settleMs: 3000 });
await waitFor(p, `[...document.querySelectorAll('button')].some(b => b.textContent.startsWith('Possess for 1 min') && !b.disabled)`);
await waitFor(p, `document.querySelector('.token__art img')?.complete`, 30000);
await park(p);
const tokenSels = { lease: ".lease", well: ".lease .well", possess: "text:Possess for 1 min", art: ".token__art", escrow: "#escrow-title" };
await snap(p, "token", tokenSels);

await clickSel(p, "text:Possess for 1 min");
await park(p);
await sleep(120);
await snap(p, "token-pending", tokenSels);
try {
  await waitFor(p, `location.pathname === '/possess/1'`, 60000);
} catch (e) {
  console.log("lease card says:", await p.eval(`document.querySelector('.lease')?.innerText`));
  throw e;
}
await waitFor(p, `[...document.querySelectorAll('button')].some(b => b.textContent.startsWith('Haunt #') && !b.disabled)`, 60000);
await waitFor(p, `[...document.querySelectorAll('img')].every(i => i.complete)`, 30000);
await park(p);
const sessionSels = {
  title: "h1", leasecard: ".leasecard", timer: ".leasecard .figure-lg", bar: ".leasecard .leasebar",
  haunt: ".haunt", bynumber: "text:By number", random: "text:Random open Chog", target: ".haunt__target",
  hex: "text:Hex", boo: "text:Boo", hauntbtn: "text:Haunt #", note: ".haunt .txnote",
  take: ".takeit", takebtn: ".takeit .btn--primary", revert: ".takeit .revert", reads: ".takeit .well",
};
await snap(p, "session-start", sessionSels);

// Haunt #1463 with Hex, by number.
await clickSel(p, "text:By number");
await sleep(300);
await snap(p, "session-bynumber", { ...sessionSels, field: ".haunt__find .field", find: "text:Find" });
await clickSel(p, ".haunt__find .field");
for (let i = 1; i <= TARGET_NUMBER.length; i++) {
  await p.send("Input.insertText", { text: TARGET_NUMBER[i - 1] });
  await park(p);
  await snap(p, `session-type${i}`, { ...sessionSels, field: ".haunt__find .field", find: "text:Find" });
}
await clickSel(p, "text:Find");
await waitFor(p, `document.querySelector('.haunt__tname')?.innerText.includes('${TARGET_NUMBER}')`, 20000);
await waitFor(p, `[...document.querySelectorAll('.haunt__art')].every(i => i.complete)`, 20000);
await park(p);
await snap(p, "session-found", sessionSels);
await clickSel(p, "text:Hex");
await park(p);
await snap(p, "session-hex", sessionSels);
await waitFor(p, `[...document.querySelectorAll('button')].some(b => b.textContent.startsWith('Haunt #') && !b.disabled)`, 30000);
await clickSel(p, "text:Haunt #");
await park(p);
await sleep(80);
await snap(p, "session-haunting", sessionSels);
await waitFor(p, `!!document.querySelector('.haunt .txnote .pill--pos')`, 60000);
await snap(p, "session-haunted", sessionSels);

// Try to take it.
await clickSel(p, ".takeit .btn--primary");
await park(p);
await snap(p, "session-taking", sessionSels);
await waitFor(p, `!!document.querySelector('.takeit .revert')`, 30000);
await waitFor(p, `!document.querySelector('.takeit .well .skel')`, 30000);
await snap(p, "session-taken", sessionSels);

// The timer running out: one frame per second, for the speed ramp.
let n = 0;
while (true) {
  const txt = await p.eval(`document.querySelector('.leasecard .figure-lg')?.innerText || ''`);
  await snap(p, `timer-${String(n).padStart(2, "0")}`, sessionSels);
  shots[`timer-${String(n).padStart(2, "0")}`].label = txt;
  n++;
  if (txt.startsWith("0:00") || n > 80) break;
  await sleep(700);
}
await waitFor(p, `[...document.querySelectorAll('button')].some(b => b.textContent.startsWith('Try one more haunt'))`, 30000);
await park(p);
const endedSels = { ...sessionSels, after: ".after", again: "text:Try one more haunt", possessAgain: "text:Possess again" };
await snap(p, "session-ended", endedSels);
await clickSel(p, "text:Try one more haunt");
await park(p);
await waitFor(p, `!!document.querySelector('.after .revert')`, 30000);
await snap(p, "session-expired", { ...endedSels, revert2: ".after .revert" });

// The mark on #1463.
await p.goto(`${APP}/chog/${TARGET_TOKEN}`, { settleMs: 3000 });
await waitFor(p, `[...document.querySelectorAll('.markchip')].length > 0`, 60000);
await waitFor(p, `document.querySelector('.token__art img')?.complete`, 30000);
// Bring the marks up to the middle of the screen.
await p.eval(`window.scrollTo(0, document.querySelector('#marks-title').getBoundingClientRect().top + scrollY - 420)`);
await sleep(400);
await park(p);
await snap(p, "target", { marks: "#marks-title", markrow: ".rows .row", art: ".token__art", h1: "h1" });
await p.close();

// ---------------------------------------------------------------- holder claims
{
  const h = await page(HOLDER);
  await h.goto(`${APP}/about`, { settleMs: 2500 });
  await connect(h, "0x3D38");
  await h.goto(`${APP}/me`, { settleMs: 3000 });
  await waitFor(h, `[...document.querySelectorAll('button')].some(b => b.textContent.startsWith('Claim all'))`, 120000);
  await waitFor(h, `[...document.querySelectorAll('img')].every(i => i.complete)`, 30000);
  await park(h);
  const meSels = { escrow: ".escrowcard", figure: ".escrowcard .figure-lg", claim: "text:Claim all", table: ".table", title: "h1" };
  await snap(h, "me", meSels);
  await clickSel(h, "text:Claim all");
  await park(h);
  await sleep(80);
  await snap(h, "me-claiming", meSels);
  await waitFor(h, `!!document.querySelector('.escrowcard .txnote .pill--pos')`, 60000);
  await snap(h, "me-claimed", { ...meSels, note: ".escrowcard .txnote" });

  // The claim page: three checks on #1462.
  await h.goto(`${APP}/proof`, { settleMs: 3000 });
  await park(h);
  const proofSels = { claim: ".claim", checks: ".checks", run: "text:Run the three checks", contract: "#contract-h", first: ".check" };
  await snap(h, "proof", proofSels);
  await clickSel(h, "text:Run the three checks");
  await park(h);
  await snap(h, "proof-running", proofSels);
  await waitFor(h, `document.querySelectorAll('.check .pill--pos').length >= 3`, 60000);
  await snap(h, "proof-done", proofSels);
  await h.close();
}

writeFileSync(`${OUT}/shots.json`, JSON.stringify(shots, null, 1));
await b.close();
console.log("done", Object.keys(shots).length, "shots");
process.exit(0);
