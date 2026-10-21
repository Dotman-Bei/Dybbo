"use client";

export default function AppError({ error, reset }: { error: Error; reset: () => void }) {
  const rpc = /rpc|fetch|network|http/i.test(error.message);
  return (
    <div className="card">
      <h1 className="card__title">{rpc ? "Couldn't reach Monad RPC" : "Something broke on this screen"}</h1>
      <p className="muted" style={{ margin: "6px 0 14px" }}>
        {rpc ? "Reads fall back to a second RPC; both failed this time." : error.message}
      </p>
      <button className="btn btn--secondary" onClick={reset}>Retry</button>
    </div>
  );
}
