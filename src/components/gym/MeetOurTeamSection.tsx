"use client";

import { useState } from "react";
import Image from "next/image";
import type { StaffMember } from "@prisma/client";
import { Award, ChevronLeft, ChevronRight, Trophy, UserCircle, Users } from "lucide-react";
import { Navigation, A11y } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  parseAchievements,
  parseCertifications,
} from "@/lib/staff-members";
import { cn } from "@/lib/utils";
import "swiper/css";
import "swiper/css/navigation";

const BIO_CHAR_LIMIT = 120;

interface MeetOurTeamSectionProps {
  members: StaffMember[];
  className?: string;
}

function MemberBio({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > BIO_CHAR_LIMIT;

  return (
    <div className="mt-3">
      <p
        className={cn(
          "text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-line break-words",
          !expanded && isLong && "line-clamp-3"
        )}
      >
        {text}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="text-xs font-semibold text-[#FF6A3D] mt-1 hover:underline focus:outline-none"
        >
          {expanded ? "See less" : "See more"}
        </button>
      )}
    </div>
  );
}

function TeamMemberCard({ member }: { member: StaffMember }) {
  const certifications = parseCertifications(member.certifications);
  const achievements = parseAchievements(member.achievements);

  return (
    <article className="h-full bg-white border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-[#FF6A3D]/20 transition-all">
      <div className="relative aspect-[4/3] bg-[#0B2545]/5">
        {member.profileImage ? (
          <Image
            src={member.profileImage}
            alt={member.fullName}
            fill
            className="object-cover object-top"
            sizes="(max-width: 640px) 100vw, 50vw"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0B2545]/10 to-[#FF6A3D]/5">
            <UserCircle className="w-20 h-20 text-[#0B2545]/30" />
          </div>
        )}
        {member.isCoach && (
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#FF6A3D] text-white text-[10px] font-bold uppercase tracking-wide rounded-md shadow">
            Coach
          </span>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-heading font-bold text-lg text-[#0B2545]">{member.fullName}</h3>
        <p className="text-sm font-semibold text-[#FF6A3D] mt-0.5">{member.designation}</p>

        {member.yearsExperience !== null && (
          <p className="text-xs text-[var(--text-muted)] mt-2">
            {member.yearsExperience}+ years experience
            {member.specialization ? ` · ${member.specialization}` : ""}
          </p>
        )}

        {member.bio && <MemberBio text={member.bio} />}

        {certifications.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)] mb-3">
              <Award className="w-3.5 h-3.5 text-[#FF6A3D]" />
              Certifications
            </div>
            <ul className="space-y-2">
              {certifications.map((cert) => (
                <li
                  key={cert.id}
                  className="flex items-center gap-3 text-sm text-[var(--text-muted)]"
                >
                  {cert.imageUrl ? (
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-[var(--border)] shrink-0">
                      <Image
                        src={cert.imageUrl}
                        alt={cert.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-[#FF6A3D] shrink-0" />
                  )}
                  <span>{cert.name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {achievements.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)] mb-3">
              <Trophy className="w-3.5 h-3.5 text-[#FF6A3D]" />
              Achievements
            </div>
            <ul className="space-y-2">
              {achievements.map((achievement) => (
                <li
                  key={achievement.id}
                  className="flex items-start gap-2 text-sm text-[var(--text-muted)]"
                >
                  <Trophy className="w-3.5 h-3.5 text-[#FF6A3D] shrink-0 mt-0.5" />
                  <span className="whitespace-pre-line break-words break-all">
                    {achievement.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {(member.instagramUrl || member.facebookUrl || member.linkedinUrl) && (
          <div className="flex flex-wrap gap-2 mt-4">
            {member.instagramUrl && (
              <a
                href={member.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-[#0B2545] hover:text-[#FF6A3D] transition-colors"
              >
                Instagram
              </a>
            )}
            {member.facebookUrl && (
              <a
                href={member.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-[#0B2545] hover:text-[#FF6A3D] transition-colors"
              >
                Facebook
              </a>
            )}
            {member.linkedinUrl && (
              <a
                href={member.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-[#0B2545] hover:text-[#FF6A3D] transition-colors"
              >
                LinkedIn
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export function MeetOurTeamSection({ members, className }: MeetOurTeamSectionProps) {
  const activeMembers = members.filter((m) => m.isActive);
  if (activeMembers.length === 0) return null;

  const showNavigation = activeMembers.length > 1;

  return (
    <section className={className}>
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-[#FF6A3D]" />
              <h2 className="font-heading font-bold text-xl text-[var(--text)]">Meet Our Team</h2>
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              Coaches and staff ready to help you reach your goals.
            </p>
          </div>

          {showNavigation && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                aria-label="Previous team member"
                className="team-swiper-prev inline-flex items-center justify-center w-9 h-9 rounded-full border border-[var(--border)] bg-white text-[#0B2545] hover:border-[#FF6A3D]/40 hover:text-[#FF6A3D] transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                aria-label="Next team member"
                className="team-swiper-next inline-flex items-center justify-center w-9 h-9 rounded-full border border-[var(--border)] bg-white text-[#0B2545] hover:border-[#FF6A3D]/40 hover:text-[#FF6A3D] transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        <Swiper
          modules={[Navigation, A11y]}
          navigation={
            showNavigation
              ? {
                  prevEl: ".team-swiper-prev",
                  nextEl: ".team-swiper-next",
                }
              : false
          }
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            640: {
              slidesPerView: Math.min(2, activeMembers.length),
            },
          }}
          watchOverflow
          className="team-swiper"
        >
          {activeMembers.map((member) => (
            <SwiperSlide key={member.id} className="!h-auto">
              <TeamMemberCard member={member} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
