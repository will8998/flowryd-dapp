"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function HeroGlyphs() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const mount = mountRef.current;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 30, 140);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const { clientWidth: W, clientHeight: H } = mount;
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
    camera.position.set(0, 6, 26);

    // lights
    // unify palette to #f3ff97 (0xf3ff97)
    const PALETTE = 0xf3ff97;
    scene.add(new THREE.HemisphereLight(PALETTE, 0x0a0a0a, 0.5));
    const key = new THREE.SpotLight(PALETTE, 3.0, 200, Math.PI / 6, 0.25, 1.5);
    key.position.set(18, 22, 16);
    key.castShadow = true;
    scene.add(key);
    const rim = new THREE.DirectionalLight(PALETTE, 1.4);
    rim.position.set(-18, 8, -12);
    scene.add(rim);

    const resin = (hex: number, emissiveHex: number, opacity = 0.45) =>
      new THREE.MeshPhysicalMaterial({
        color: hex,
        transparent: true,
        opacity,
        roughness: 0.15,
        metalness: 0.0,
        transmission: 0.85,
        thickness: 0.8,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        emissive: new THREE.Color(emissiveHex),
        emissiveIntensity: 0.25,
      });

    const neonMesh = (hex = PALETTE) =>
      new THREE.MeshStandardMaterial({ color: hex, emissive: hex, emissiveIntensity: 1.6, metalness: 0.2, roughness: 0.25 });

    const connectionTube = (points: THREE.Vector3[], radius = 0.06, color = PALETTE) => {
      const curve = new THREE.CatmullRomCurve3(points);
      const geo = new THREE.TubeGeometry(curve, 180, radius, 16, false);
      const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1.2, roughness: 0.35, metalness: 0.0 });
      return new THREE.Mesh(geo, mat);
    };

    const addNode = (p: THREE.Vector3, color = 0x7cffb2, size = 0.24) => {
      const g = new THREE.SphereGeometry(size, 24, 24);
      const m = neonMesh(color);
      const s = new THREE.Mesh(g, m);
      s.position.copy(p);
      s.castShadow = true;
      s.receiveShadow = true;
      return s;
    };

    function createSuperValidator() {
      const group = new THREE.Group();
      [2.2, 1.6, 1.0, 0.45].forEach((r, i) => {
        const torus = new THREE.Mesh(new THREE.TorusGeometry(r, 0.07 + 0.02 * i, 16, 128), resin(PALETTE, PALETTE, 0.35 + 0.06 * i));
        torus.rotation.x = Math.PI / 2;
        group.add(torus);
      });
      const orbit = new THREE.Mesh(new THREE.TorusGeometry(1.9, 0.08, 16, 160), resin(PALETTE, PALETTE, 0.55));
      orbit.rotation.x = Math.PI / 2;
      group.add(orbit);
      [new THREE.Vector3(0, 1.9, 0), new THREE.Vector3(1.9, 0, 0), new THREE.Vector3(0, -1.9, 0), new THREE.Vector3(-1.9, 0, 0)].forEach((p) =>
        group.add(addNode(p))
      );
      const grid = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(6, 6, 0.1, 6, 6, 1)), new THREE.LineBasicMaterial({ color: PALETTE, transparent: true, opacity: 0.25 }));
      grid.position.z = -0.35;
      group.add(grid);
      (group.userData as { tick?: (t: number) => void }).tick = (t: number) => {
        orbit.rotation.z = t * 0.4;
        group.rotation.z = Math.sin(t * 0.2) * 0.15;
      };
      return group;
    }

    function createApplicationBuilder() {
      const group = new THREE.Group();
      [3.0, 2.2, 1.4, 0.7].forEach((s, i) => {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(s, s, 0.08), resin(PALETTE, PALETTE, 0.28 + i * 0.08));
        group.add(mesh);
      });
      const c = 1.7;
      [new THREE.Vector3(c, c, 0), new THREE.Vector3(-c, c, 0), new THREE.Vector3(-c, -c, 0), new THREE.Vector3(c, -c, 0)].forEach((p) =>
        group.add(addNode(p, PALETTE, 0.22))
      );
      (group.userData as { tick?: (t: number) => void }).tick = (t: number) => {
        group.rotation.x = Math.sin(t * 0.35) * 0.25 + 0.3;
        group.rotation.y = t * 0.25;
      };
      return group;
    }

    function createUserValidator() {
      const group = new THREE.Group();
      const makeTri = (r: number, color: number, thick = 0.07) => {
        const pts: THREE.Vector3[] = [];
        for (let i = 0; i < 3; i++) {
          const a = i * ((Math.PI * 2) / 3) - Math.PI / 2;
          pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0));
        }
        pts.push(pts[0].clone());
        const curve = new THREE.CatmullRomCurve3(pts);
        group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color })));
        group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 90, thick, 12, true), neonMesh(color)));
      };
      makeTri(2.0, PALETTE, 0.05);
      makeTri(1.4, PALETTE, 0.04);
      makeTri(0.85, PALETTE, 0.035);
      const r = 2.0;
      for (let i = 0; i < 3; i++) {
        const a = i * ((Math.PI * 2) / 3) - Math.PI / 2;
        group.add(addNode(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0), PALETTE, 0.24));
      }
      (group.userData as { tick?: (t: number) => void }).tick = (t: number) => {
        group.rotation.z = t * 0.3 + 0.3;
      };
      return group;
    }

    const glyphA = createSuperValidator();
    glyphA.position.set(-7.2, 3.4, 0);
    scene.add(glyphA);
    const glyphB = createApplicationBuilder();
    glyphB.position.set(7.2, 2.0, 0);
    scene.add(glyphB);
    const glyphC = createUserValidator();
    glyphC.position.set(0, -4.5, 0);
    scene.add(glyphC);

    const connections = new THREE.Group();
    scene.add(connections);
    const connect = (a: THREE.Vector3, b: THREE.Vector3, wobble = 0.6, height = 2.6, color = 0x7cffb2) => {
      const mid = a.clone().lerp(b, 0.5);
      const perp = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3(0, 1, 0)).normalize();
      const p1 = a.clone();
      const p2 = mid.clone().addScaledVector(perp, wobble).add(new THREE.Vector3(0, height, 0));
      const p3 = mid.clone().addScaledVector(perp, -wobble).add(new THREE.Vector3(0, -height * 0.2, 0));
      const p4 = b.clone();
      return connectionTube([p1, p2, p3, p4], 0.08, color);
    };
    const tubeAB = connect(glyphA.position, glyphB.position, 1.1, 2.4, PALETTE);
    const tubeBC = connect(glyphB.position, glyphC.position, 0.8, 3.2, PALETTE);
    const tubeCA = connect(glyphC.position, glyphA.position, 1.4, 2.2, PALETTE);
    connections.add(tubeAB, tubeBC, tubeCA);

    const starGeo = new THREE.BufferGeometry();
    const starCount = 900;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 140;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 140;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 0.6, color: PALETTE, transparent: true, opacity: 0.35 }));
    scene.add(stars);

    const start = performance.now();
    const glyphs: THREE.Group[] = [glyphA, glyphB, glyphC];
    const animate = () => {
      const t = (performance.now() - start) / 1000;
      [tubeAB, tubeBC, tubeCA].forEach((m, i) => {
        const k = 1.0 + Math.sin(t * (1.2 + 0.2 * i)) * 0.25;
        (m.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.9 * k;
      });
      glyphs.forEach((g) => {
        const tick = (g.userData as { tick?: (v: number) => void }).tick;
        if (tick) tick(t);
      });
      stars.rotation.y = t * 0.01;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      const W = mount.clientWidth;
      const H = mount.clientHeight;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" />;
}


