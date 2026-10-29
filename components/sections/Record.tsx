'use client';

import { useEffect, useRef, useState } from 'react';
import { INSTITUTIONS, STATS, TAGLINE } from '@/lib/content';
import { clamp } from '@/lib/flight';
import { ArrowRight } from '../ui/Icons';
import { Gridlines, Numeral, Shards } from '../ui/Decor';

const WORDS = (() => {
  const out: { t: string; serif: boolean }[] = [];
  let serif = false;
  TAGLINE.split(' ').forEach((t) => {
    if (t === '|') {
      serif = !serif;
      return;
    }
    out.push({ t, serif });
  });
  return out;
})();

export default function Record() {
  const tag = useRef<HTMLParagraphElement>(null);
  const stats = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(0);

  // words light up one by one as the paragraph scrolls through
  useEffect(() => {
    const el = tag.current;
    if (!el) return;
    const words = Array.from(el.querySelectorAll<HTMLSpanElement>('[data-w]'));
    let raf = 0;
    let lit = -1;
    const loop = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const prog = clamp((vh * 0.82 - r.top) / (r.height + vh * 0.35), 0, 1);
      const n = Math.round(prog * words.length * 1.15);
      if (n !== lit) {
        lit = n;
        words.forEach((w, i) => (w.dataset.on = i < n ? '1' : '0'));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // counters
  useEffect(() => {
    const el = stats.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setK(1);
      return;
    }
    let raf = 0;
    const io = new IntersectionObserver(
      (ents) => {
        if (!ents.some((e) => e.isIntersecting)) return;
        io.disconnect();
        const t0 = performance.now();
        const step = (now: number) => {
          const p = Math.min(1, (now - t0) / 1600);
          setK(1 - Math.pow(1 - p, 3));
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="sec tone-light curve" id="record" data-tone="light" aria-labelledby="record-h">
      <div className="mesh" aria-hidden="true">
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="blob b3" />
        <div className="mesh-grain" />
      </div>
      <Gridlines />
      <Shards set="a" />
      <Numeral n="01" />
      <div className="wrap">
        <div className="rec-head">
          <div className="rec-label">
            <div className="idx mono" data-reveal>
              01 — About
            </div>
            <h2 className="h2 grad" id="record-h" data-mask>
              The record <span className="serif">so far.</span>
            </h2>
          </div>
          <div>
            <p className="tag" ref={tag}>
              {WORDS.map((w, i) => (
                <span key={i} className={w.serif ? 'w serif' : 'w'} data-w={i}>
                  {w.t}{' '}
                </span>
              ))}
            </p>
            <div className="rec-foot" data-reveal>
              <p>Every figure computed from actuals. We are happy to walk through the source of any of them.</p>
              <a className="tlink" href="#contact">
                Learn more <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>

        <div className="stats" ref={stats}>
          {STATS.map((s, i) => (
            <div key={s.n} className="gcard stat" data-reveal style={{ transitionDelay: `${i * 90}ms` }}>
              <span className="mono text-muted">{s.n}</span>
              <span className="stat-v grad">{s.format(Math.round(s.value * k))}</span>
              <span className="stat-l">{s.label}</span>
              <span className="stat-d">{s.desc}</span>
            </div>
          ))}
        </div>

        <div className="gcard trust" data-reveal>
          <span className="trust-t">Trusted by leading Indonesian institutions</span>
          <div className="logos">
            {INSTITUTIONS.map((l) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={l.src} src={l.src} alt={l.alt} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
