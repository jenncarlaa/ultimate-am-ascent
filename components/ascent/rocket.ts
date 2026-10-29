import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { lerp } from '@/lib/flight';

/** The Ascent rocket, shared by the hero flight and the portfolio orbit. */
export function buildRocket(low: boolean) {
  // retro streamliner rocket in polished brand teal: one lathed hull split
  // at the interstage, swept fins that double as landing legs
  const hull = new THREE.MeshPhysicalMaterial({ color: 0x12959d, roughness: 0.24, metalness: 0.9, clearcoat: 1, clearcoatRoughness: 0.18 });
  const fin = new THREE.MeshPhysicalMaterial({ color: 0x0e7f86, roughness: 0.28, metalness: 0.9, clearcoat: 1, clearcoatRoughness: 0.2 });
  const seam = new THREE.MeshStandardMaterial({ color: 0x053238, roughness: 0.45, metalness: 0.6 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x1a2b2e, roughness: 0.3, metalness: 0.85 });
  const seg = low ? 32 : 64;
  const SPLIT = 5.5;
  const profile = new THREE.SplineCurve(
    [[0.36, 0.7], [0.58, 1.2], [0.76, 2.2], [0.82, 3.2], [0.78, 4.4], [0.68, 5.5], [0.54, 6.6], [0.36, 7.8], [0.16, 8.9], [0.0, 9.7]].map(([r, y]) => new THREE.Vector2(r, y)),
  ).getPoints(low ? 40 : 80);
  const radiusAt = (y: number) => {
    for (let i = 1; i < profile.length; i++) if (profile[i].y >= y) {
      const a = profile[i - 1], b = profile[i];
      return lerp(a.x, b.x, (y - a.y) / (b.y - a.y || 1));
    }
    return 0;
  };
  const lower = [new THREE.Vector2(0, 0.7), ...profile.filter((v) => v.y < SPLIT), new THREE.Vector2(radiusAt(SPLIT), SPLIT), new THREE.Vector2(0, SPLIT)];
  const upper = [new THREE.Vector2(0, SPLIT), new THREE.Vector2(radiusAt(SPLIT), SPLIT), ...profile.filter((v) => v.y > SPLIT)];
  const rocket = new THREE.Group(), st1 = new THREE.Group(), st2 = new THREE.Group();
  const add = (g: THREE.Group, geo: THREE.BufferGeometry, mat: THREE.Material, y: number) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.y = y;
    g.add(m);
    return m;
  };
  add(st1, new THREE.LatheGeometry(lower, seg), hull, 0);
  add(st2, new THREE.LatheGeometry(upper, seg), hull, 0);
  // engraved panel seams
  const ring = (g: THREE.Group, y: number) => {
    const m = add(g, new THREE.TorusGeometry(radiusAt(y) + 0.004, 0.014, 8, seg), seam, y);
    m.rotation.x = Math.PI / 2;
  };
  [1.6, 3.9].forEach((y) => ring(st1, y));
  [6.3, 7.5].forEach((y) => ring(st2, y));
  add(st1, new THREE.CylinderGeometry(radiusAt(SPLIT) + 0.02, radiusAt(SPLIT) + 0.03, 0.1, seg), dark, SPLIT - 0.05);
  add(st1, new THREE.CylinderGeometry(0.28, 0.44, 0.5, seg, 1, true), dark, 0.5);
  add(st2, new THREE.CylinderGeometry(0.2, 0.34, 0.36, seg, 1, true), dark, SPLIT - 0.12);
  // swept fin: leading edge curves out from the hull down to a foot on the pad
  const fs = new THREE.Shape();
  fs.moveTo(0.6, 4.4);
  fs.bezierCurveTo(1.3, 3.4, 1.95, 1.7, 1.85, 0.05);
  fs.lineTo(1.68, 0.05);
  fs.bezierCurveTo(1.42, 0.95, 1.0, 1.35, 0.4, 1.1);
  fs.closePath();
  const finGeo = new THREE.ExtrudeGeometry(fs, { depth: 0.07, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3, curveSegments: low ? 16 : 32 });
  finGeo.translate(0, 0, -0.035);
  for (let f = 0; f < 3; f++) {
    const m = new THREE.Mesh(finGeo, fin);
    m.rotation.y = (f * Math.PI * 2) / 3 + Math.PI / 6;
    st1.add(m);
  }
  rocket.add(st1, st2);
  return { rocket, st1, st2, metals: [hull, fin] };
}

/** Studio reflections for the polished hull only; returns a cleanup. */
export function reflect(gl: THREE.WebGLRenderer, metals: THREE.MeshPhysicalMaterial[]) {
  const pmrem = new THREE.PMREMGenerator(gl);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  metals.forEach((m) => {
    m.envMap = env;
    m.envMapIntensity = 1.1;
    m.needsUpdate = true;
  });
  pmrem.dispose();
  return () => env.dispose();
}
