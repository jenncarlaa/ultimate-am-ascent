import type { Metadata, Viewport } from 'next';
// Fonts are self-hosted (no network needed at build time)
import '@fontsource/poppins/latin-300.css';
import '@fontsource/poppins/latin-400.css';
import '@fontsource/poppins/latin-500.css';
import '@fontsource/poppins/latin-600.css';
import '@fontsource/poppins/latin-300-italic.css';
import '@fontsource/poppins/latin-400-italic.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'ultimate.am — Studios that build consumer champions',
  description: 'An Indonesian group. We build consumer brands and the systems behind them — through five studios and the specialists who lead them.',
  openGraph: {
    title: 'ultimate.am',
    description: 'Studios that build consumer champions.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#042227',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
