"use client";

/* eslint-disable @next/next/no-img-element */
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { BRANDS } from "@/lib/content";
import { ArrowLeft, ArrowRight } from "../ui/Icons";
import { lenis } from "../Motion";

const PortfolioOrb = dynamic(() => import("../ascent/PortfolioOrb"), {
  ssr: false,
});

const N = BRANDS.length;

/** Placeholder art for a brand without a photo yet: a lens aperture in the teal range. */
const Aperture = () => (
  <svg
    className="pf-ph"
    viewBox="0 0 120 120"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >
    <defs>
      <radialGradient id="pf-ph-g" cx="35%" cy="30%">
        <stop offset="0" stopColor="#63B7B7" />
        <stop offset="1" stopColor="#053238" />
      </radialGradient>
    </defs>
    <rect width="120" height="120" fill="url(#pf-ph-g)" />
    <g
      transform="translate(60 60)"
      fill="none"
      stroke="#D9EFEE"
      strokeOpacity=".55"
    >
      <circle r="30" />
      <circle r="22" strokeOpacity=".3" />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <path key={a} d="M0-30L14-6" transform={`rotate(${a})`} />
      ))}
    </g>
  </svg>
);

/**
 * 03 Portfolio as a manual slide show: the section pins a full-screen stage
 * and its scroll range is divided into one slide per featured brand. The
 * orbit only moves while the visitor scrolls, presses ← → or uses the nav;
 * when they stop, it settles on the nearest brand. Only the active brand
 * shows its name and one-line description.
 */
export default function Brands() {
  const [active, setActive] = useState(0);
  const [sheet, setSheet] = useState<number | null>(null);
  const [gl, setGl] = useState(false);
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const slide = useRef(0);
  const spot = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const explore = useRef<(HTMLButtonElement | null)[]>([]);
  const activeRef = useRef(0);

  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      setGl(!!(c.getContext("webgl2") || c.getContext("webgl")));
    } catch {
      setGl(false);
    }
  }, []);

  // scroll position inside the pinned section -> slide position
  const geometry = useCallback(() => {
    // the pinned range is the track, which sits inside the section's breathing room
    const el = track.current!;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const range = Math.max(1, el.offsetHeight - window.innerHeight);
    return { top, range, step: range / (N - 1) };
  }, []);

  const go = useCallback(
    (i: number) => {
      const k = Math.max(0, Math.min(N - 1, i));
      const { top, step } = geometry();
      const y = top + k * step;
      if (lenis) lenis.scrollTo(y, { duration: 1.1 });
      else window.scrollTo({ top: y, behavior: "smooth" });
    },
    [geometry],
  );

  useEffect(() => {
    let raf = 0,
      idle = 0;
    const read = () => {
      raf = 0;
      const { top, range } = geometry();
      const p = Math.max(0, Math.min(1, (window.scrollY - top) / range));
      slide.current = p * (N - 1);
      const a = Math.round(slide.current);
      if (a !== activeRef.current) {
        activeRef.current = a;
        setActive(a);
      }
    };
    // settle on the nearest brand once the visitor stops inside the pinned range
    const settle = () => {
      const { top, range, step } = geometry();
      const y = window.scrollY - top;
      if (y <= 1 || y >= range - 1) return;
      const target = top + Math.round(y / step) * step;
      if (Math.abs(target - window.scrollY) > 2) {
        if (lenis) lenis.scrollTo(target, { duration: 0.7 });
        else window.scrollTo({ top: target, behavior: "smooth" });
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
      window.clearTimeout(idle);
      idle = window.setTimeout(settle, 180);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const r = track.current!.getBoundingClientRect();
      if (r.top > 1 || r.bottom < window.innerHeight - 1) return;
      if (
        e.target instanceof Element &&
        e.target.closest('input, textarea, [role="dialog"]')
      )
        return;
      e.preventDefault();
      go(activeRef.current + (e.key === "ArrowRight" ? 1 : -1));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("keydown", onKey);
    read();
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(idle);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("keydown", onKey);
    };
  }, [geometry, go]);

  // detail sheet: page scroll pauses, Escape closes, focus returns to the button that opened it
  const close = useCallback(() => {
    setSheet((i) => {
      if (i !== null)
        requestAnimationFrame(() =>
          explore.current[i]?.focus({ preventScroll: true }),
        );
      return null;
    });
  }, []);
  useEffect(() => {
    if (sheet === null) return;
    lenis?.stop();
    const t = window.setTimeout(
      () => closeBtn.current?.focus({ preventScroll: true }),
      300,
    );
    const esc = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", esc);
    return () => {
      lenis?.start();
      window.clearTimeout(t);
      window.removeEventListener("keydown", esc);
    };
  }, [sheet, close]);

  const d = sheet === null ? null : BRANDS[sheet];

  return (
    <section
      className="pf-space curve"
      id="brands"
      ref={section}
      data-tone="light"
      aria-labelledby="brand-h"
      style={{ "--n": N } as React.CSSProperties}
    >
      <div className="pf-track" ref={track}>
        <div className="pf-stage">
          <div className="pf-canvas-host">
            {gl && (
              <PortfolioOrb
                slide={slide}
                active={active}
                count={N}
                spot={spot}
              />
            )}
          </div>

          <header className="pf-title">
            <div className="idx mono">03 — Portfolio</div>
            <h2 className="h2 grad" id="brand-h">
              Brands built for <span className="serif">the real world.</span>
            </h2>
            <p className="lede">
              A growing portfolio of businesses and brands built alongside
              specialist operating partners.
            </p>
          </header>

          {/* only the active brand is named; the other planets stay plain */}
          <div className="pf-spot" ref={spot} aria-live="polite">
            {BRANDS.map((x, i) => (
              <div
                key={x.name}
                className="pf-spot-item"
                data-on={i === active ? "1" : "0"}
                aria-hidden={i !== active}
              >
                <span className="mono pf-spot-k">
                  0{i + 1} · {x.role}
                </span>
                <h3 className="pf-spot-name">
                <img className="pf-spot-logo" src={x.logo.src} alt={x.name} width={x.logo.w} height={x.logo.h} data-shape={x.logo.w / x.logo.h < 1.5 ? 'square' : x.logo.w / x.logo.h < 2.5 ? 'mid' : 'wide'} />
              </h3>
                <p className="pf-spot-line">{x.line}</p>
                <button
                  ref={(el) => {
                    explore.current[i] = el;
                  }}
                  type="button"
                  className="tlink pf-spot-btn"
                  onClick={() => setSheet(i)}
                  tabIndex={i === active ? 0 : -1}
                >
                  Explore brand <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>

          <nav className="pf-nav" aria-label="Featured brands">
            <button
              type="button"
              className="pf-arw"
              onClick={() => go(active - 1)}
              disabled={active === 0}
              aria-label="Previous brand"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="pf-dots">
              {BRANDS.map((x, i) => (
                <button
                  key={x.name}
                  type="button"
                  className="pf-dot"
                  data-on={i === active ? "1" : "0"}
                  onClick={() => go(i)}
                  aria-label={`Show ${x.name}`}
                  aria-current={i === active ? "true" : undefined}
                />
              ))}
            </div>
            <span className="pf-count mono" aria-hidden="true">
              0{active + 1} / 0{N}
            </span>
            <button
              type="button"
              className="pf-arw"
              onClick={() => go(active + 1)}
              disabled={active === N - 1}
              aria-label="Next brand"
            >
              <ArrowRight size={18} />
            </button>
          </nav>
          <p className="pf-hint mono" aria-hidden="true">
            Scroll or use ← → to explore
          </p>

          {d && (
            <div
              className="pf-sheet"
              role="dialog"
              aria-modal="true"
              aria-labelledby="pf-sheet-h"
            >
              <div className="pf-sheet-bg" onClick={close} />
              <div className="pf-card" data-lenis-prevent key={sheet}>
                <div className="pf-card-text">
                  <div className="pf-sheet-top">
                    <span className="mono pf-d-kicker">
                      Featured brand · 0{(sheet ?? 0) + 1} · {d.studio}
                    </span>
                    <button
                      ref={closeBtn}
                      type="button"
                      className="pf-back"
                      onClick={close}
                      aria-label="Close brand details"
                    >
                      <ArrowLeft size={20} />
                    </button>
                  </div>
                  <img className="pf-sheet-logo" src={d.logo.src} alt="" width={d.logo.w} height={d.logo.h} data-shape={d.logo.w / d.logo.h < 1.5 ? 'square' : d.logo.w / d.logo.h < 2.5 ? 'mid' : 'wide'} />
                <h3 className="pf-d-name" id="pf-sheet-h">
                    {d.name}
                  </h3>
                  <p>{d.desc}</p>
                  <dl className="pf-facts">
                    {d.facts.map(([k, v]) => (
                      <div key={k}>
                        <dt className="mono">{k}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="pf-ctas">
                    <a className="btn btn-teal" href="#contact" onClick={close}>
                      Enquire through us
                      <span className="ic">
                        <ArrowRight />
                      </span>
                    </a>
                    <a
                      className="tlink"
                      href={`https://${d.site}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {d.site} <ArrowRight size={14} />
                    </a>
                  </div>
                </div>
                <div className="pf-card-img">
                  {d.img ? <img src={d.img} alt={d.alt} /> : <Aperture />}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
