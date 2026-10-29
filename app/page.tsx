import Motion from '@/components/Motion';
import Nav from '@/components/Nav';
import AscentHero from '@/components/ascent/AscentHero';
import Record from '@/components/sections/Record';
import Ecosystem from '@/components/sections/Ecosystem';
import Brands from '@/components/sections/Brands';
import Studios from '@/components/sections/Studios';
import Work from '@/components/sections/Work';
import Contact from '@/components/sections/Contact';
import Footer from '@/components/sections/Footer';

export default function Home() {
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <Nav />
      <AscentHero />
      <main id="main">
        <Record />
        <Ecosystem />
        <Brands />
        <Studios />
        <Work />
        <Contact />
        <Footer />
      </main>
      <Motion />
    </>
  );
}
