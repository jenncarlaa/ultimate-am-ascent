import { ArrowRight } from '../ui/Icons';
import { Gridlines, Numeral, Shards } from '../ui/Decor';
import Skyband from '../ui/Skyband';

export default function Ecosystem() {
  return (
    <section className="sec tone-dark curve overflow-hidden" id="ecosystem" data-tone="dark" aria-labelledby="eco-h">
      <Gridlines />
      <Shards set="b" dark />
      <svg className="rings" data-parallax="-0.1" viewBox="0 0 800 800" fill="none" stroke="#9FD8D6" aria-hidden="true">
        <circle cx="400" cy="400" r="390" strokeOpacity=".08" />
        <circle cx="400" cy="400" r="300" strokeOpacity=".12" />
        <circle cx="400" cy="400" r="210" strokeOpacity=".16" />
        <circle cx="400" cy="400" r="120" strokeOpacity=".2" />
        <g className="rot">
          <circle cx="400" cy="400" r="345" strokeOpacity=".25" strokeDasharray="2 14" />
          <path d="M400 40v24M400 736v24M40 400h24M736 400h24" strokeOpacity=".4" />
        </g>
        <path d="M0 400h800M400 0v800" strokeOpacity=".06" />
      </svg>
      <Numeral n="02" />
      <div className="wrap">
        <div className="sec-head">
          <div>
            <div className="idx mono" data-reveal>
              02 — Approach
            </div>
            <h2 className="h2 grad-dark" id="eco-h" data-mask>
              One ecosystem. <span className="serif">Built around expertise.</span>
            </h2>
          </div>
          <p className="lede" data-reveal>
            Specialist studios and businesses, connected by a shared ambition to build what is next.
          </p>
        </div>
        <div className="folders">
          <a className="folder f-glass" href="#studios" data-tilt data-reveal data-cursor="Hire">
            <div className="folder-tab">
              <span className="mono text-onmuted">Services</span>
              <span className="mono text-onmuted">A</span>
            </div>
            <div className="folder-body">
              <div>
                <h3>What clients hire us for</h3>
                <p>Specialist studios, working across technology, security, games, content and events.</p>
              </div>
              <div className="folder-foot">
                <span className="mono text-onmuted">Hire it · Learn it</span>
                <span className="arrow-c">
                  <ArrowRight />
                </span>
              </div>
              <span className="folder-num" aria-hidden="true">A</span>
            </div>
          </a>
          <a className="folder f-solid" href="#brands" data-tilt data-reveal style={{ transitionDelay: '120ms' }} data-cursor="Build">
            <div className="folder-tab">
              <span className="mono" style={{ color: '#DDF1EF' }}>Ventures</span>
              <span className="mono" style={{ color: '#DDF1EF' }}>B</span>
            </div>
            <div className="folder-body">
              <div>
                <h3>What we build ourselves</h3>
                <p>Consumer brands we help grow, using the same standard we sell.</p>
              </div>
              <div className="folder-foot">
                <span className="mono" style={{ color: '#DDF1EF' }}>Portfolio</span>
                <span className="arrow-c">
                  <ArrowRight />
                </span>
              </div>
              <span className="folder-num" aria-hidden="true">B</span>
            </div>
          </a>
          <span className="link-line" aria-hidden="true" />
        </div>
      </div>
      <Skyband />
    </section>
  );
}
