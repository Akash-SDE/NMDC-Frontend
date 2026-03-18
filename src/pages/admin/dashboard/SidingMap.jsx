import React from "react";

export default function SidingMap() {
  return (
    <div className="rounded-xl border border-border-subtle bg-card p-5 sm:p-6 3xl:p-8 5xl:p-12 shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5 3xl:mb-7 5xl:mb-10">
        <h3 className="text-[18px] sm:text-[20px] 3xl:text-[24px] 5xl:text-[32px] font-bold text-brand-900">
          Siding Map & Real-time Tracking
        </h3>

        {/* Live Feed badge */}
        <div className="flex items-center gap-2 3xl:gap-2.5 5xl:gap-3 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 3xl:px-5 3xl:py-2 5xl:px-7 5xl:py-3 self-start">
          <span className="relative flex h-2.5 w-2.5 3xl:h-3 3xl:w-3 5xl:h-4 5xl:w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 3xl:h-3 3xl:w-3 5xl:h-4 5xl:w-4 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[13px] 3xl:text-[15px] 5xl:text-[20px] font-semibold text-emerald-700">
            Live Feed
          </span>
        </div>
      </div>

      {/* Map placeholder */}
      <div className="relative w-full h-[200px] sm:h-[280px] md:h-[350px] lg:h-[400px] xl:h-[450px] 3xl:h-[560px] 5xl:h-[750px] 8k:h-[1200px] rounded-lg bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden">
        {/* Background grid pattern */}
        <div className="absolute inset-0 opacity-30">
          <svg width="100%" height="100%">
            <defs>
              <pattern
                id="mapGrid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="20" cy="20" r="1.5" fill="#94a3b8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#mapGrid)" />
          </svg>
        </div>

        {/* Simulated rail lines */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 800 400"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Main horizontal rail line */}
          <line
            x1="50"
            y1="200"
            x2="750"
            y2="200"
            stroke="#cbd5e1"
            strokeWidth="3"
            strokeDasharray="12 6"
          />
          {/* Branch line 1 */}
          <line
            x1="200"
            y1="200"
            x2="200"
            y2="100"
            stroke="#cbd5e1"
            strokeWidth="2"
            strokeDasharray="8 4"
          />
          {/* Branch line 2 */}
          <line
            x1="450"
            y1="200"
            x2="450"
            y2="300"
            stroke="#cbd5e1"
            strokeWidth="2"
            strokeDasharray="8 4"
          />
          {/* Branch line 3 */}
          <line
            x1="600"
            y1="200"
            x2="650"
            y2="120"
            stroke="#cbd5e1"
            strokeWidth="2"
            strokeDasharray="8 4"
          />

          {/* Siding A node */}
          <circle cx="200" cy="100" r="12" fill="#2563eb" opacity="0.15" />
          <circle cx="200" cy="100" r="6" fill="#2563eb" />
          <text
            x="200"
            y="82"
            textAnchor="middle"
            fill="#1e3a5f"
            fontSize="11"
            fontWeight="600"
            fontFamily="Inter, sans-serif"
          >
            Siding A
          </text>

          {/* Siding B node */}
          <circle cx="450" cy="300" r="12" fill="#f97316" opacity="0.15" />
          <circle cx="450" cy="300" r="6" fill="#f97316" />
          <text
            x="450"
            y="322"
            textAnchor="middle"
            fill="#1e3a5f"
            fontSize="11"
            fontWeight="600"
            fontFamily="Inter, sans-serif"
          >
            Siding B
          </text>

          {/* Loading Point node */}
          <circle cx="650" cy="120" r="12" fill="#10b981" opacity="0.15" />
          <circle cx="650" cy="120" r="6" fill="#10b981" />
          <text
            x="650"
            y="102"
            textAnchor="middle"
            fill="#1e3a5f"
            fontSize="11"
            fontWeight="600"
            fontFamily="Inter, sans-serif"
          >
            Loading Pt
          </text>

          {/* Junction markers on main line */}
          <circle cx="200" cy="200" r="4" fill="#64748b" />
          <circle cx="450" cy="200" r="4" fill="#64748b" />
          <circle cx="600" cy="200" r="4" fill="#64748b" />

          {/* Moving rake indicator (animated via CSS) */}
          <g>
            <rect
              x="310"
              y="192"
              width="30"
              height="16"
              rx="3"
              fill="#2563eb"
              opacity="0.9"
            >
              <animate
                attributeName="x"
                values="310;380;310"
                dur="4s"
                repeatCount="indefinite"
              />
            </rect>
            <text
              x="325"
              y="204"
              textAnchor="middle"
              fill="white"
              fontSize="8"
              fontWeight="700"
              fontFamily="Inter, sans-serif"
            >
              <animate
                attributeName="x"
                values="325;395;325"
                dur="4s"
                repeatCount="indefinite"
              />
              RK772
            </text>
          </g>

          {/* Second rake */}
          <g>
            <rect
              x="520"
              y="192"
              width="30"
              height="16"
              rx="3"
              fill="#f97316"
              opacity="0.9"
            >
              <animate
                attributeName="x"
                values="520;570;520"
                dur="5s"
                repeatCount="indefinite"
              />
            </rect>
            <text
              x="535"
              y="204"
              textAnchor="middle"
              fill="white"
              fontSize="8"
              fontWeight="700"
              fontFamily="Inter, sans-serif"
            >
              <animate
                attributeName="x"
                values="535;585;535"
                dur="5s"
                repeatCount="indefinite"
              />
              RK881
            </text>
          </g>

          {/* Origin / Destination labels */}
          <text
            x="60"
            y="195"
            fill="#94a3b8"
            fontSize="10"
            fontWeight="600"
            fontFamily="Inter, sans-serif"
          >
            ORIGIN
          </text>
          <text
            x="710"
            y="195"
            fill="#94a3b8"
            fontSize="10"
            fontWeight="600"
            fontFamily="Inter, sans-serif"
          >
            DEST
          </text>
        </svg>

        {/* Legend overlay */}
        <div className="absolute bottom-3 left-3 3xl:bottom-5 3xl:left-5 5xl:bottom-7 5xl:left-7 flex items-center gap-4 3xl:gap-5 5xl:gap-7 rounded-lg bg-white/90 backdrop-blur-sm px-3 py-2 3xl:px-4 3xl:py-2.5 5xl:px-6 5xl:py-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-1.5 3xl:gap-2">
            <div className="h-2.5 w-2.5 3xl:h-3 3xl:w-3 5xl:h-4 5xl:w-4 rounded-full bg-brand-600" />
            <span className="text-[10px] 3xl:text-[12px] 5xl:text-[16px] font-medium text-slate-600">
              Active Rake
            </span>
          </div>
          <div className="flex items-center gap-1.5 3xl:gap-2">
            <div className="h-2.5 w-2.5 3xl:h-3 3xl:w-3 5xl:h-4 5xl:w-4 rounded-full bg-stat-orange-fg" />
            <span className="text-[10px] 3xl:text-[12px] 5xl:text-[16px] font-medium text-slate-600">
              In Transit
            </span>
          </div>
          <div className="flex items-center gap-1.5 3xl:gap-2">
            <div className="h-2.5 w-2.5 3xl:h-3 3xl:w-3 5xl:h-4 5xl:w-4 rounded-full bg-stat-green-fg" />
            <span className="text-[10px] 3xl:text-[12px] 5xl:text-[16px] font-medium text-slate-600">
              Loading Point
            </span>
          </div>
        </div>

        {/* Status overlay */}
        <div className="absolute top-3 right-3 3xl:top-5 3xl:right-5 5xl:top-7 5xl:right-7 rounded-lg bg-white/90 backdrop-blur-sm px-3 py-2 3xl:px-4 3xl:py-2.5 5xl:px-6 5xl:py-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 3xl:gap-4 5xl:gap-6">
            <div className="text-center">
              <p className="text-[16px] 3xl:text-[20px] 5xl:text-[26px] font-bold text-brand-600">
                4
              </p>
              <p className="text-[9px] 3xl:text-[11px] 5xl:text-[14px] font-medium text-slate-500 uppercase tracking-wide">
                Active
              </p>
            </div>
            <div className="h-8 3xl:h-10 w-px bg-slate-200" />
            <div className="text-center">
              <p className="text-[16px] 3xl:text-[20px] 5xl:text-[26px] font-bold text-stat-orange-fg">
                2
              </p>
              <p className="text-[9px] 3xl:text-[11px] 5xl:text-[14px] font-medium text-slate-500 uppercase tracking-wide">
                Transit
              </p>
            </div>
            <div className="h-8 3xl:h-10 w-px bg-slate-200" />
            <div className="text-center">
              <p className="text-[16px] 3xl:text-[20px] 5xl:text-[26px] font-bold text-stat-green-fg">
                3
              </p>
              <p className="text-[9px] 3xl:text-[11px] 5xl:text-[14px] font-medium text-slate-500 uppercase tracking-wide">
                Loading
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
