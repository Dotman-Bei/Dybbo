"use client";
// The lease running out: one orange bar, the width of the time left over the lease's length.

export function LeaseBar({ start, until, now, label }: { start: number; until: number; now: number; label?: string }) {
  const total = Math.max(1, until - start);
  const left = Math.max(0, Math.min(1, (until - now) / total));
  return (
    <div
      className="leasebar"
      role="progressbar"
      aria-label={label ?? "Time left on the lease"}
      aria-valuemin={0}
      aria-valuemax={Math.round(total)}
      aria-valuenow={Math.max(0, Math.round(until - now))}
    >
      <div className="leasebar__fill" style={{ transform: `scaleX(${left})` }} />
    </div>
  );
}
