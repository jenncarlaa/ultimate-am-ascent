/* eslint-disable @next/next/no-img-element */
import { SOCIALS, SocialIcon } from '../ui/Icons';
import Skyband from '../ui/Skyband';

export default function Footer() {
  return (
    <footer className="foot curve" data-tone="dark" aria-label="Footer">
      <div className="wrap foot-head">
        <div>
          <div className="idx mono" data-reveal>
            07 — Closing
          </div>
          <h2 className="h2 grad-dark" data-mask>
            Tell us what you are <span className="serif">trying to build.</span>
          </h2>
        </div>
        <p className="lede" data-reveal>
          Whether it is a platform, a campaign, a security posture or a room full of the right people — start with the outcome and we will tell you honestly whether we are the right group for it.
        </p>
      </div>
      {/* the wordmark sits between the back ribbons and the front ribbon */}
      <div className="foot-stage">
        <Skyband className="skyband foot-sky" layer="back" viewBox="0 -60 1440 330" />
        <div className="wrap">
          <div className="foot-big" data-text="ultimateteam" aria-hidden="true">
            ultimateteam
          </div>
        </div>
        <Skyband className="skyband foot-sky foot-sky-front" layer="front" viewBox="0 -60 1440 330" />
      </div>
      <div className="wrap">
        <div className="foot-cols">
          <div>
            <a href="#top" aria-label="ultimateteam home">
              <img src="/images/logo-team-white.png" alt="ultimateteam" width={189} height={34} className="block h-[34px] w-auto" />
            </a>
            <p className="mt-4 max-w-[32ch] text-sm text-[#CFE7E6]">An Indonesian group building consumer brands and the systems behind them.</p>
          </div>
          <div>
            <h5>Terms &amp; policies</h5>
            <ul>
              <li><a href="#top">Terms of Service</a></li>
              <li><a href="#top">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h5>Company</h5>
            <ul>
              <li><a href="#top">Home</a></li>
              <li><a href="#record">About us</a></li>
              <li><a href="#contact">Contact us</a></li>
            </ul>
          </div>
          <div>
            <h5>Contact</h5>
            <ul>
              <li>(+62) 893912392190</li>
              <li>contoh@example.com</li>
            </ul>
          </div>
          <div>
            <h5>Location</h5>
            <ul>
              <li>(+62) 893912392190</li>
              <li>contoh@example.com</li>
            </ul>
          </div>
        </div>
        <div className="foot-bot">
          <span>Copyright © 2026 ultimate.am. All rights reserved.</span>
          <div className="soc m-0">
            {SOCIALS.filter((s) => s.label !== 'X').map((s) => (
              <a key={s.label} href={s.href} aria-label={s.label}>
                <SocialIcon name={s.label} size={16} />
              </a>
            ))}
            <a href="mailto:info@codingstudio.com" aria-label="Email">
              <SocialIcon name="Email" size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
