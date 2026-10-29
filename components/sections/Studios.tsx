'use client';

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef } from 'react';
import { STUDIOS } from '@/lib/content';
import { clamp } from '@/lib/flight';
import { ArrowLeft, ArrowRight } from '../ui/Icons';
import { Numeral, Shards } from '../ui/Decor';

export default function Studios() {
  const track = useRef<HTMLDivElement>(null);
  const prog = useRef<HTMLDivElement>(null);

  // coverflow: cards rotate in 3D by their distance from the center
  const update = useCallback(() => {
    const tr = track.current;
    if (!tr) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tw = tr.clientWidth, mid = tr.scrollLeft + tw / 2;
    tr.querySelectorAll<HTMLElement>('.scard-in').forEach((c) => {
      const art = c.parentElement as HTMLElement;
      const d = clamp((art.offsetLeft + art.offsetWidth / 2 - mid) / (tw * 0.6), -1.4, 1.4);
      c.style.transform = reduced ? 'none' : `rotateY(${(-d * 16).toFixed(2)}deg) translateZ(${(-Math.abs(d) * 90).toFixed(1)}px) scale(${(1 - Math.abs(d) * 0.05).toFixed(3)})`;
    });
    const max = tr.scrollWidth - tw;
    if (prog.current) prog.current.style.transform = `scaleX(${(0.15 + 0.85 * (max > 0 ? tr.scrollLeft / max : 1)).toFixed(3)})`;
  }, []);

  useEffect(() => {
    const tr = track.current;
    if (!tr) return;
    let queued = false;
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        update();
      });
    };
    // drag to scroll with a mouse
    let down = false, sx = 0, sl = 0, moved = false;
    const pd = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; sx = e.clientX; sl = tr.scrollLeft; tr.dataset.drag = '1';
    };
    const pm = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - sx;
      if (Math.abs(dx) > 4) moved = true;
      tr.scrollLeft = sl - dx;
    };
    const pu = () => {
      if (!down) return;
      down = false;
      tr.dataset.drag = '0';
    };
    const click = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    };
    tr.addEventListener('scroll', onScroll, { passive: true });
    tr.addEventListener('pointerdown', pd);
    window.addEventListener('pointermove', pm);
    window.addEventListener('pointerup', pu);
    tr.addEventListener('click', click, true);
    window.addEventListener('resize', update);
    update();
    return () => {
      tr.removeEventListener('scroll', onScroll);
      tr.removeEventListener('pointerdown', pd);
      window.removeEventListener('pointermove', pm);
      window.removeEventListener('pointerup', pu);
      tr.removeEventListener('click', click, true);
      window.removeEventListener('resize', update);
    };
  }, [update]);

  const step = (dir: number) => {
    const tr = track.current;
    if (!tr) return;
    const card = tr.querySelector<HTMLElement>('.scard');
    tr.scrollBy({ left: dir * (card ? card.offsetWidth + 24 : 360), behavior: 'smooth' });
  };

  return (
    <section className="sec tone-dark curve overflow-hidden" id="studios" data-tone="dark" aria-labelledby="studio-h" style={{ paddingBottom: 'calc(var(--curve) + clamp(88px, 10vw, 168px))' }}>
      <svg className="halftone" data-parallax="0.1" viewBox="0 0 400 400" aria-hidden="true">
        <defs>
          <radialGradient id="ht-g" cx="100%" cy="100%" r="100%">
            <stop offset="0" stopColor="#ffffff" stopOpacity=".9" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <pattern id="ht-p" width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="6" cy="6" r="1.6" fill="#63B7B7" />
          </pattern>
          <mask id="ht-m">
            <rect width="400" height="400" fill="url(#ht-g)" />
          </mask>
        </defs>
        <rect width="400" height="400" fill="url(#ht-p)" mask="url(#ht-m)" />
      </svg>
      <Numeral n="04" />
      <Shards set="b" dark />
      <div className="wrap sec-head" style={{ marginBottom: 40 }}>
        <div>
          <div className="idx mono" data-reveal>
            04 — Capabilities
          </div>
          <h2 className="h2 grad-dark" id="studio-h" data-mask>
            Specialist studios. <span className="serif">Built to deliver.</span>
          </h2>
        </div>
        <div className="flex flex-col items-start gap-6">
          <p className="lede" data-reveal>
            Ultimateteam brings together specialist studios with distinct capabilities, working as one ecosystem to build, secure, and scale.
          </p>
          <div className="arrows">
            <button className="arw" type="button" aria-label="Previous studio" onClick={() => step(-1)}>
              <ArrowLeft size={18} />
            </button>
            <button className="arw" type="button" aria-label="Next studio" onClick={() => step(1)}>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
      <div className="track" ref={track} data-cursor="Drag" role="list">
        {STUDIOS.map((s) => (
          <article key={s.num} className="scard" role="listitem">
            <div className="scard-in" style={{ background: s.color }}>
              {s.img && <img className="scard-img" src={s.img} alt={s.alt} />}
              <svg className="scard-glyph" viewBox="0 0 100 100" fill="none" stroke="#fff" strokeWidth=".6" aria-hidden="true">
                <circle cx="50" cy="50" r="48" />
                <circle cx="50" cy="50" r="36" />
                <circle cx="50" cy="50" r="24" />
              </svg>
              <div className="scard-shade" />
              <div className="scard-top">
                <span className="scard-num">{s.num}</span>
                <span className="scard-cap">{s.cap}</span>
              </div>
              <h3 className="scard-name">
                {s.logo ? <img className="scard-logo" src={s.logo} alt={s.name} /> : s.name}
              </h3>
              <p className="scard-desc">{s.desc}</p>
              <div className="scard-with">
                <span>{s.withLabel}</span>
                {s.withLogo ? <img className="scard-with-logo" src={s.withLogo} alt={s.with} data-shape={s.withLogo.includes('aimtomite') ? 'square' : s.withLogo.includes('lookitin') ? 'mid' : 'wide'} /> : <b>{s.with}</b>}
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="prog" aria-hidden="true">
        <div className="prog-in" ref={prog} />
      </div>
    </section>
  );
}
