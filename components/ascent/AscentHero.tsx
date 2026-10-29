'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PHASES, SKY_TOP, flight, mixHex, phaseIndex, ss } from '@/lib/flight';
import { ArrowRight } from '../ui/Icons';

gsap.registerPlugin(ScrollTrigger);

const AscentScene = dynamic(() => import('./AscentScene'), { ssr: false });

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/** Chapters: [from, to] progress windows. Copy is from the original hero. */
const CHAPTERS = [
  { from: 0.2, to: 0.4, dark: false, label: 'Through the clouds', big: ['We build consumer brands', 'and the systems behind them.'] },
  { from: 0.47, to: 0.66, dark: true, label: 'Above the horizon', big: ['Five studios,', 'and the specialists who lead them.'] },
  { from: 0.72, to: 0.88, dark: true, label: 'Stage separation', big: ['One', 'connected ecosystem.'], small: 'Each studio carries its own expertise. Together they reach further.' },
];

export default function AscentHero() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [gl, setGl] = useState<boolean | null>(null);

  useEffect(() => {
    setGl(hasWebGL());
  }, []);

  useEffect(() => {
    const el = root.current;
    const st = stage.current;
    if (!el || !st) return;
    const q = <T extends Element>(s: string) => el.querySelector<T>(s);
    const qa = <T extends Element>(s: string) => Array.from(el.querySelectorAll<T>(s));
    const hud = qa<HTMLElement>('[data-hud]');
    const frame = q<HTMLElement>('.frame');
    const cue = q<HTMLElement>('.cue');
    const numEl = q<HTMLElement>('#hud-num'), phEl = q<HTMLElement>('#hud-ph'), bar = q<HTMLElement>('.hud-bar i'), marker = q<HTMLElement>('.marker');
    const bottom = qa<HTMLElement>('[data-fade-out]');
    const chs = qa<HTMLElement>('.ch');
    const flash = q<HTMLElement>('.flash');
    const skyfb = q<HTMLElement>('.sky-fallback');
    const canvasHost = q<HTMLElement>('[data-canvas]');

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (s) => (flight.target = s.progress),
    });

    const onMove = (ev: PointerEvent) => {
      const r = st.getBoundingClientRect();
      flight.tmx = ((ev.clientX - r.left) / r.width) * 2 - 1;
      flight.tmy = ((ev.clientY - r.top) / r.height) * 2 - 1;
    };
    const onLeave = () => {
      flight.tmx = 0;
      flight.tmy = 0;
    };
    st.addEventListener('pointermove', onMove);
    st.addEventListener('pointerleave', onLeave);

    let raf = 0;
    let ab = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!gl) flight.p += (flight.target - flight.p) * (flight.reduced ? 1 : 0.12);
      const p = flight.p;
      if (el.getBoundingClientRect().bottom < 0) {
        if (ab) {
          ab = 0;
          if (canvasHost) canvasHost.style.filter = '';
        }
        return;
      }
      const darkUi = p > 0.36 && p < 0.9;
      const ink = darkUi ? '#EEF7F6' : '#0B1E20';
      hud.forEach((h) => (h.style.color = ink));
      if (frame) frame.style.color = darkUi ? 'rgba(238,247,246,.35)' : 'rgba(11,30,32,.35)';
      if (cue) {
        cue.style.color = ink;
        cue.style.opacity = String(1 - ss(0.02, 0.08, p));
      }
      // chapter readout; fades before the next section's curve rises over the stage
      const idx = phaseIndex(p);
      if (numEl) numEl.textContent = `0${idx + 1}`;
      if (phEl && phEl.textContent !== PHASES[idx]) phEl.textContent = PHASES[idx];
      if (bar) bar.style.transform = `scaleX(${p.toFixed(3)})`;
      if (marker) marker.style.top = `${(100 - p * 100).toFixed(1)}%`;
      const keep = (1 - ss(0.84, 0.92, p)).toFixed(3);
      bottom.forEach((b) => (b.style.opacity = keep));
      chs.forEach((c, i) => {
        const a = parseFloat(c.dataset.from || '0'), b = parseFloat(c.dataset.to || '1');
        const o = i === 0 ? 1 - ss(b - 0.05, b, p) : ss(a, a + 0.05, p) * (1 - ss(b - 0.05, b, p));
        const reveal = i === 0 ? 1 : ss(a, a + 0.06, p);
        c.style.opacity = o.toFixed(3);
        c.style.clipPath = `inset(-10% -5% ${((1 - reveal) * 110).toFixed(1)}% -5%)`;
        const lift = (1 - reveal) * 30 - (i === 0 ? ss(0, b, p) * 60 : 0);
        c.style.transform = i === 0 ? `translateY(${lift.toFixed(1)}px)` : `translateY(calc(var(--cy) + ${lift.toFixed(1)}px))`;
        c.setAttribute('aria-hidden', i !== 0 && o < 0.3 ? 'true' : 'false');
      });
      if (flash) flash.style.opacity = ss(0.9, 1, p).toFixed(3);
      if (skyfb && !gl) {
        const c = mixHex(SKY_TOP, p);
        skyfb.style.background = `rgb(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)})`;
      }
      // light chromatic aberration on fast scroll
      const nextAb = Math.min(4, Math.abs(flight.velocity) * 0.12);
      if (canvasHost && Math.abs(nextAb - ab) > 0.05) {
        ab = nextAb;
        canvasHost.style.filter = ab > 0.3 ? `drop-shadow(${ab.toFixed(1)}px 0 0 rgba(255,90,90,.28)) drop-shadow(${(-ab).toFixed(1)}px 0 0 rgba(90,230,220,.28))` : '';
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      trigger.kill();
      st.removeEventListener('pointermove', onMove);
      st.removeEventListener('pointerleave', onLeave);
    };
  }, [gl]);

  return (
    <header className="ascent" id="top" ref={root}>
      <div className="stage" ref={stage}>
        <div className="sky-fallback" />
        <div data-canvas className="absolute inset-0">
          {gl && <AscentScene />}
        </div>
        <div className="grain" aria-hidden="true" />
        <div className="flash" />

        <div className="frame" aria-hidden="true" style={{ color: 'rgba(11,30,32,.35)' }}>
          <span className="cross c-tl" />
          <span className="cross c-tr" />
          <span className="cross c-bl" data-fade-out />
          <span className="cross c-br" data-fade-out />
        </div>

        <div className="hud hud-tl mono" data-hud data-fade-out aria-hidden="true">
          <span>Mission · Ascent</span>
          <span style={{ opacity: 0.6 }}>ultimate.am / 5 studios</span>
        </div>
        <div className="hud hud-bl mono" data-hud data-fade-out aria-hidden="true">
          <span>
            <b id="hud-num">01</b>
            <span style={{ opacity: 0.5 }}> / 0{PHASES.length}</span>
          </span>
          <span className="hud-bar">
            <i />
          </span>
          <span id="hud-ph" style={{ opacity: 0.7 }}>
            {PHASES[0]}
          </span>
        </div>
        <div className="hud hud-r" data-hud data-fade-out aria-hidden="true">
          <div className="scale">
            {[0, 25, 50, 75, 100].map((t) => (
              <i key={t} style={{ top: `${t}%` }} />
            ))}
            <span className="marker" style={{ top: '100%' }} />
          </div>
        </div>

        <div className="ch ch0" data-from="0" data-to="0.12" style={{ color: '#0B1E20' }}>
          <span className="mono block mb-6" style={{ opacity: 0.7 }}>
            An Indonesian group
          </span>
          <h1 className="h1">
            <span className="block">Studios that build</span>
            <span className="t-serif" style={{ color: '#0E7F86' }}>
              consumer champions.
            </span>
          </h1>
          <p className="ch-sub" style={{ color: '#4A6163' }}>
            We build consumer brands and the systems behind them — through five studios and the specialists who lead them.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <a className="btn btn-ink" href="#ecosystem" data-magnet>
              Explore our ecosystem
              <span className="ic">
                <ArrowRight />
              </span>
            </a>
          </div>
        </div>

        {CHAPTERS.map((c, i) => (
          <div key={c.label} className={`ch ch-mid ch${i + 1}`} data-from={c.from} data-to={c.to} aria-hidden="true" style={{ color: c.dark ? '#EEF7F6' : '#0B1E20', opacity: 0 }}>
            <span className="mono" style={{ opacity: 0.7 }}>
              {c.label}
            </span>
            <p className="ch-big">
              {c.big[0]} <span className="serif">{c.big[1]}</span>
            </p>
            {c.small && <p className="ch-small">{c.small}</p>}
          </div>
        ))}

        <div className="cue mono" aria-hidden="true" style={{ color: '#0B1E20' }}>
          Scroll to launch
          <i />
        </div>
      </div>
    </header>
  );
}
