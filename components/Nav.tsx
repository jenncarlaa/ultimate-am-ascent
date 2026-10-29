'use client';

import { useEffect, useRef, useState } from 'react';
import { NAV_LINKS } from '@/lib/content';
import { flight } from '@/lib/flight';
import { ArrowRight } from './ui/Icons';

/**
 * Floating nav. Uses the original logo: white on dark backgrounds,
 * teal on light ones. Tone follows the section under the nav, and
 * inside the hero it follows the sky (light at the pad, dark in space).
 */
export default function Nav() {
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const nav = ref.current;
    if (!nav) return;
    let raf = 0;
    const update = () => {
      const hero = document.getElementById('top');
      const heroBottom = hero ? hero.getBoundingClientRect().bottom : 0;
      nav.dataset.scrolled = window.scrollY > 40 ? '1' : '0';
      let tone = 'light';
      if (heroBottom > 60) {
        tone = flight.p > 0.36 && flight.p < 0.9 ? 'dark' : 'light';
      } else {
        document.querySelectorAll<HTMLElement>('main [data-tone]').forEach((s) => {
          const r = s.getBoundingClientRect();
          if (r.top <= 60 && r.bottom > 60) tone = s.dataset.tone || 'light';
        });
      }
      if (nav.dataset.tone !== tone) nav.dataset.tone = tone;
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      <nav className="nav" ref={ref} aria-label="Main" data-tone="light">
        <a className="brand" href="#top" aria-label="ultimate.am home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="logo-dark" src="/images/logo-am-white.png" alt="ultimate.am" width={119} height={24} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="logo-light" src="/images/logo-am-teal.png" alt="ultimate.am" width={119} height={24} />
        </a>
        <div className="nav-pill">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <a className="nav-cta" href="#contact" data-magnet>
            Start a conversation
            <span className="ic">
              <ArrowRight size={14} />
            </span>
          </a>
          <button className="burger" type="button" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            <span />
            <span />
          </button>
        </div>
      </nav>
      {open && (
        <div className="mpanel">
          {NAV_LINKS.map((l, i) => (
            <a key={l.href} href={l.href} style={{ animationDelay: `${i * 60}ms` }} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <a href="#contact" style={{ animationDelay: '360ms', color: '#63B7B7' }} onClick={() => setOpen(false)}>
            Start a conversation
          </a>
        </div>
      )}
    </>
  );
}
