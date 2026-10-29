/* eslint-disable @next/next/no-img-element */
import { WORKS } from '@/lib/content';
import { ArrowRight } from '../ui/Icons';
import { Gridlines, Numeral, Shards } from '../ui/Decor';

export default function Work() {
  return (
    <section className="sec tone-light curve" id="work" data-tone="light" aria-labelledby="work-h">
      <Gridlines />
      <Shards set="b" />
      <Numeral n="05" />
      <div className="wrap">
        <div className="sec-head">
          <div>
            <div className="idx mono" data-reveal>
              05 — Work
            </div>
            <h2 className="h2 grad" id="work-h" data-mask>
              Ideas are only <span className="serif">the beginning.</span>
            </h2>
          </div>
          <p className="lede" data-reveal>
            From strategy to execution — a selection of what we have built, launched, and brought to life.
          </p>
        </div>
        <a className="feat" href="#contact" data-reveal data-cursor="View">
          <div className="feat-img">
            <img data-reveal="img" data-parallax="0.06" src="/images/work-featured.jpg" alt="Trainers leading a digital literacy session in front of a map of Indonesia" />
          </div>
          <div className="feat-body">
            <div>
              <span className="meta mono">Featured project · Education · Digital Infrastructure</span>
              <h3>National Digital Literacy Infrastructure</h3>
              <p>Designing and delivering a nationwide training framework that brings applied digital and AI skills to communities across Indonesia&apos;s provinces.</p>
            </div>
            <span className="btn btn-teal self-start">
              View case study
              <span className="ic">
                <ArrowRight />
              </span>
            </span>
          </div>
        </a>
        <div className="wgrid">
          {WORKS.map((w, i) => (
            <a key={w.title} className="wcard" href="#contact" data-reveal style={{ transitionDelay: `${i * 90}ms` }} data-cursor="View">
              <div className="wcard-img">
                <img data-reveal="img" data-parallax="0.05" src={w.img} alt={w.alt} />
              </div>
              <div className="wcard-b">
                <div className="flex items-start gap-4">
                  <h4>{w.title}</h4>
                  <span className="wcard-arrow" aria-hidden="true">
                    <ArrowRight size={14} />
                  </span>
                </div>
                <span className="meta mono">{w.meta}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
