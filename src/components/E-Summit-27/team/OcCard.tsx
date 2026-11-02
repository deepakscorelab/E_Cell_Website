"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { observeMotionActivity } from "../motionActivity";
import { cldThumb } from "@/context/E-Summit-27/TeamData";
import { asset } from "@/context/E-Summit-27/constants";
import { Mail } from "lucide-react";
import { FaLinkedinIn } from "react-icons/fa";
import TeamPhoto from "./TeamPhoto";
import type { Member } from "@/context/E-Summit-27/TeamData";

const Lanyard = dynamic(() => import("./Lanyard"), { ssr: false });

/** Accessible coordinator information accompanies the draggable 3D badge. */
export default function OcCard({ member }: { member: Member }) {
  const host = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => { setFailed(true); setReady(false); }, []);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    return observeMotionActivity(element, active => {
      if (active) setMounted(true);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setMounted(false);
        setReady(false);
      }
    }, "100px");
  }, []);
  return (
    <article ref={host} className="e27-lanyard-card e27-glass">
      <div className="e27-lanyard-stage" data-ready={ready}>
        {!ready && <div className="e27-lanyard-fallback">
          <TeamPhoto src={member.image} name={member.name} width={960} />
        </div>}
        {mounted && !failed && <Lanyard frontImage={cldThumb(member.image, 960)}
          backImage={asset("esummit27-wordmark.webp")} imageFit="cover" cardColor="#170728"
          strapColor="#6211bf" strapImage={asset("esummit27-wordmark.webp")}
          metal="silver" finish="matte" size={0.68} strapLength={0.35}
          breeze={0} damping={0.65} accessibleName={`${member.name} coordinator badge`}
          onReady={onReady} onError={onError} />}
      </div>
      <div className="px-6 pb-8 text-center">
        {ready && <p className="mb-4 text-xs text-white/60">Drag to swing · Click or press Enter to flip</p>}
            <span className="inline-block rounded-full border border-[rgba(245,212,254,0.4)] bg-[#050008]/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--e27-lavender)]">
              {member.position}
            </span>
            <h3 className="mt-3 font-[family-name:var(--e27-font-heading)] text-3xl text-white sm:text-4xl">
              {member.name}
            </h3>
            <div className="mt-5 flex justify-center gap-3">
              {member.linkedin && (
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="e27t-icon-btn !h-11 !w-11"
                  aria-label={`${member.name} on LinkedIn`}
                >
                  <FaLinkedinIn size={17} aria-hidden="true" />
                </a>
              )}
              {member.email && (
                <a
                  href={`mailto:${member.email}`}
                  className="e27t-icon-btn !h-11 !w-11"
                  aria-label={`Email ${member.name}`}
                >
                  <Mail size={18} aria-hidden="true" />
                </a>
              )}
            </div>
      </div>
    </article>
  );
}