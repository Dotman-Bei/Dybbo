import { MARKS } from "@/lib/config";
import { MarkGlyph } from "./marks";

export function MarkChip({ id }: { id: number }) {
  return (
    <span className="markchip">
      <MarkGlyph id={id} size={22} />
      {MARKS[id]?.name ?? "Mark"}
    </span>
  );
}
