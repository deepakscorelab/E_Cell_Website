"use client";

import { useEffect, useRef, useState } from "react";
import { cldThumb } from "@/context/E-Summit-27/TeamData";

type TeamPhotoProps = {
  src: string;
  name: string;
  /** Cloudinary thumbnail width (400 for grid cards, 960 for OC cards). */
  width?: number;
  eager?: boolean;
  imgClassName?: string;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

/** 4:5 photo frame (aspect-ratio reserves space → no layout shift) with an initials fallback. */
export default function TeamPhoto({ src, name, width = 400, eager = false, imgClassName = "" }: TeamPhotoProps) {
  const [failed, setFailed] = useState(!src);
  const imgRef = useRef<HTMLImageElement>(null);

  // The server-rendered <img> can fail before React attaches onError (during hydration),
  // so check once on mount: finished loading but has no pixels = broken.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  return (
    <div className="e27t-photo">
      {failed ? (
        <span
          className="flex h-full w-full items-center justify-center font-[family-name:var(--e27-font-heading)] text-5xl text-[var(--e27-lavender)]"
          role="img"
          aria-label={name}
        >
          {initials(name)}
        </span>
      ) : (
        <img
          ref={imgRef}
          src={cldThumb(src, width)}
          srcSet={width < 960 ? `${cldThumb(src, width)} 1x, ${cldThumb(src, Math.min(width * 2, 960))} 2x` : undefined}
          alt={name}
          width={width}
          height={Math.round(width * 1.25)}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onError={() => setFailed(true)}
          className={imgClassName}
        />
      )}
    </div>
  );
}