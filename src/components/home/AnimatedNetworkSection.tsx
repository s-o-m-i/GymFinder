"use client";

import {
  ECOSYSTEM_NETWORK_PATHS,
  ECOSYSTEM_NETWORK_VIEWBOX,
  ECOSYSTEM_NODES,
} from "@/lib/ecosystem-network-data";
import { cn } from "@/lib/utils";

export function AnimatedNetworkSection() {
  const { width, height, centerX } = ECOSYSTEM_NETWORK_VIEWBOX;

  return (
    <section
      id="animated-network"
      data-section="ecosystem-network"
      data-ecosystem-network
      className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 20%, rgba(255,106,61,0.06), transparent 45%), radial-gradient(circle at 15% 80%, rgba(11,37,69,0.04), transparent 40%), radial-gradient(circle at 85% 60%, rgba(255,106,61,0.05), transparent 38%)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
          <div data-reveal className="text-center lg:text-left">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#FF6A3D]">
              Animated Network
            </p>
            <h2 className="font-heading mb-4 text-2xl font-bold text-[#0B2545] sm:text-3xl lg:text-4xl">
              One Platform. Every Connection.
            </h2>
            <p className="mx-auto max-w-lg text-sm leading-relaxed text-[#5a6b7d] sm:text-base lg:mx-0">
              Users, trainers, gyms, success stories, and events — linked in a living ecosystem.
              Every touchpoint flows into the next, powering Pakistan&apos;s fitness community.
            </p>

            <ul className="mt-8 hidden flex-col gap-3 lg:flex">
              {ECOSYSTEM_NODES.map((node, index) => (
                <li
                  key={node.id}
                  data-network-legend
                  className="flex items-start gap-3 rounded-2xl border border-[#0B2545]/10 bg-[#F8FAFC] px-4 py-3"
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FF6A3D]/12 text-xs font-bold text-[#FF6A3D]">
                    {index + 1}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-[#0B2545]">{node.label}</span>
                    <span className="mt-0.5 block text-xs text-[#5a6b7d]">{node.description}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div
            data-reveal
            data-reveal-delay="0.08"
            className="relative mx-auto w-full max-w-md rounded-[28px] border border-[#0B2545]/10 bg-gradient-to-br from-[#F4F7FB] via-white to-[#EEF2F7] p-4 shadow-[0_24px_80px_rgba(11,37,69,0.08)] sm:p-6 lg:max-w-lg"
          >
            <div
              data-network-stage
              className="relative mx-auto aspect-[420/600] w-full max-w-[340px] sm:max-w-[380px]"
            >
              <svg
                viewBox={`0 0 ${width} ${height}`}
                className="absolute inset-0 h-full w-full"
                aria-hidden
                data-network-svg
              >
                <defs>
                  <linearGradient id="ecosystem-line-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FF6A3D" stopOpacity="0.15" />
                    <stop offset="45%" stopColor="#FF6A3D" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#FFB089" stopOpacity="0.35" />
                  </linearGradient>
                  <linearGradient id="ecosystem-flow-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF6A3D" stopOpacity="0" />
                    <stop offset="50%" stopColor="#FF6A3D" stopOpacity="1" />
                    <stop offset="100%" stopColor="#FFB089" stopOpacity="0" />
                  </linearGradient>
                  <filter id="ecosystem-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <g data-network-paths>
                  {ECOSYSTEM_NETWORK_PATHS.map((path, index) => (
                    <g key={path}>
                      <path
                        d={path}
                        fill="none"
                        stroke="rgba(255,106,61,0.18)"
                        strokeWidth={1.5}
                        strokeLinecap="round"
                      />
                      <path
                        d={path}
                        fill="none"
                        stroke="url(#ecosystem-line-gradient)"
                        strokeWidth={1.75}
                        strokeLinecap="round"
                        className="ecosystem-network-line"
                        style={{ animationDelay: `${index * 0.35}s` }}
                        data-network-path
                      />
                      <path
                        d={path}
                        fill="none"
                        stroke="url(#ecosystem-flow-gradient)"
                        strokeWidth={2.25}
                        strokeLinecap="round"
                        strokeDasharray="12 140"
                        className="ecosystem-network-flow"
                        style={{ animationDelay: `${index * 0.45}s` }}
                        filter="url(#ecosystem-glow)"
                        data-network-flow
                      />
                    </g>
                  ))}
                </g>

                {ECOSYSTEM_NODES.map((node) => (
                  <circle
                    key={`pulse-${node.id}`}
                    cx={centerX}
                    cy={node.y}
                    r={28}
                    fill="none"
                    stroke="rgba(255,106,61,0.25)"
                    strokeWidth={1}
                    className="ecosystem-node-pulse"
                    data-network-pulse
                  />
                ))}
              </svg>

              {ECOSYSTEM_NODES.map((node, index) => {
                const Icon = node.icon;
                const topPercent = (node.y / height) * 100;

                return (
                  <div
                    key={node.id}
                    data-network-node
                    data-node-index={index}
                    className="absolute left-1/2 z-10 flex flex-col items-center"
                    style={{ top: `${topPercent}%`, transform: "translate(-50%, -50%)" }}
                  >
                    <div
                      className={cn(
                        "relative flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full sm:h-14 sm:w-14",
                        "border border-[#FF6A3D]/40 bg-white shadow-[0_0_24px_rgba(255,106,61,0.28)]",
                        "ring-2 ring-[#FF6A3D]/15"
                      )}
                    >
                      <span
                        data-network-node-glow
                        className="pointer-events-none absolute inset-0 rounded-full bg-[#FF6A3D]/12"
                      />
                      <Icon className="relative h-5 w-5 text-[#FF6A3D] sm:h-6 sm:w-6" strokeWidth={2} />
                    </div>
                    <span className="mt-2 whitespace-nowrap text-xs font-bold uppercase tracking-wide text-[#0B2545] sm:text-sm">
                      {node.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="mt-4 text-center text-xs text-[#5a6b7d] lg:hidden">
              Scroll-triggered glowing connections — every part of the ecosystem linked.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
