"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useId, useRef } from "react";

/**
 * Sky ribbon ornament, after Dunhuang mural motion, in the ultimate.am teal range:
 * silk ribbons with light running along them, auspicious clouds that drift
 * back and forth, single kawung batik motifs turning slowly, twinkles, and a
 * small rocket gliding along the main ribbon.
 * `layer` splits it so the footer can sandwich the wordmark between the back
 * ribbons and the front ribbon. Everything animates with transform, opacity
 * and stroke-dashoffset only.
 */

const RIBBONS = [
  { d: "M-60 150C240 60 420 205 720 122S1200 36 1500 112", w: 7, o: 0.9 },
  { d: "M-60 178C300 122 520 214 820 162S1240 92 1500 152", w: 3, o: 0.6 },
  { d: "M-60 118C200 172 480 70 760 96S1180 172 1500 80", w: 1.5, o: 0.7 },
];

// auspicious cloud: a scalloped body with two inward curls
const CLOUD =
  "M4 30C-3 30-3 20 5 19C3 8 16 3 23 11C25 1 41-1 45 10C51 3 64 7 62 17C70 17 73 26 66 30Z";
const CURLS =
  "M23 11C24 18 32 18 32 13C32 9 27 9 27 12M45 10C44 16 51 18 53 14";
const CLOUDS = [
  { x: 150, y: 46, s: 1.5, c: "sk-c1" },
  { x: 560, y: 22, s: 1.05, c: "sk-c2" },
  { x: 960, y: 54, s: 1.3, c: "sk-c3" },
  { x: 1290, y: 18, s: 0.9, c: "sk-c2" },
];

// kawung: four petals around a seed, the simplest single batik motif
const Kawung = ({ r, o = 1 }: { r: number; o?: number }) => (
  <g strokeOpacity={0.45 * o} stroke="#9FD8D6" fill="none" strokeWidth={1.1}>
    {[45, 135, 225, 315].map((a) => (
      <g key={a} transform={`rotate(${a})`}>
        <ellipse
          cy={-r * 0.56}
          rx={r * 0.3}
          ry={r * 0.46}
          fill="#9FD8D6"
          fillOpacity={0.08 * o}
        />
        <ellipse cy={-r * 0.56} rx={r * 0.11} ry={r * 0.22} />
        <circle
          cy={-r * 0.56}
          r={r * 0.035}
          fill="#D9EFEE"
          fillOpacity={0.7 * o}
          stroke="none"
        />
      </g>
    ))}
    {[0, 90, 180, 270].map((a) => (
      <circle
        key={a}
        cy={-r * 0.82}
        r={r * 0.04}
        fill="#9FD8D6"
        fillOpacity={0.6 * o}
        stroke="none"
        transform={`rotate(${a})`}
      />
    ))}
    <circle r={r * 0.09} />
    <circle r={r} strokeDasharray="1 7" strokeOpacity={0.3 * o} />
  </g>
);
const MOTIFS: [number, number, number, number][] = [
  [1240, 112, 78, 1],
  [70, 40, 26, 0.7],
  [760, 26, 20, 0.6],
];

const SPARKS: [number, number, number][] = [
  [92, 96, 0],
  [388, 64, 1.4],
  [640, 186, 2.6],
  [884, 42, 0.8],
  [1110, 140, 3.2],
  [1366, 96, 2],
];

type Props = {
  className?: string;
  layer?: "all" | "back" | "front";
  viewBox?: string;
};

export default function Skyband({
  className = "skyband",
  layer = "all",
  viewBox = "0 0 1440 220",
}: Props) {
  const back = layer !== "front",
    front = layer !== "back";
  const id = useId().replace(/:/g, "");
  const svg = useRef<SVGSVGElement>(null);

  // SMIL ignores the CSS reduced-motion rule; park the rocket mid-flight instead
  useEffect(() => {
    const el = svg.current;
    if (!el || !window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    el.setCurrentTime(7);
    el.pauseAnimations();
  }, []);

  return (
    <div className={className} aria-hidden="true">
      <svg
        ref={svg}
        className="sk-svg"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id={`${id}rb`} x1="0" x2="1">
            <stop offset="0" stopColor="#63B7B7" stopOpacity="0" />
            <stop offset=".18" stopColor="#63B7B7" />
            <stop offset=".55" stopColor="#9FD8D6" />
            <stop offset=".85" stopColor="#12959D" />
            <stop offset="1" stopColor="#12959D" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${id}tail`} x1="1" x2="0">
            <stop offset="0" stopColor="#ffffff" stopOpacity=".9" />
            <stop offset="1" stopColor="#9FD8D6" stopOpacity="0" />
          </linearGradient>
          <radialGradient id={`${id}glow`}>
            <stop offset="0" stopColor="#D9EFEE" stopOpacity=".55" />
            <stop offset="1" stopColor="#D9EFEE" stopOpacity="0" />
          </radialGradient>
          <path id={`${id}path`} d={RIBBONS[0].d} />
        </defs>

        {back &&
          MOTIFS.map(([x, y, r, o], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <g className={`sk-spin sk-s${i}`}>
                <Kawung r={r} o={o} />
              </g>
            </g>
          ))}

        {back &&
          CLOUDS.map((c, i) => (
            <g key={i} transform={`translate(${c.x} ${c.y}) scale(${c.s})`}>
              <g className={`sk-cloud ${c.c}`}>
                <path
                  d={CLOUD}
                  fill="#9FD8D6"
                  fillOpacity=".1"
                  stroke="#9FD8D6"
                  strokeOpacity=".5"
                  strokeWidth="1"
                />
                <path
                  d={CURLS}
                  fill="none"
                  stroke="#D9EFEE"
                  strokeOpacity=".55"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
              </g>
            </g>
          ))}

        {RIBBONS.map(
          (r, i) =>
            (i === 0 ? front : back) && (
              <g key={i} className={`sk-wave sk-w${i}`}>
                <path
                  d={r.d}
                  fill="none"
                  stroke={`url(#${id}rb)`}
                  strokeWidth={r.w}
                  strokeOpacity={r.o}
                  strokeLinecap="round"
                />
                <path
                  className="sk-shine"
                  d={r.d}
                  fill="none"
                  stroke="#ffffff"
                  strokeOpacity=".75"
                  strokeWidth={Math.max(1, r.w * 0.45)}
                  strokeLinecap="round"
                  pathLength={1000}
                  strokeDasharray="70 930"
                  style={{ animationDelay: `${i * -2.3}s` }}
                />
              </g>
            ),
        )}

        {front &&
          SPARKS.map(([x, y, d], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <path
                className="sk-spark"
                d="M0-7C1-1 1-1 7 0C1 1 1 1 0 7C-1 1-1 1-7 0C-1-1-1-1 0-7Z"
                fill="#D9EFEE"
                style={{ animationDelay: `${d}s` }}
              />
            </g>
          ))}

        {/* the rocket rides the main ribbon, nose along the curve */}
        {front && (
          <g className="sk-rocket" transform="scale(1.5)">
            <animateMotion
              dur="14s"
              repeatCount="indefinite"
              rotate="auto"
              keyPoints="0;1"
              keyTimes="0;1"
              calcMode="spline"
              keySplines=".45 0 .55 1"
            >
              <mpath href={`#${id}path`} />
            </animateMotion>
            <animate
              attributeName="opacity"
              dur="14s"
              repeatCount="indefinite"
              values="0;1;1;0"
              keyTimes="0;.12;.88;1"
            />
            <circle r="26" fill={`url(#${id}glow)`} />
            <path d="M-14 0L-78 -3.5L-78 3.5Z" fill={`url(#${id}tail)`} />
            <path
              d="M-4-5C-8-11-13-12-16-12C-13-7-12-5-11-3ZM-4 5C-8 11-13 12-16 12C-13 7-12 5-11 3Z"
              fill="#12959D"
            />
            <path
              d="M16 0C9-7-7-7-12-3.5L-14 0L-12 3.5C-7 7 9 7 16 0Z"
              fill="#D9EFEE"
            />
            <path
              d="M16 0C9-7-7-7-12-3.5L-14 0Z"
              fill="#ffffff"
              fillOpacity=".7"
            />
            <circle cx="4" r="2" fill="#0E7F86" />
          </g>
        )}
      </svg>
    </div>
  );
}
