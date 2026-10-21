"use client";
// A Chog's own art, shown as-is (F-MD-06). Served through the cached image route. If every
// gateway fails, the frame stays and names the Chog, so the page still works (NF-05).
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";

export function chogSrc(id: number, w = 384) {
  return `/api/image/${id}?w=${w}`;
}

export function ChogArt({
  id,
  name,
  w = 384,
  className,
  priority,
  sizes,
}: {
  id: number;
  name: string;
  w?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed)
    return (
      <span className={`art-missing ${className ?? ""}`} role="img" aria-label={`${name}, art unavailable`}>
        {name.replace("CHOG ", "")}
      </span>
    );
  return (
    <img
      className={className}
      src={chogSrc(id, w)}
      srcSet={w >= 384 ? `${chogSrc(id, 384)} 384w, ${chogSrc(id, 640)} 640w, ${chogSrc(id, 1000)} 1000w` : undefined}
      sizes={sizes}
      width={w}
      height={w}
      alt={`${name}, Chog Genesis art`}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
      onError={() => setFailed(true)}
    />
  );
}
