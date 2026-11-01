"use client";

import { useRef, useState } from "react";
import Reveal from "../Reveal";
import MemberCard from "./MemberCard";
import type { DepartmentGroup } from "@/context/E-Summit-27/teamGroups";

type Props = { groups: DepartmentGroup[] };

/** Sticky chips + department blocks. The only stateful part of the Team page. */
export default function DepartmentGrid({ groups }: Props) {
  const [active, setActive] = useState<string>("all");
  const sectionRef = useRef<HTMLElement>(null);

  const visible = active === "all" ? groups : groups.filter((g) => g.id === active);
  const total = groups.reduce((n, g) => n + g.members.length, 0);
  const shownCount = visible.reduce((n, g) => n + g.members.length, 0);
  const activeLabel = active === "all" ? "all departments" : groups.find((g) => g.id === active)?.label ?? "";

  const select = (id: string) => {
    setActive(id);
    // If the user is already scrolled deep into the grid, bring the top of it back into view (one-off, on click).
    const el = sectionRef.current;
    if (el && el.getBoundingClientRect().top < 0) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 64, behavior: reduce ? "auto" : "smooth" });
    }
  };

  return (
    // Not using e27-section here: its `contain: paint` + content-visibility would fight the sticky chip bar.
    <section ref={sectionRef} aria-labelledby="e27t-heads-title" className="relative pb-24">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-6 sm:px-6 lg:px-8">
        <Reveal>
          <p className="e27-label mb-4">Department Heads</p>
          <h2 id="e27t-heads-title" className="e27-heading text-4xl sm:text-5xl">
            The people who <span className="text-white">ignite it</span>
          </h2>
        </Reveal>
      </div>

      {/* Sticky filter bar: solid background, no backdrop blur */}
      <div className="e27t-chipbar">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="e27t-chips" role="toolbar" aria-label="Filter heads by department">
            <button type="button" className="e27t-chip" aria-pressed={active === "all"} onClick={() => select("all")}>
              All <span className="opacity-70">({total})</span>
            </button>
            {groups.map((g) => (
              <button
                key={g.id}
                type="button"
                className="e27t-chip"
                aria-pressed={active === g.id}
                onClick={() => select(g.id)}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        Showing {shownCount} heads in {activeLabel}
      </p>

      <div className="mx-auto max-w-7xl space-y-14 px-4 pt-10 sm:px-6 lg:px-8">
        {visible.map((g) => (
          // One Reveal per department block (not per card) keeps observer count low.
          <Reveal key={g.id}>
            <div aria-labelledby={`e27t-dept-${g.id}`} role="group">
              <div className={active === "all" ? "mb-6 flex items-baseline gap-3" : "sr-only"}>
                <h3
                  id={`e27t-dept-${g.id}`}
                  className="font-[family-name:var(--e27-font-heading)] text-xl text-[var(--e27-lavender)] sm:text-2xl"
                >
                  {g.label}
                </h3>
                <span className="text-sm text-white/55">
                  {g.members.length} {g.members.length === 1 ? "head" : "heads"}
                </span>
                <span className="h-px flex-1 bg-gradient-to-r from-[var(--e27-line)] to-transparent" aria-hidden="true" />
              </div>
              <ul className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {g.members.map((m, i) => (
                  <li key={m.email || m.name}>
                    <MemberCard member={m} index={i} />
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}