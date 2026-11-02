"use client";

/**
 * The fire scene, used in the two bounded bottom-corner panels.
 * Plain three (r167) in a single useEffect: one fire quad + GPU embers + instanced shards.
 * No React state in the loop; refs + uniforms only; no per-frame allocation.
 */

import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import * as THREE from "three";
import { EMBER_FRAG, EMBER_VERT, FIRE_FRAG, FIRE_VERT, SHARD_FRAG, SHARD_VERT } from "./fire.glsl";

import { FireQuality, FrameClock, firePixelRatio, QUALITY } from "./firePerformance";
import { observeMotionActivity } from "../motionActivity";

const MAX_DELTA_MS = 50;

export type PointerTarget = { x: number; y: number };

export type FireCanvasProps = {
  /** Target pointer (-1…1) written by Hero; lerped here. */
  pointer: RefObject<PointerTarget>;
  mobile: boolean;
  /** Optional per-instance cap; corner flames share the original total pixel budget. */
  maxPixels?: number;
  /** First frame rendered → Hero fades the canvas in. */
  onReady: () => void;
  /** Too slow / context lost → Hero unmounts us and keeps the poster. */
  onDisable: () => void;
};

/** Small deterministic PRNG so the scene looks the same on every load. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function FireCanvas({ pointer, mobile, maxPixels = Infinity, onReady, onDisable }: FireCanvasProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  // Keep latest callbacks without re-running the effect.
  const cbRef = useRef({ onReady, onDisable });
  cbRef.current = { onReady, onDisable };

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    /* ---------------- renderer ---------------- */
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        premultipliedAlpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      cbRef.current.onDisable();
      return;
    }
    renderer.setClearColor(0x000000, 0);
    const canvas = renderer.domElement;
    canvas.setAttribute("aria-hidden", "true");
    host.appendChild(canvas);

    const quality = new FireQuality(mobile);
    const clock = new FrameClock(mobile ? 30 : 60);
    const maxEmbers = QUALITY[quality.tier].embers;
    const maxShards = QUALITY[quality.tier].shards;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);

    const additive = {
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneFactor,
    } as const;

    /* ---------------- fire quad ---------------- */
    const fireGeo = new THREE.PlaneGeometry(2, 2);
    const fireMat = new THREE.ShaderMaterial({
      vertexShader: FIRE_VERT,
      fragmentShader: FIRE_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uPointer: { value: new THREE.Vector2(0, 0) },
        uQuality: { value: QUALITY[quality.tier].octaves },
      },
      ...additive,
    });
    const fire = new THREE.Mesh(fireGeo, fireMat);
    fire.frustumCulled = false;
    fire.renderOrder = 0;
    scene.add(fire);

    /* ---------------- embers (allocated once at max, drawRange per tier) ---------------- */
    const rand = mulberry32(27);
    const emberPos = new Float32Array(maxEmbers * 3);
    const emberSeed = new Float32Array(maxEmbers);
    for (let i = 0; i < maxEmbers; i++) {
      emberPos[i * 3] = rand();
      emberPos[i * 3 + 1] = rand();
      emberPos[i * 3 + 2] = rand();
      emberSeed[i] = rand();
    }
    const emberGeo = new THREE.BufferGeometry();
    emberGeo.setAttribute("position", new THREE.BufferAttribute(emberPos, 3));
    emberGeo.setAttribute("aSeed", new THREE.BufferAttribute(emberSeed, 1));
    const emberMat = new THREE.ShaderMaterial({
      vertexShader: EMBER_VERT,
      fragmentShader: EMBER_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: 1 },
        uSize: { value: mobile ? 6 : 7 },
        uPointer: fireMat.uniforms.uPointer, // shared uniform object
      },
      ...additive,
    });
    const embers = new THREE.Points(emberGeo, emberMat);
    embers.frustumCulled = false;
    embers.renderOrder = 2;
    scene.add(embers);

    /* ---------------- shards (InstancedMesh, matrices set once) ---------------- */
    const shardGeo = new THREE.OctahedronGeometry(1, 0);
    shardGeo.scale(0.45, 1, 0.45); // elongated "petal" / crystal shape
    const spin = new Float32Array(maxShards * 4);
    const shardMat = new THREE.ShaderMaterial({
      vertexShader: SHARD_VERT,
      fragmentShader: SHARD_FRAG,
      uniforms: {
        uTime: fireMat.uniforms.uTime,
        uPointer: fireMat.uniforms.uPointer,
      },
      ...additive,
    });
    const shards = new THREE.InstancedMesh(shardGeo, shardMat, maxShards);
    {
      const tmp = new THREE.Object3D(); // init-time only
      for (let i = 0; i < maxShards; i++) {
        const z = -4 - rand() * 7; // depth -4…-11
        const side = i % 2 === 0 ? -1 : 1; // keep the centre (logo) clear
        tmp.position.set(side * (1.6 + rand() * 4.5), -1.2 + rand() * 4, z);
        tmp.rotation.set(rand() * 3, rand() * 3, rand() * 3);
        tmp.scale.setScalar(0.12 + rand() * 0.28);
        tmp.updateMatrix();
        shards.setMatrixAt(i, tmp.matrix);
        spin[i * 4] = rand() - 0.5;
        spin[i * 4 + 1] = rand() - 0.5;
        spin[i * 4 + 2] = rand() - 0.5;
        spin[i * 4 + 3] = 0.1 + rand() * 0.35;
      }
    }
    shardGeo.setAttribute("aSpin", new THREE.InstancedBufferAttribute(spin, 4));
    shards.frustumCulled = false;
    shards.renderOrder = 1;
    if (maxShards > 0) scene.add(shards);

    /* ---------------- sizing ---------------- */
    const bufSize = new THREE.Vector2(); // reused, no per-frame allocation
    const resize = () => {
      const w = Math.max(1, host.clientWidth);
      const h = Math.max(1, host.clientHeight);
      const pr = Math.min(
        firePixelRatio(w, h, window.devicePixelRatio, quality.tier, mobile),
        Math.sqrt(Math.max(1, maxPixels) / (w * h)),
        renderer.capabilities.maxTextureSize / Math.max(w, h),
      );
      renderer.setPixelRatio(pr);
      renderer.setSize(w, h, false); // false: CSS keeps 100% → browser upscales
      renderer.getDrawingBufferSize(bufSize);
      fireMat.uniforms.uResolution.value.copy(bufSize);
      emberMat.uniforms.uPixelRatio.value = pr;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    const applyTier = () => {
      const q = QUALITY[quality.tier];
      fireMat.uniforms.uQuality.value = q.octaves;
      emberGeo.setDrawRange(0, q.embers);
      shards.count = q.shards;
      shards.visible = q.shards > 0;
      resize();
    };
    applyTier();

    /* ---------------- loop ---------------- */
    let raf = 0;
    let running = false;
    let active = false;
    let disabled = false;
    let elapsed = 0;
    let readySent = false;
    const ptr = fireMat.uniforms.uPointer.value as THREE.Vector2;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const raw = clock.advance(now);
      if (raw === null) return;
      const dt = Math.min(raw, MAX_DELTA_MS);
      elapsed += dt / 1000;

      // Smoothly follow the pointer target (frame-rate independent lerp).
      const target = pointer.current;
      if (target) {
        const k = Math.min(1, dt * 0.004);
        ptr.x += (target.x - ptr.x) * k;
        ptr.y += (target.y - ptr.y) * k;
      }
      fireMat.uniforms.uTime.value = elapsed;
      emberMat.uniforms.uTime.value = elapsed;

      renderer.render(scene, camera);

      if (!readySent) {
        readySent = true;
        cbRef.current.onReady();
      }

      const action = quality.sample(raw);
      if (action === "disable") {
        disabled = true;
        stop();
        cbRef.current.onDisable();
      } else if (action === "lower") {
        applyTier();
      }
    };

    function start() {
      if (running || !active || disabled) return;
      running = true;
      clock.reset();
      quality.reset();
      raf = requestAnimationFrame(tick);
    }
    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    /* ---------------- pause when off-screen / tab hidden ---------------- */
    const stopObserving = observeMotionActivity(host, (next) => {
      active = next;
      if (active) start();
      else stop();
    });

    let resizeRaf = 0;
    const ro = new ResizeObserver(() => {
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(resize);
    });
    ro.observe(host);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      disabled = true;
      stop();
      cbRef.current.onDisable();
    };
    canvas.addEventListener("webglcontextlost", onContextLost);

    start();

    /* ---------------- cleanup (safe for Strict Mode double-mount) ---------------- */
    return () => {
      stop();
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      stopObserving();
      ro.disconnect();
      canvas.removeEventListener("webglcontextlost", onContextLost);
      fireGeo.dispose();
      fireMat.dispose();
      emberGeo.dispose();
      emberMat.dispose();
      shardGeo.dispose();
      shardMat.dispose();
      shards.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
  }, [mobile, pointer, maxPixels]);

  return <div ref={hostRef} className="absolute inset-0" aria-hidden="true" />;
}
