'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { buildRocket, reflect } from './rocket';
import { SKY_BOTTOM, SKY_TOP, altitude, camAt, clamp, flight, lerp, mixHex, ss } from '@/lib/flight';

/* ---------------------------------------------------------------
   Color helpers.
   Custom shaders here write sRGB values straight to the screen, so
   their uniforms hold raw sRGB numbers (no linear conversion).
   Built-in materials keep normal color management.
---------------------------------------------------------------- */
const raw = (hex: string) => {
  const c = new THREE.Color();
  c.setRGB(parseInt(hex.slice(1, 3), 16) / 255, parseInt(hex.slice(3, 5), 16) / 255, parseInt(hex.slice(5, 7), 16) / 255, THREE.LinearSRGBColorSpace);
  return c;
};

function softTexture(inner: string, outer: string) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, inner);
  gr.addColorStop(0.35, outer);
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function cloudTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  for (let i = 0; i < 26; i++) {
    const x = 128 + (Math.random() - 0.5) * 120, y = 140 + (Math.random() - 0.5) * 60, r = 30 + Math.random() * 60;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, 'rgba(255,255,255,0.55)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const pointsVertex = `attribute float size; attribute float alpha; varying float vA; uniform float scale;
void main(){ vA = alpha; vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = size * scale / -mv.z; gl_Position = projectionMatrix * mv; }`;

type Pool = {
  n: number;
  pos: Float32Array; vel: Float32Array; life: Float32Array; max: Float32Array; size: Float32Array; alpha: Float32Array;
  geo: THREE.BufferGeometry; next: number;
};
function makePool(n: number): Pool {
  const pos = new Float32Array(n * 3), size = new Float32Array(n), alpha = new Float32Array(n);
  for (let i = 0; i < n; i++) pos[i * 3 + 1] = -9999;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(size, 1));
  geo.setAttribute('alpha', new THREE.BufferAttribute(alpha, 1));
  return { n, pos, vel: new Float32Array(n * 3), life: new Float32Array(n), max: new Float32Array(n), size, alpha, geo, next: 0 };
}

/* ---------------------------------------------------------------
   The world: built once, animated in useFrame.
---------------------------------------------------------------- */
function useWorld(low: boolean) {
  return useMemo(() => {
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xeef4f2, 30, 220);

    // background pass: animated mesh gradient with grain
    const bgScene = new THREE.Scene();
    const bgCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const bgMat = new THREE.ShaderMaterial({
      uniforms: {
        top: { value: raw('#B9D3CC') }, bot: { value: raw('#EEF4F2') }, glow: { value: raw('#FFFFFF') },
        gpos: { value: new THREE.Vector2(0.66, 0.12) }, gstr: { value: 0.45 }, time: { value: 0 }, res: { value: new THREE.Vector2(1, 1) },
      },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy,0.,1.); }',
      fragmentShader: `uniform vec3 top; uniform vec3 bot; uniform vec3 glow; uniform vec2 gpos; uniform float gstr; uniform float time; uniform vec2 res; varying vec2 vUv;
        float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
        void main(){
          vec2 uv = vUv; float a = res.x / res.y;
          float w1 = sin(uv.x * 2.4 + time * 0.12) * 0.05 + sin(uv.x * 5.1 - time * 0.09) * 0.025;
          vec3 c = mix(bot, top, smoothstep(0.0, 1.0, uv.y + w1));
          vec2 d = vec2((uv.x - gpos.x) * a, uv.y - gpos.y);
          c += glow * gstr * exp(-dot(d, d) * 5.0);
          vec2 d2 = vec2((uv.x - 0.25 - sin(time*0.05)*0.1) * a, uv.y - 0.7);
          c += top * 0.06 * exp(-dot(d2, d2) * 3.0);
          c += (h(uv * res + time) - 0.5) * 0.025;
          gl_FragColor = vec4(c, 1.0);
        }`,
      depthWrite: false,
      depthTest: false,
    });
    bgScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat));

    const hemi = new THREE.HemisphereLight(0xeef7f6, 0x3f6d6a, 0.85);
    const key = new THREE.DirectionalLight(0xfff7ec, 1.7);
    key.position.set(30, 40, 25);
    const rim = new THREE.DirectionalLight(0x63b7b7, 2.6);
    rim.position.set(-30, 10, -30);
    scene.add(hemi, key, rim);

    const { rocket, st1, metals } = buildRocket(low);
    scene.add(rocket);

    // launch pad
    // turquoise floor that dissolves into the sky, so there is no hard horizon edge
    const groundMat = new THREE.ShaderMaterial({
      uniforms: { near: { value: raw('#9FD8D6') }, mid: { value: raw('#D9EFEE') } },
      transparent: true, depthWrite: false, fog: false,
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: `uniform vec3 near; uniform vec3 mid; varying vec2 vUv;
        void main(){ float d = length(vUv - 0.5) * 2.0;
          vec3 c = mix(near, mid, smoothstep(0.0, 0.45, d));
          gl_FragColor = vec4(c, 1.0 - smoothstep(0.12, 0.7, d)); }`,
    });
    const ground = new THREE.Mesh(new THREE.CircleGeometry(260, 64), groundMat);
    ground.renderOrder = -1;
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.4;
    scene.add(ground);
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.6, 0.45, 48), new THREE.MeshStandardMaterial({ color: 0x63b7b7, roughness: 0.7, metalness: 0.2 }));
    pad.position.y = -0.2;
    scene.add(pad);
    const tower = new THREE.Group();
    const tmat = new THREE.MeshStandardMaterial({ color: 0x064449, roughness: 0.6, metalness: 0.5 });
    for (let tx = 0; tx < 2; tx++) for (let tz = 0; tz < 2; tz++) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 11, 0.12), tmat);
      post.position.set(tx * 1.1, 5.3, tz * 1.1);
      tower.add(post);
    }
    for (let ty = 0; ty < 10; ty++) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.07, 0.07), tmat);
      beam.position.set(0.55, 0.6 + ty * 1.1, 0);
      const beam2 = beam.clone();
      beam2.position.z = 1.1;
      tower.add(beam, beam2);
    }
    const arm = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.12, 0.3), tmat);
    arm.position.set(-0.4, 7.4, 0.55);
    tower.add(arm);
    tower.position.set(1.4, 0, -2.6);
    scene.add(tower);

    const glowT = softTexture('rgba(255,255,255,1)', 'rgba(217,239,238,0.55)');
    const mintT = softTexture('rgba(240,255,252,1)', 'rgba(99,183,183,0.5)');
    const smokeT = softTexture('rgba(255,255,255,0.9)', 'rgba(230,240,238,0.5)');
    const padGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, transparent: true, depthWrite: false, opacity: 0.9, blending: THREE.AdditiveBlending, fog: false }));
    padGlow.scale.set(26, 14, 1);
    padGlow.position.set(0, 1, 0);
    const nozGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: mintT, transparent: true, depthWrite: false, opacity: 0, blending: THREE.AdditiveBlending, fog: false }));
    scene.add(padGlow, nozGlow);

    const flameMat = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 }, power: { value: 0 } },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: `uniform float time; uniform float power; varying vec2 vUv;
        void main(){ float y = vUv.y; float flick = 0.85 + 0.15 * sin(time * 40.0 + y * 20.0);
          float a = smoothstep(0.0, 0.25, y) * (1.0 - smoothstep(0.55, 1.0, 1.0 - y));
          vec3 c = mix(vec3(0.39,0.72,0.72), vec3(1.0,1.0,0.98), pow(y, 1.6));
          gl_FragColor = vec4(c, a * power * flick); }`,
    });
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.42, 4.2, 24, 1, true), flameMat);
    flame.rotation.x = Math.PI;
    scene.add(flame);

    // exhaust (additive) and smoke / contrail (normal blending)
    const ex = makePool(low ? 420 : 900);
    const exMat = new THREE.ShaderMaterial({
      uniforms: { map: { value: mintT }, scale: { value: 300 } },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: pointsVertex,
      fragmentShader: 'uniform sampler2D map; varying float vA; void main(){ vec4 t = texture2D(map, gl_PointCoord); gl_FragColor = vec4(t.rgb, t.a * vA); }',
    });
    const exPoints = new THREE.Points(ex.geo, exMat);
    exPoints.frustumCulled = false;
    const sm = makePool(low ? 160 : 340);
    const smMat = new THREE.ShaderMaterial({
      uniforms: { map: { value: smokeT }, scale: { value: 300 }, tint: { value: raw('#E9F1EF') } },
      transparent: true, depthWrite: false,
      vertexShader: pointsVertex,
      fragmentShader: 'uniform sampler2D map; uniform vec3 tint; varying float vA; void main(){ vec4 t = texture2D(map, gl_PointCoord); gl_FragColor = vec4(tint, t.a * vA); }',
    });
    const smPoints = new THREE.Points(sm.geo, smMat);
    smPoints.frustumCulled = false;
    scene.add(exPoints, smPoints);

    // three parallax cloud layers
    const ct = cloudTexture();
    const clouds: { sp: THREE.Sprite; base: THREE.Vector3; drift: number }[] = [];
    [{ y: 70, n: low ? 10 : 16, s: 46 }, { y: 150, n: low ? 10 : 16, s: 60 }, { y: 250, n: low ? 8 : 14, s: 76 }].forEach((L) => {
      for (let k = 0; k < L.n; k++) {
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: ct, transparent: true, depthWrite: false, opacity: 0.9 }));
        const ang = Math.random() * Math.PI * 2, rad = 10 + Math.random() * 90;
        sp.position.set(Math.cos(ang) * rad, L.y + (Math.random() - 0.5) * 24, Math.sin(ang) * rad - 10);
        const s = L.s * (0.6 + Math.random() * 0.8);
        sp.scale.set(s, s * 0.55, 1);
        scene.add(sp);
        clouds.push({ sp, base: sp.position.clone(), drift: (Math.random() - 0.5) * 0.6 });
      }
    });

    // stars
    const nst = low ? 700 : 1600;
    const sp3 = new Float32Array(nst * 3);
    for (let i = 0; i < nst; i++) {
      const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, r = 700 + Math.random() * 300, sq = Math.sqrt(1 - u * u);
      sp3[i * 3] = sq * Math.cos(th) * r;
      sp3[i * 3 + 1] = Math.abs(u) * r * 0.9 + 40;
      sp3[i * 3 + 2] = sq * Math.sin(th) * r;
    }
    const stg = new THREE.BufferGeometry();
    stg.setAttribute('position', new THREE.BufferAttribute(sp3, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xeef7f6, size: low ? 1.6 : 1.4, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, fog: false });
    const stars = new THREE.Points(stg, starMat);
    scene.add(stars);

    // curved earth, rim-lit in mint
    const fresVert = 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }';
    const earthMat = new THREE.ShaderMaterial({
      uniforms: { base: { value: raw('#053238') }, rim: { value: raw('#9FE3DF') }, sun: { value: new THREE.Vector3(-0.4, 0.6, 0.7).normalize() }, op: { value: 0 } },
      transparent: true, fog: false, vertexShader: fresVert,
      fragmentShader: 'uniform vec3 base; uniform vec3 rim; uniform vec3 sun; uniform float op; varying vec3 vN; varying vec3 vV; void main(){ float fr = pow(1.0 - max(dot(vN, vV), 0.0), 3.0); float l = 0.25 + 0.75 * max(dot(vN, sun), 0.0); gl_FragColor = vec4(base * l + rim * fr * 1.4, op); }',
    });
    const earth = new THREE.Mesh(new THREE.SphereGeometry(520, low ? 64 : 96, low ? 48 : 64), earthMat);
    const atmoMat = new THREE.ShaderMaterial({
      uniforms: { rim: { value: raw('#63B7B7') }, op: { value: 0 } },
      transparent: true, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, vertexShader: fresVert,
      fragmentShader: 'uniform vec3 rim; uniform float op; varying vec3 vN; varying vec3 vV; void main(){ float fr = pow(1.0 - abs(dot(vN, vV)), 2.2); gl_FragColor = vec4(rim * fr, fr * op); }',
    });
    const atmo = new THREE.Mesh(new THREE.SphereGeometry(548, low ? 64 : 96, low ? 48 : 64), atmoMat);
    scene.add(earth, atmo);

    return { scene, bgScene, bgCam, bgMat, hemi, key, rocket, st1, metals, ground, padGlow, nozGlow, flame, flameMat, ex, exMat, sm, smMat, clouds, stars, starMat, earth, earthMat, atmo, atmoMat };
  }, [low]);
}

function emitExhaust(ex: Pool, n: number, o: THREE.Vector3) {
  for (let k = 0; k < n; k++) {
    const i = ex.next;
    ex.next = (ex.next + 1) % ex.n;
    ex.pos[i * 3] = o.x + (Math.random() - 0.5) * 0.3;
    ex.pos[i * 3 + 1] = o.y;
    ex.pos[i * 3 + 2] = o.z + (Math.random() - 0.5) * 0.3;
    ex.vel[i * 3] = (Math.random() - 0.5) * 1.6;
    ex.vel[i * 3 + 1] = -14 * (0.7 + Math.random() * 0.6);
    ex.vel[i * 3 + 2] = (Math.random() - 0.5) * 1.6;
    ex.max[i] = 0.6 + Math.random() * 0.9;
    ex.life[i] = ex.max[i];
  }
}
function emitSmoke(sm: Pool, n: number) {
  for (let k = 0; k < n; k++) {
    const i = sm.next;
    sm.next = (sm.next + 1) % sm.n;
    const a = Math.random() * Math.PI * 2, s = 2 + Math.random() * 5;
    sm.pos[i * 3] = Math.cos(a) * 1.5;
    sm.pos[i * 3 + 1] = 0.3 + Math.random() * 0.5;
    sm.pos[i * 3 + 2] = Math.sin(a) * 1.5;
    sm.vel[i * 3] = Math.cos(a) * s;
    sm.vel[i * 3 + 1] = 0.3 + Math.random() * 0.9;
    sm.vel[i * 3 + 2] = Math.sin(a) * s;
    sm.life[i] = 1;
  }
}
function emitTrail(sm: Pool, n: number, o: THREE.Vector3) {
  for (let k = 0; k < n; k++) {
    const i = sm.next;
    sm.next = (sm.next + 1) % sm.n;
    sm.pos[i * 3] = o.x + (Math.random() - 0.5) * 0.6;
    sm.pos[i * 3 + 1] = o.y - 1.5 - Math.random() * 2;
    sm.pos[i * 3 + 2] = o.z + (Math.random() - 0.5) * 0.6;
    sm.vel[i * 3] = (Math.random() - 0.5) * 0.8;
    sm.vel[i * 3 + 1] = -0.5;
    sm.vel[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
    sm.life[i] = 0.9;
  }
}

function World({ low }: { low: boolean }) {
  const W = useWorld(low);
  const { gl, camera, size } = useThree();
  const setFrameloop = useThree((s) => s.setFrameloop);
  const invalidate = useThree((s) => s.invalidate);
  const cam = camera as THREE.PerspectiveCamera;

  // stop rendering entirely while the hero is off screen
  useEffect(() => {
    const hero = document.getElementById('top');
    if (!hero || flight.reduced) {
      setFrameloop('demand');
      invalidate();
      return;
    }
    const io = new IntersectionObserver(([en]) => setFrameloop(en.isIntersecting ? 'always' : 'never'), { rootMargin: '0px' });
    io.observe(hero);
    return () => io.disconnect();
  }, [setFrameloop, invalidate]);

  // studio reflections for the polished hull only; the rest of the scene keeps its plain lighting
  useEffect(() => reflect(gl, W.metals), [gl, W]);

  // free GPU memory when unmounted
  useEffect(
    () => () => {
      W.scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => x.dispose());
      });
    },
    [W],
  );

  useEffect(() => {
    cam.fov = size.width < 760 ? 52 : 38;
    cam.near = 0.1;
    cam.far = 3000;
    cam.updateProjectionMatrix();
    W.bgMat.uniforms.res.value.set(size.width, size.height);
    const ps = size.height * gl.getPixelRatio() * 0.55;
    W.exMat.uniforms.scale.value = ps;
    W.smMat.uniforms.scale.value = ps;
    flight.width = size.width;
  }, [size, cam, gl, W]);

  const nozzle = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);

  // priority 1: we render manually (background pass + scene)
  useFrame((state, delta) => {
    const dt = Math.min(0.05, delta);
    const t = state.clock.elapsedTime;
    flight.p += (flight.target - flight.p) * (flight.reduced ? 1 : 0.09);
    flight.mx += (flight.tmx - flight.mx) * 0.05;
    flight.my += (flight.tmy - flight.my) * 0.05;
    const p = flight.p, w = size.width;

    // sky
    const top = mixHex(SKY_TOP, p), bot = mixHex(SKY_BOTTOM, p);
    W.bgMat.uniforms.top.value.setRGB(top[0], top[1], top[2], THREE.LinearSRGBColorSpace);
    W.bgMat.uniforms.bot.value.setRGB(bot[0], bot[1], bot[2], THREE.LinearSRGBColorSpace);
    W.bgMat.uniforms.time.value = t;
    const fog = W.scene.fog as THREE.Fog;
    fog.color.setRGB(bot[0], bot[1], bot[2], THREE.SRGBColorSpace);
    fog.near = lerp(30, 400, ss(0.45, 0.6, p));
    fog.far = lerp(240, 3000, ss(0.45, 0.6, p));

    // rocket + separation
    const alt = altitude(p);
    const shake = p > 0.03 && p < 0.24 ? (1 - ss(0.1, 0.24, p)) * ss(0.03, 0.06, p) : 0;
    W.rocket.position.set(Math.sin(t * 37) * 0.03 * shake + flight.mx * 0.2, alt, Math.cos(t * 29) * 0.03 * shake);
    W.rocket.rotation.set(flight.my * 0.04, 0, -flight.mx * 0.05);
    const sep = ss(0.74, 0.86, p);
    W.st1.position.set(sep * 0.6, -sep * 9, sep * 0.4);
    W.st1.rotation.set(sep * 0.25, 0, sep * 0.5);
    W.st1.visible = p < 0.9;

    const power = ss(0.02, 0.08, p) * (1 - 0.6 * ss(0.74, 0.78, p));
    const second = sep > 0.15;
    nozzle.set(0, second ? 5.3 : 0.25, 0).add(W.rocket.position);
    W.flame.position.set(nozzle.x, nozzle.y - 2.1, nozzle.z);
    W.flameMat.uniforms.power.value = power * (second ? 0.7 : 1) * (0.25 + 0.75 * ss(0.3, 0.5, p));
    W.flameMat.uniforms.time.value = t;
    W.flame.scale.set(second ? 0.7 : 1, 1 + power * 0.6 + Math.sin(t * 30) * 0.05, second ? 0.7 : 1);
    W.nozGlow.position.copy(nozzle).y -= 1.2;
    const gs = 6 + power * 14 + ss(0.86, 1, p) * 40;
    W.nozGlow.scale.set(gs, gs, 1);
    W.nozGlow.material.opacity = power * 0.9 + ss(0.86, 1, p);
    W.padGlow.material.opacity = 0.75 * (1 - ss(0.2, 0.35, p)) + power * 0.4 * (1 - ss(0.12, 0.25, p));

    // particles
    const ex = W.ex, sm = W.sm;
    if (power > 0.02 && !flight.reduced) emitExhaust(ex, Math.round((low ? 6 : 12) * power), nozzle);
    for (let i = 0; i < ex.n; i++) {
      if (ex.life[i] <= 0) { ex.alpha[i] = 0; continue; }
      ex.life[i] -= dt;
      const lf = clamp(ex.life[i] / ex.max[i], 0, 1);
      ex.pos[i * 3] += ex.vel[i * 3] * dt;
      ex.pos[i * 3 + 1] += ex.vel[i * 3 + 1] * dt;
      ex.pos[i * 3 + 2] += ex.vel[i * 3 + 2] * dt;
      if (ex.pos[i * 3 + 1] < 0.2 && alt < 30) {
        ex.pos[i * 3 + 1] = 0.2;
        ex.vel[i * 3] *= 1.08;
        ex.vel[i * 3 + 2] *= 1.08;
        ex.vel[i * 3 + 1] = 0;
      }
      ex.size[i] = 0.6 + (1 - lf) * 3.2;
      ex.alpha[i] = lf * 0.55;
    }
    if (p > 0.02 && p < 0.22 && !flight.reduced) emitSmoke(sm, low ? 1 : 2);
    if (alt > 1 && p < 0.46 && !flight.reduced) emitTrail(sm, low ? 1 : 2, nozzle);
    for (let i = 0; i < sm.n; i++) {
      if (sm.life[i] <= 0) { sm.alpha[i] = 0; continue; }
      sm.life[i] -= dt * 0.12;
      sm.pos[i * 3] += sm.vel[i * 3] * dt;
      sm.pos[i * 3 + 1] += sm.vel[i * 3 + 1] * dt;
      sm.pos[i * 3 + 2] += sm.vel[i * 3 + 2] * dt;
      sm.vel[i * 3] *= 0.985;
      sm.vel[i * 3 + 2] *= 0.985;
      sm.size[i] = 3 + (1 - sm.life[i]) * 16;
      sm.alpha[i] = Math.sin(sm.life[i] * Math.PI) * 0.55;
    }
    for (const pool of [ex, sm]) {
      pool.geo.attributes.position.needsUpdate = true;
      pool.geo.attributes.size.needsUpdate = true;
      pool.geo.attributes.alpha.needsUpdate = true;
    }
    W.smMat.uniforms.tint.value.setRGB(lerp(bot[0], 0.62, 0.35), lerp(bot[1], 0.74, 0.35), lerp(bot[2], 0.73, 0.35), THREE.LinearSRGBColorSpace);

    // clouds
    const cloudVis = 1 - ss(0.48, 0.58, p);
    W.clouds.forEach((c, i) => {
      c.sp.position.x = c.base.x + Math.sin(t * 0.05 + i) * 3 + c.drift * t;
      const m = c.sp.material;
      m.opacity = 0.85 * cloudVis;
      m.color.setRGB(lerp(1, top[0], 0.25), lerp(1, top[1], 0.25), lerp(1, top[2], 0.25), THREE.SRGBColorSpace);
    });

    // camera rig: follows the rocket, frames it right on desktop and high on mobile
    const ca = camAt(p);
    const dist = Math.sqrt(ca.off[0] * ca.off[0] + ca.off[2] * ca.off[2] + 1);
    const wide = w >= 1024;
    const endFade = 1 - ss(0.9, 1, p);
    const shiftX = wide ? dist * 0.2 * endFade : 0;
    const shiftY = wide ? 0 : dist * (w < 760 ? 0.2 : 0.12) * endFade;
    const cs = shake * 0.12;
    cam.position.set(ca.off[0] - shiftX + flight.mx * 1.6 + (Math.random() - 0.5) * cs, alt + ca.off[1] - shiftY - flight.my * 0.8 + (Math.random() - 0.5) * cs, ca.off[2]);
    look.set(ca.look[0] - shiftX, alt + ca.look[1] - shiftY, ca.look[2]);
    cam.lookAt(look);

    // space
    const space = ss(0.44, 0.58, p);
    W.starMat.opacity = space;
    W.stars.position.set(cam.position.x * 0.9, cam.position.y * 0.98, cam.position.z * 0.9);
    const eRise = lerp(-1100, w < 760 ? -640 : -560, ss(0.46, 0.66, p));
    W.earth.position.set(40, alt + eRise, -420);
    W.atmo.position.copy(W.earth.position);
    W.earthMat.uniforms.op.value = space;
    W.atmoMat.uniforms.op.value = space;
    W.ground.visible = alt < 400;
    W.bgMat.uniforms.gstr.value = 0.3 * (1 - ss(0.06, 0.2, p)) + ss(0.88, 1, p) * 0.4;
    W.bgMat.uniforms.gpos.value.set(wide ? 0.66 : 0.5, 0.12);
    W.hemi.intensity = lerp(0.85, 0.35, space);
    W.key.intensity = lerp(1.7, 1.2, space);

    gl.autoClear = false;
    gl.clear();
    gl.render(W.bgScene, W.bgCam);
    gl.render(W.scene, cam);
  }, 1);

  return null;
}

export default function AscentScene() {
  const low = typeof window !== 'undefined' && window.innerWidth < 760;
  return (
    <Canvas
      className="stage-canvas"
      dpr={[1, low ? 1.25 : 1.75]}
      gl={{ antialias: !low, alpha: false, powerPreference: 'high-performance' }}
      camera={{ fov: 38, near: 0.1, far: 3000, position: [9.5, 3.6, 23] }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
      frameloop="always"
      aria-label="A polished teal retro rocket with swept fins lifts off from a misty launch pad, climbs through three cloud layers into space above a curved earth, and separates its first stage."
    >
      <World low={low} />
    </Canvas>
  );
}
