/** All copy is taken from the existing ultimate.am design. */

export const NAV_LINKS = [
  { label: 'Approach', href: '#ecosystem' },
  { label: 'Capabilities', href: '#studios' },
  { label: 'Partners', href: '#brands' },
  { label: 'Work', href: '#work' },
  { label: 'About', href: '#record' },
  { label: 'Contact', href: '#contact' },
];

export const TAGLINE =
  'Ultimateteam brings together specialist studios, operating partners, and businesses under | one connected ecosystem | — combining focused expertise with the ability to turn ideas into products, brands, and businesses.';

export const STATS = [
  { n: '01', value: 200, format: (v: number) => `${v}+`, label: 'Institutions served', desc: 'Partnering with organizations across government, enterprise, and technology.' },
  { n: '02', value: 150, format: (v: number) => `${v}K+`, label: 'People trained across 270+ cities', desc: 'Building digital capabilities across Indonesia.' },
  { n: '03', value: 22, format: (v: number) => `US$${v}M`, label: 'Revenue generated', desc: 'Measurable impact for the brands and clients we work with.' },
  { n: '04', value: 10, format: (v: number) => `${v}M+`, label: 'Annual traffic', desc: 'Across the platforms we build and run.' },
];

export const INSTITUTIONS = [
  { src: '/images/logo-ojk.png', alt: 'Otoritas Jasa Keuangan (OJK)' },
  { src: '/images/logo-kemenkes.png', alt: 'Kementerian Kesehatan (Kemenkes)' },
  { src: '/images/logo-komdigi.png', alt: 'Kementerian Komunikasi dan Digital (Komdigi)' },
  { src: '/images/logo-kemendikdasmen.png', alt: 'Kementerian Pendidikan Dasar dan Menengah (Kemendikdasmen)' },
];

export const STUDIOS = [
  { num: '01', name: 'codingstudio', logo: '/images/studios/codingstudio.png', cap: 'Technology & AI', color: '#0E7F86', img: '/images/work-ai.jpg', alt: 'Trainer leading an AI workshop with a team on laptops', desc: 'Builds the platforms and systems that run the business.', withLabel: 'Led by', with: 'In-house tech team', withLogo: '' },
  { num: '02', name: 'cyberstudio', logo: '/images/studios/cyberstudio.png', cap: 'Cyber Security', color: '#1F4FC4', img: '/images/gero-analyst.jpg', alt: 'Security analyst presenting a threat network on a large display', desc: 'Penetration testing, managed bug bounty, hardening and incident readiness.', withLabel: 'In collaboration with', with: 'Gero Security', withLogo: '/images/partners/gero-white.png' },
  { num: '03', name: 'gamestudio', logo: '/images/studios/gamestudio.svg', cap: 'Games & AR/VR', color: '#C42A4A', img: '/images/studio-game.jpg', alt: 'Game controller in neon light', desc: 'Game development, industrial VR and AR training, animation and 3D.', withLabel: 'In collaboration with', with: 'Aim to Mite', withLogo: '/images/partners/aimtomite.png' },
  { num: '04', name: 'creatorstudio', logo: '/images/studios/creatorstudio.png', cap: 'Content & Creators', color: '#3F7A12', img: '/images/studio-content.jpg', alt: 'Audience at a live event', desc: 'Brand film and TVC, documentary, content series and creator networks.', withLabel: 'In collaboration with', with: 'Lookitin', withLogo: '/images/partners/lookitin-white.png' },
  { num: '05', name: 'cryptostudio', logo: '/images/studios/cryptostudio.png', cap: 'Blockchain', color: '#4B37C4', img: '/images/gero-map.jpg', alt: 'Operations room with a global network map', desc: 'Protocol and cryptography, smart contract engineering and node infrastructure.', withLabel: 'Led by', with: 'In-house tech team', withLogo: '' },
  { num: '06', name: 'eventstudio', logo: '', cap: 'Coming soon', color: '#1A2B2E', img: '', alt: '', desc: 'Event production, brand activation, sponsorship and campus programmes.', withLabel: 'In collaboration with', with: 'Evorize', withLogo: '/images/partners/evorize-white.png' },
];

export const WORKS = [
  { title: 'Enterprise Cybersecurity Audit & Hardening', meta: 'Education · Digital Infrastructure', img: '/images/work-audit.jpg', alt: 'Consultant presenting a holographic security shield to an engineering team' },
  { title: 'Applied AI Upskilling for Enterprise Teams', meta: 'Education · Workforce Development', img: '/images/work-ai.jpg', alt: 'Trainer leading an AI workshop in a meeting room' },
  { title: 'Regional Partner Onboarding Platform', meta: 'Product · Digital Infrastructure', img: '/images/work-partner.jpg', alt: 'Team reviewing a regional network map on a large display' },
];

/** Featured brands (partner firms). Copy from Web Content Brief v4: `line` from Home §7, the rest from /partners. */
export const BRANDS = [
  {
    name: 'Gero Security',
    logo: { src: '/images/partners/gero.png', w: 445, h: 81 },
    line: "Built Indonesia's first open-source bug bounty platform.",
    role: 'Cyber security solutions',
    studio: 'cyberstudio',
    thumb: '/images/gero-analyst.jpg',
    img: '/images/gero-shield.jpg',
    alt: 'Consultant interacting with a holographic security shield',
    desc: 'Offensive, defensive and governance security. Built Gerobug, the first open-source bug bounty platform. Its CTO placed in the top 12 at Black Hat Middle East 2023.',
    facts: [['Platform', 'Gerobug'], ['Recognition', 'Black Hat MEA 2023 · Top 12'], ['Approach', 'Open source']],
    site: 'gerosecurity.com',
  },
  {
    name: 'Aim to Mite',
    logo: { src: '/images/partners/aimtomite.png', w: 141, h: 123 },
    line: "A title past a million players and a development channel with 840,000 subscribers.",
    role: 'Game and AR/VR development',
    studio: 'gamestudio',
    thumb: '/images/studio-game.jpg',
    img: '/images/studio-game.jpg',
    alt: 'Game controller in neon light',
    desc: 'A 24-person Unity studio in Jakarta. A flagship title past 1M+ downloads at 4.6★, more than ten industrial VR training builds, and a development channel with 840,000 subscribers.',
    facts: [['Flagship title', '1M+ downloads · 4.6★'], ['VR training', '10+ industrial builds'], ['Channel', '840K subscribers']],
    site: 'aimtomitestudio.com',
  },
  {
    name: 'Lookitin',
    logo: { src: '/images/partners/lookitin.png', w: 181, h: 101 },
    line: "Cinematic production for brands and agencies.",
    role: 'Production house',
    studio: 'creatorstudio',
    thumb: '',
    img: '',
    alt: '',
    desc: 'Cinematic production for brands and agencies — Astra Auto2000, MRT Jakarta, Nissan, Terumo, ASEAN, World Resources Institute.',
    facts: [['Work', 'Brand film · TVC · Documentary'], ['Clients', 'Astra Auto2000 · MRT Jakarta · Nissan']],
    site: 'lookitin.id',
  },
  {
    name: 'Evorize',
    logo: { src: '/images/partners/evorize.png', w: 305, h: 81 },
    line: "Built Indonesia's largest university esports league, since acquired.",
    role: 'Event organizer',
    studio: 'eventstudio',
    thumb: '/images/studio-content.jpg',
    img: '/images/studio-content.jpg',
    alt: 'Audience at a live event',
    desc: 'Event production and brand activation. Built the Indonesia Esports League across 40+ universities and 12 cities — since acquired by Brand Media Indonesia and Emtek. Clients include ASUS, Intel, NVIDIA and Toyota.',
    facts: [['League', '40+ universities · 12 cities'], ['Clients', 'ASUS · Intel · NVIDIA · Toyota']],
    site: 'evorizeid.com',
  },
];
