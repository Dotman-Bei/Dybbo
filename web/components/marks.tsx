// The three preset marks (F-HT-02), drawn flat with a black outline.
import { MARKS } from "@/lib/config";

// Dybbo's two colours and white; the shapes tell the marks apart.
const FILL = ["#ffffff", "#0c1f17", "#3ddc97"];

export function MarkGlyph({ id, size = 24, title }: { id: number; size?: number; title?: string }) {
  const label = title ?? MARKS[id]?.name ?? "Mark";
  const common = { stroke: "#0c1f17", strokeWidth: 2.4, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label={label}>
      {id === 0 && (
        <>
          <path d="M10 42V21C10 12.7 16.3 6 24 6s14 6.7 14 15v21l-4.7-4-4.6 4-4.7-4-4.7 4-4.6-4L10 42Z" fill={FILL[0]} {...common} />
          <ellipse cx="18.5" cy="21" rx="2.6" ry="3.6" fill="#0c1f17" />
          <ellipse cx="29.5" cy="21" rx="2.6" ry="3.6" fill="#0c1f17" />
        </>
      )}
      {id === 1 && (
        <>
          <path
            d="M6 8h36v9c0 3-2.6 4.4-4.6 3-1.7 3.8-1.7 9.5-1.7 13a3.7 3.7 0 0 1-7.4 0c0-4.4-.4-8.3-1.6-10.7-1.1 2.2-1.4 5-1.4 7.2a3.3 3.3 0 0 1-6.6 0c0-3.2-.6-6.4-2.4-8.6C14.3 22 12 21 10.6 19.7 8.3 21 6 19.6 6 17V8Z"
            fill={FILL[1]}
            {...common}
          />
          <circle cx="16" cy="38" r="2.6" fill={FILL[1]} {...common} />
        </>
      )}
      {id === 2 && (
        <>
          <circle cx="24" cy="24" r="18" fill={FILL[2]} {...common} />
          <path
            d="M24 24.5c0-1.6 2.6-1.6 2.6.4 0 2.8-4.1 3.6-5.9 1.2-2.4-3.2.4-7.9 4.7-7.6 5.4.4 7.4 7 4.3 10.9-4 5.1-12.6 3.9-14.5-2.6-2.1-7.2 4.4-14.2 12.4-12.1"
            fill="none"
            stroke="#0c1f17"
            strokeWidth={2.6}
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

export function DybboMark({ size = 28 }: { size?: number }) {
  // A slime-green body with a bite taken out of it: something has moved in.
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 2a14 14 0 1 0 13.6 10.7A6 6 0 0 1 21.3 4 14 14 0 0 0 16 2Z" fill="#3ddc97" stroke="#0c1f17" strokeWidth="2" />
      <circle cx="11.5" cy="15" r="2" fill="#0c1f17" />
      <circle cx="19" cy="15" r="2" fill="#0c1f17" />
    </svg>
  );
}
