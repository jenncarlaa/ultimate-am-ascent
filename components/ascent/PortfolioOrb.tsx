'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { flight } from '@/lib/flight';
import { buildRocket, reflect } from './rocket';

/* ---------------------------------------------------------------
   Portfolio orbit: a large glowing teal globe in the lower half of
   the stage, circled by a wide tilted orbit whose planets are the
   featured brands. Nothing moves on its own: the orbit angle, the
   globe spin and the rocket all follow `slide`, which only changes
   when the visitor scrolls, presses an arrow key or a nav button.
   The active brand lands on a front-left spotlight. The brand text
   (`spot`) is parked in a band no orbit, moon, rocket or globe can
   cross, recomputed on resize. Renders only on screen.
---------------------------------------------------------------- */

const R = 1.7;
const ORBIT = 4.7;
const ROCKET_ORBIT = 2.6;

const raw = (hex: string) => {
  const c = new THREE.Color();
  c.setRGB(parseInt(hex.slice(1, 3), 16) / 255, parseInt(hex.slice(3, 5), 16) / 255, parseInt(hex.slice(5, 7), 16) / 255, THREE.LinearSRGBColorSpace);
  return c;
};

const globeFrag = `uniform vec3 deep; uniform vec3 mid; uniform vec3 light; uniform vec3 glow; varying vec3 vN; varying vec3 vV; varying vec3 vP;
float hash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise(vec3 x){ vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z); }
float fbm(vec3 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * noise(p); p *= 2.03; a *= 0.5; } return s; }
void main(){
  vec3 p = normalize(vP); vec3 n = normalize(vN);
  float land = smoothstep(0.5, 0.56, fbm(p * 2.4 + 3.1));
  vec2 ll = vec2(atan(p.z, p.x), asin(p.y)) * (52.0 / 3.14159);
  float dotm = smoothstep(0.24, 0.06, length(fract(ll) - 0.5));
  float lit = max(dot(n, normalize(vec3(-0.55, 0.5, 0.7))), 0.0);
  float fr = pow(1.0 - max(dot(n, normalize(vV)), 0.0), 3.6);
  vec3 c = mix(deep, mid, 0.12 + 0.68 * lit);
  c = mix(c, light, land * 0.26 * (0.4 + 0.6 * lit));
  c += glow * dotm * (0.06 + land * (0.3 + 0.45 * (1.0 - lit)));
  c += light * fr * 0.95 + glow * pow(lit, 18.0) * 0.16;
  gl_FragColor = vec4(c, 1.0);
}`;

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(159,227,223,0.9)');
  gr.addColorStop(0.35, 'rgba(99,183,183,0.35)');
  gr.addColorStop(1, 'rgba(18,149,157,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function useOrbit(count: number, low: boolean) {
  return useMemo(() => {
    const root = new THREE.Group();
    const planet = new THREE.Group();
    planet.rotation.set(0.32, 0, -0.14);
    root.add(planet);

    // the globe: lit teal ocean, lighter land, city-light dots and a rim light
    planet.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(R, low ? 64 : 96, low ? 48 : 64),
        new THREE.ShaderMaterial({
          uniforms: { deep: { value: raw('#031a1e') }, mid: { value: raw('#0E7F86') }, light: { value: raw('#63B7B7') }, glow: { value: raw('#D9EFEE') } },
          vertexShader: 'varying vec3 vN; varying vec3 vV; varying vec3 vP; void main(){ vP = position; vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = -mv.xyz; gl_Position = projectionMatrix * mv; }',
          fragmentShader: globeFrag,
        }),
      ),
    );

    // the brand orbit: a wide, tilted ellipse
    const orbit = new THREE.Group();
    orbit.rotation.set(-1.38, 0.04, 0.14); // near side runs below the globe
    orbit.add(new THREE.Mesh(new THREE.TorusGeometry(ORBIT, 0.012, 6, 320), new THREE.MeshBasicMaterial({ color: 0x12959d, transparent: true, opacity: 0.6 })));
    root.add(orbit);
    const tex = glowTexture();
    const step = (Math.PI * 2) / count;
    const brands = Array.from({ length: count }, (_, i) => {
      const mat = new THREE.MeshPhysicalMaterial({ color: 0x12959d, emissive: 0x12959d, emissiveIntensity: 0.3, roughness: 0.2, metalness: 0.3, clearcoat: 1, clearcoatRoughness: 0.12 });
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.38, 48, 32), mat);
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0.5 }));
      halo.scale.setScalar(1.8);
      m.add(halo);
      orbit.add(m);
      return { m, mat, halo, phase: i * step, s: 1 };
    });
    // small plain moons between the brands
    const moonMat = new THREE.MeshPhysicalMaterial({ color: 0x0e7f86, roughness: 0.3, metalness: 0.3, clearcoat: 1 });
    const moons = Array.from({ length: count }, (_, i) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(i % 2 ? 0.16 : 0.22, 32, 24), moonMat);
      orbit.add(m);
      return { m, phase: (i + 0.62) * step };
    });

    // the spotlight: the front-left of the orbit, where the active brand rests
    orbit.updateMatrixWorld(true);
    const v = new THREE.Vector3();
    let spot = 0, best = -Infinity;
    for (let k = 0; k < 360; k++) {
      const a = (k / 360) * Math.PI * 2;
      v.set(Math.cos(a) * ORBIT, Math.sin(a) * ORBIT, 0).applyMatrix4(orbit.matrixWorld);
      const score = v.z * 0.9 - v.x;
      if (score > best) {
        best = score;
        spot = a;
      }
    }

    // the rocket keeps its own smaller orbit, moving only with the slides
    const rOrbit = new THREE.Group();
    rOrbit.rotation.set(0.9, 0.5, 0.5);
    rOrbit.add(new THREE.Mesh(new THREE.TorusGeometry(ROCKET_ORBIT, 0.006, 6, 220), new THREE.MeshBasicMaterial({ color: 0x63b7b7, transparent: true, opacity: 0.4 })));
    const { rocket, metals } = buildRocket(true);
    rocket.scale.setScalar(0.09);
    rocket.position.y = -0.44;
    const craft = new THREE.Group();
    craft.add(rocket);
    rOrbit.add(craft);
    root.add(rOrbit);
    const rocketOrbit = rOrbit;

    // static dust of teal points around the scene
    const ns = low ? 260 : 520;
    const sp = new Float32Array(ns * 3);
    for (let i = 0; i < ns; i++) {
      const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, r = 30 + Math.random() * 20, q = Math.sqrt(1 - u * u);
      sp.set([q * Math.cos(th) * r, u * r * 0.6, -Math.abs(q * Math.sin(th) * r) - 8], i * 3);
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    root.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0x63b7b7, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0.45, depthWrite: false })));

    const hemi = new THREE.HemisphereLight(0xeef7f6, 0x0a5c63, 1.2);
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(-4, 4, 6);
    const rim = new THREE.DirectionalLight(0x63b7b7, 3.2);
    rim.position.set(5, 1, -4);

    return { root, planet, orbit, rocketOrbit, brands, moons, spot, step, craft, metals: [...metals, moonMat, ...brands.map((b) => b.mat)], lights: [hemi, key, rim] };
  }, [count, low]);
}

type Props = { slide: React.MutableRefObject<number>; active: number; count: number; spot: React.MutableRefObject<HTMLElement | null> };

function Scene({ slide, active, count, spot, low }: Props & { low: boolean }) {
  const W = useOrbit(count, low);
  const { gl, camera, scene, size } = useThree();
  const setFrameloop = useThree((s) => s.setFrameloop);
  const invalidate = useThree((s) => s.invalidate);
  const sel = useRef(active);
  sel.current = active;
  const cur = useRef<number | null>(null);
  const orbitScale = useRef(1);

  useEffect(() => {
    scene.add(W.root, ...W.lights);
    return () => {
      scene.remove(W.root, ...W.lights);
    };
  }, [scene, W]);
  useEffect(() => reflect(gl, W.metals), [gl, W]);

  useEffect(() => {
    const host = gl.domElement.parentElement;
    if (!host) return;
    const io = new IntersectionObserver(([en]) => setFrameloop(en.isIntersecting ? 'always' : 'never'));
    io.observe(host);
    return () => io.disconnect();
  }, [gl, setFrameloop]);

  // frame the globe in the lower half; pull back on narrow screens so the orbit still reads
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / Math.max(1, size.height);
    const tan = Math.tan(THREE.MathUtils.degToRad(15));
    const z = THREE.MathUtils.clamp(5.2 / (tan * aspect), 13.5, 30);
    // on narrow screens shrink the orbit so the outer planets stay inside the frame
    orbitScale.current = THREE.MathUtils.clamp((tan * z * aspect * 0.86) / (ORBIT + 0.5), 0.55, 1);
    W.orbit.scale.setScalar(orbitScale.current);
    cam.fov = 30;
    cam.position.set(0, 0, z);
    cam.lookAt(0, aspect < 1 ? -1.5 : 0.75, 0);
    cam.updateProjectionMatrix();
    invalidate();

    // park the brand text where no planet, moon, rocket or the globe can ever pass:
    // sample the whole orbit path (not just where planets are now), so it never overlaps, even mid-transition
    const place = () => {
      const el = spot.current;
      const stage = el?.parentElement;
      const items = el ? Array.from(el.querySelectorAll<HTMLElement>('.pf-spot-item')) : [];
      if (!el || !stage || !items.length) return;
      cam.updateMatrixWorld();
      W.root.updateMatrixWorld(true);
      const H = size.height, tanH = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
      const textH = Math.max(...items.map((i) => i.offsetHeight));
      const left = items[0].offsetLeft, right = left + items[0].offsetWidth, pad = 32;
      let top = Infinity, bot = -Infinity;
      const v = new THREE.Vector3();
      const consider = (r: number) => {
        const rp = (r / (cam.position.distanceTo(v) * tanH)) * (H / 2);
        v.project(cam);
        const x = (v.x + 1) * 0.5 * size.width, y = (1 - v.y) * 0.5 * H;
        if (x + rp < left - pad || x - rp > right + pad) return;
        top = Math.min(top, y - rp);
        bot = Math.max(bot, y + rp);
      };
      for (let k = 0; k < 120; k++) {
        const a = (k / 120) * Math.PI * 2;
        v.set(Math.cos(a) * ORBIT, Math.sin(a) * ORBIT, 0).applyMatrix4(W.orbit.matrixWorld);
        consider(0.62 * orbitScale.current);
        v.set(Math.cos(a) * ROCKET_ORBIT, Math.sin(a) * ROCKET_ORBIT, 0).applyMatrix4(W.rocketOrbit.matrixWorld);
        consider(0.5);
      }
      v.set(0, 0, 0);
      consider(R * 1.06);
      const sr = stage.getBoundingClientRect();
      const overlaps = (r: DOMRect) => r.left - sr.left < right && r.right - sr.left > left;
      const title = stage.querySelector('.pf-title')?.getBoundingClientRect();
      const nav = stage.querySelector('.pf-nav')?.getBoundingClientRect();
      const topSafe = title && overlaps(title) ? title.bottom - sr.top + 28 : 112;
      const botSafe = nav && overlaps(nav) ? nav.top - sr.top - 28 : H - 32;
      const above = top - pad - textH, below = bot + pad;
      let ty: number;
      if (!Number.isFinite(top)) ty = topSafe;
      else if (above >= topSafe) ty = above;
      else if (below + textH <= botSafe) ty = below;
      else ty = top - topSafe > botSafe - bot ? Math.max(topSafe, above) : Math.min(below, botSafe - textH);
      el.style.setProperty('--ty', `${ty.toFixed(1)}px`);
    };
    place();
    const t = window.setTimeout(place, 400); // again once web fonts settle the text height
    return () => window.clearTimeout(t);
  }, [camera, size, invalidate, W, spot]);

  useFrame((state, delta) => {
    const dt = Math.min(0.05, delta);
    const target = slide.current;
    if (cur.current === null || flight.reduced) cur.current = target;
    else cur.current += (target - cur.current) * Math.min(1, dt * 6);
    const s = cur.current;

    // everything below is a function of the slide position, so it is still when the visitor is
    const off = W.spot - s * W.step;
    W.brands.forEach((b, i) => {
      const a = b.phase + off;
      b.m.position.set(Math.cos(a) * ORBIT, Math.sin(a) * ORBIT, 0);
      const on = 1 - Math.min(1, Math.abs(s - i));
      b.s = 1 + on * 0.4;
      b.m.scale.setScalar(b.s);
      b.mat.emissiveIntensity = 0.25 + on * 0.75;
      b.halo.material.opacity = 0.2 + on * 0.6;
    });
    W.moons.forEach((m) => {
      const a = m.phase + off;
      m.m.position.set(Math.cos(a) * ORBIT, Math.sin(a) * ORBIT, 0);
    });
    W.planet.rotation.y = 0.6 + s * 0.7;
    const ra = 2.2 + s * 1.3;
    W.craft.position.set(Math.cos(ra) * ROCKET_ORBIT, Math.sin(ra) * ROCKET_ORBIT, 0);
    W.craft.rotation.z = ra;
  });

  return null;
}

export default function PortfolioOrb(props: Props) {
  const low = typeof window !== 'undefined' && window.innerWidth < 760;
  return (
    <Canvas
      className="pf-canvas"
      dpr={[1, low ? 1.5 : 1.35]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: 30, near: 0.1, far: 200, position: [0, 0, 14] }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.setClearColor(0x000000, 0);
      }}
      aria-hidden="true"
    >
      <Scene {...props} low={low} />
    </Canvas>
  );
}
