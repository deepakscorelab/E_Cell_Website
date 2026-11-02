import type { Metadata } from "next";
import "./team.css";
import TeamHero from "@/components/E-Summit-27/team/TeamHero";
import OcCard from "@/components/E-Summit-27/team/OcCard";
import MemberCard from "@/components/E-Summit-27/team/MemberCard";
import DepartmentGrid from "@/components/E-Summit-27/team/DepartmentGrid";
import Reveal from "@/components/E-Summit-27/Reveal";
import { coreTeamMembers, headMembers, coordinatorMembers } from "@/context/E-Summit-27/TeamData";
import { groupHeads } from "@/context/E-Summit-27/teamGroups";

export const metadata: Metadata = {
  title: "Our Team | E-Summit'27 | IIT Ropar",
  description:
    "Meet the student team of E-Cell IIT Ropar behind E-Summit'27: overall coordinators and department heads igniting the unwritten.",
};

export default function TeamPage() {
  const groups = groupHeads(headMembers); // computed on the server, passed as plain data

  return (
    <main id="top">
      <TeamHero />

      {/* Organising Committee */}
      <section
        aria-labelledby="e27t-oc-title"
        className="e27-section px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
        style={{ containIntrinsicSize: "auto 1000px" }}
      >
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <h2 id="e27t-oc-title" className="e27-heading text-4xl sm:text-5xl">
              Overall <span className="text-white">Coordinators</span>
            </h2>
          </Reveal>
          <Reveal delay={0.08} className="mt-12 grid gap-8 sm:grid-cols-2 lg:gap-10">
            {coreTeamMembers.map((m) => (
              <OcCard key={m.email || m.name} member={m} />
            ))}
          </Reveal>
        </div>
      </section>

      {/* Department heads with filter chips (client) */}
      <DepartmentGrid groups={groups} />

      {/* Coordinators: renders only once TeamData has entries */}
      {coordinatorMembers.length > 0 && (
        <section
          aria-labelledby="e27t-coord-title"
          className="e27-section px-4 pb-20 sm:px-6 lg:px-8"
          style={{ containIntrinsicSize: "auto 900px" }}
        >
          <div className="mx-auto max-w-7xl">
            <Reveal>
              <h2 id="e27t-coord-title" className="e27-heading text-3xl sm:text-4xl">
                Coordinators
              </h2>
            </Reveal>
            <Reveal delay={0.05}>
              <ul className="mt-8 grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {coordinatorMembers.map((m, i) => (
                  <li key={m.email || m.name}>
                    <MemberCard member={m} index={i} />
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>
      )}
    </main>
  );
}
