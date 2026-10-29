'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { flight } from '@/lib/flight';

gsap.registerPlugin(ScrollTrigger);

/** The active Lenis instance, so anchors can scroll smoothly. */
export let lenis: Lenis | null = null;

/**
 * Page-wide motion layer:
 * - Lenis smooth scroll, synced with GSAP ScrollTrigger
 * - reveal on enter (blur to sharp cards, mask headings, diagonal image wipes)
 * - scroll parallax on [data-parallax] (numerals, rings, shards, photos)
 * - pointer tilt, magnetic buttons, cursor follower
 * Everything is skipped under prefers-reduced-motion.
 */
export default function Motion() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = window.matchMedia('(pointer: fine)').matches;
    flight.reduced = reduced;
    const off: (() => void)[] = [];
    const on = <K extends keyof WindowEventMap>(el: EventTarget, ev: K | string, fn: EventListener, opt?: AddEventListenerOptions) => {
      el.addEventListener(ev, fn, opt);
      off.push(() => el.removeEventListener(ev, fn, opt));
    };

    // smooth scroll
    if (!reduced) {
      lenis = new Lenis({ duration: 1.15, smoothWheel: true, easing: (x) => Math.min(1, 1.001 - Math.pow(2, -10 * x)) });
      lenis.on('scroll', (e: Lenis) => {
        flight.velocity = e.velocity;
        ScrollTrigger.update();
      });
      const tick = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      off.push(() => {
        gsap.ticker.remove(tick);
        lenis?.destroy();
        lenis = null;
      });
      document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
        on(a, 'click', (ev) => {
          const id = a.getAttribute('href');
          if (!id || id.length < 2) return;
          const tgt = document.querySelector(id);
          if (!tgt || !lenis) return;
          ev.preventDefault();
          lenis.scrollTo(tgt as HTMLElement);
        });
      });
    }

    // reveals
    const revs = document.querySelectorAll('[data-reveal],[data-mask]');
    if (!reduced && 'IntersectionObserver' in window) {
      // fully clipped elements (masked headings, wiped images) never intersect, so their wrapper is watched instead
      const watch = new Map<Element, Element[]>();
      const io = new IntersectionObserver(
        (ents) =>
          ents.forEach((en) => {
            if (en.isIntersecting) {
              (watch.get(en.target) ?? [en.target]).forEach((t) => t.setAttribute('data-in', '1'));
              io.unobserve(en.target);
            }
          }),
        { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
      );
      revs.forEach((el) => {
        const clipped = el.hasAttribute('data-mask') || el.getAttribute('data-reveal') === 'img';
        const host = clipped && el.parentElement ? el.parentElement : el;
        watch.set(host, [...(watch.get(host) ?? []), el]);
        io.observe(host);
      });
      off.push(() => io.disconnect());
    } else {
      revs.forEach((el) => el.setAttribute('data-in', '1'));
    }

    // scroll parallax: `translate` composes with any transform or animation already on the element
    if (!reduced) {
      const items = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]')).map((el) => ({
        el,
        f: parseFloat(el.dataset.parallax || '0'),
        ref: (el.tagName === 'IMG' ? el.parentElement : el.offsetParent) as HTMLElement | null,
        img: el.tagName === 'IMG',
      }));
      let raf = 0;
      const run = () => {
        raf = 0;
        const vh = window.innerHeight;
        items.forEach(({ el, f, ref, img }) => {
          const r = (ref ?? el).getBoundingClientRect();
          if (r.bottom < -200 || r.top > vh + 200) return;
          let y = (r.top + r.height / 2 - vh / 2) * -f;
          if (img) y = Math.max(-28, Math.min(28, y));
          el.style.translate = `0 ${y.toFixed(1)}px`;
        });
      };
      const queue = () => {
        if (!raf) raf = requestAnimationFrame(run);
      };
      on(window, 'scroll', queue, { passive: true });
      on(window, 'resize', queue);
      queue();
      off.push(() => cancelAnimationFrame(raf));
    }

    if (fine && !reduced) {
      document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
        on(el, 'pointermove', ((ev: PointerEvent) => {
          const r = el.getBoundingClientRect();
          const px = (ev.clientX - r.left) / r.width - 0.5;
          const py = (ev.clientY - r.top) / r.height - 0.5;
          el.style.transform = `rotateX(${(-py * 8).toFixed(2)}deg) rotateY(${(px * 10).toFixed(2)}deg)`;
        }) as EventListener);
        on(el, 'pointerleave', () => (el.style.transform = ''));
      });
      document.querySelectorAll<HTMLElement>('[data-magnet]').forEach((el) => {
        on(el, 'pointermove', ((ev: PointerEvent) => {
          const r = el.getBoundingClientRect();
          el.style.transform = `translate(${((ev.clientX - r.left - r.width / 2) * 0.16).toFixed(1)}px,${((ev.clientY - r.top - r.height / 2) * 0.28).toFixed(1)}px)`;
        }) as EventListener);
        on(el, 'pointerleave', () => (el.style.transform = ''));
      });
      // cursor follower
      const cur = document.getElementById('cursor');
      const curT = document.getElementById('cursor-t');
      if (cur && curT) {
        let cx = -100, cy = -100, tx = -100, ty = -100, raf = 0;
        on(window, 'pointermove', ((ev: PointerEvent) => {
          tx = ev.clientX;
          ty = ev.clientY;
          cur.dataset.on = '1';
          const target = ev.target as Element | null;
          const tgt = target?.closest?.('[data-cursor]') as HTMLElement | null;
          const link = target?.closest?.('a,button,input,textarea');
          let label = tgt?.dataset.cursor || '';
          if (link && tgt && link !== tgt && tgt.contains(link)) label = '';
          if (label) {
            cur.dataset.label = '1';
            cur.dataset.hover = '0';
            if (curT.textContent !== label) curT.textContent = label;
          } else {
            cur.dataset.label = '0';
            curT.textContent = '';
            cur.dataset.hover = link ? '1' : '0';
          }
        }) as EventListener, { passive: true });
        on(document.documentElement, 'pointerleave', () => (cur.dataset.on = '0'));
        const follow = () => {
          cx += (tx - cx) * 0.18;
          cy += (ty - cy) * 0.18;
          cur.style.transform = `translate(${cx.toFixed(1)}px,${cy.toFixed(1)}px)`;
          raf = requestAnimationFrame(follow);
        };
        raf = requestAnimationFrame(follow);
        off.push(() => cancelAnimationFrame(raf));
      }
    }

    return () => off.forEach((f) => f());
  }, []);

  return (
    <div className="cursor" id="cursor" aria-hidden="true">
      <span className="cursor-t" id="cursor-t" />
    </div>
  );
}
