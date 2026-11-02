import { Mail } from "lucide-react";
import { FaLinkedinIn } from "react-icons/fa";
import TeamPhoto from "./TeamPhoto";
import type { Member } from "@/context/E-Summit-27/TeamData";

type MemberCardProps = { member: Member; index?: number };

/**
 * Grid card. Hover = lift (translateY), photo scale and overlay opacity only (see team.css).
 * Entrance is a cheap CSS animation (e27-rise) staggered by animation-delay, no JS per card.
 */
export default function MemberCard({ member, index = 0 }: MemberCardProps) {
  return (
    <article className="e27t-card e27-rise" style={{ animationDelay: `${(index % 8) * 60}ms` }}>
      <TeamPhoto src={member.image} name={member.name} width={400} imgClassName="e27t-card-img" />
      <div className="e27t-card-overlay" aria-hidden="true" />

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-white">{member.name}</h3>
          <p className="mt-0.5 text-xs leading-5 text-[var(--e27-lavender)]/85">{member.position}</p>
        </div>
        <div className="e27t-card-links flex shrink-0 gap-2">
          {member.linkedin && (
            <a
              href={member.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="e27t-icon-btn"
              aria-label={`${member.name} on LinkedIn`}
            >
              <FaLinkedinIn size={14} aria-hidden="true" />
            </a>
          )}
          {member.email && (
            <a href={`mailto:${member.email}`} className="e27t-icon-btn" aria-label={`Email ${member.name}`}>
              <Mail size={15} aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
