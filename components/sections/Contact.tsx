'use client';

import { useState, type FormEvent } from 'react';
import { ArrowRight, MailIcon, SOCIALS, SocialIcon } from '../ui/Icons';
import { Gridlines, Numeral, Shards } from '../ui/Decor';

type Fields = { name: string; email: string; phone: string; question: string };
const EMPTY: Fields = { name: '', email: '', phone: '', question: '' };

export default function Contact() {
  const [v, setV] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [sentTo, setSentTo] = useState('');

  const set = (k: keyof Fields) => (e: { target: { value: string } }) => {
    setV((s) => ({ ...s, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: undefined }));
    setSentTo('');
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const er: typeof errors = {};
    if (!v.name.trim()) er.name = 'Enter your full name.';
    if (!v.email.trim()) er.email = 'Enter your email so we can reply.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) er.email = 'This email looks incomplete. Check the part after @.';
    if (!v.question.trim()) er.question = 'Tell us briefly what you are trying to build.';
    setErrors(er);
    if (Object.keys(er).length) return;
    // TODO: connect to the real form endpoint of the existing site
    setSentTo(v.email.trim());
    setV(EMPTY);
  };

  return (
    <section className="sec tone-dark curve overflow-hidden" id="contact" data-tone="dark" aria-labelledby="contact-h">
      <Gridlines />
      <Shards set="a" dark />
      <Numeral n="06" />
      <div className="wrap">
        <div className="contact">
          <div>
            <div className="idx mono" data-reveal>
              06 — Contact
            </div>
            <h2 className="h2 grad-dark" id="contact-h" data-mask>
              What would you like <span className="serif">to do together?</span>
            </h2>
            <p className="lede mt-6" data-reveal>
              Whether you are building a product, exploring partnership, or considering an investment — we want to understand what you are working toward.
            </p>
            <div className="mail" data-reveal>
              <span className="mail-ic">
                <MailIcon />
              </span>
              <div>
                <div className="mono text-onmuted">Email us</div>
                <a href="mailto:info@codingstudio.com" className="font-semibold">
                  info@codingstudio.com
                </a>
              </div>
            </div>
            <div data-reveal>
              <div className="mono text-onmuted mt-10">Connect with us</div>
              <div className="soc">
                {SOCIALS.map((s) => (
                  <a key={s.label} href={s.href} aria-label={s.label}>
                    <SocialIcon name={s.label} />
                  </a>
                ))}
              </div>
            </div>
          </div>
          <form className="form" data-reveal onSubmit={submit} noValidate aria-label="Contact form">
            <div className="field">
              <label htmlFor="f-name">Full name</label>
              <input className="inp" id="f-name" name="name" autoComplete="name" placeholder="Enter your full name" value={v.name} onChange={set('name')} aria-invalid={!!errors.name} />
              {errors.name && <span className="err" role="alert">{errors.name}</span>}
            </div>
            <div className="field">
              <label htmlFor="f-email">Email</label>
              <input className="inp" id="f-email" name="email" type="email" autoComplete="email" placeholder="Where we can contact you" value={v.email} onChange={set('email')} aria-invalid={!!errors.email} />
              {errors.email && <span className="err" role="alert">{errors.email}</span>}
            </div>
            <div className="field full">
              <label htmlFor="f-phone">Phone number</label>
              <input className="inp" id="f-phone" name="phone" type="tel" autoComplete="tel" placeholder="+62 Enter your phone number" value={v.phone} onChange={set('phone')} />
            </div>
            <div className="field full">
              <label htmlFor="f-q">Question</label>
              <textarea className="inp" id="f-q" name="question" placeholder="Enter your question" value={v.question} onChange={set('question')} aria-invalid={!!errors.question} />
              {errors.question && <span className="err" role="alert">{errors.question}</span>}
            </div>
            {sentTo && (
              <div className="sent" role="status">
                Message received. We will reply to {sentTo} from a real person.
              </div>
            )}
            <div className="field full flex-row justify-end">
              <button className="btn btn-light" type="submit" data-magnet>
                Submit
                <span className="ic">
                  <ArrowRight />
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
