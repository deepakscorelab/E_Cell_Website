"use client";
import { useEffect, useRef } from "react";

export default function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animationId = 0;
    let inView = false;
    let lastFrame = 0;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let mouse = { x: null, y: null };

    const REPEL_RADIUS = 130;
    const REPEL_STRENGTH = 7;

    const resize = () => {
      const p = canvas.parentElement;
      if (!p) return;
      canvas.width  = p.offsetWidth;
      canvas.height = p.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      if (cx >= rect.left && cx <= rect.right && cy >= rect.top && cy <= rect.bottom) {
        mouse.x = cx - rect.left;
        mouse.y = cy - rect.top;
      } else { mouse.x = null; mouse.y = null; }
    };
    const onLeave = () => { mouse.x = null; mouse.y = null; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onLeave);

    // ══════════════════════════════════════════════════════════════════════════
    // DEEP BLUE SPACE BACKGROUND — matches reference image tone
    // ══════════════════════════════════════════════════════════════════════════
    const drawBackground = () => {
      const W = canvas.width, H = canvas.height;
      // Deep navy-to-indigo gradient like the reference
      const bg = ctx.createRadialGradient(W * 0.5, H * 0.45, 0, W * 0.5, H * 0.5, W * 0.85);
      bg.addColorStop(0,   "rgba(12, 18, 52, 1)");
      bg.addColorStop(0.3, "rgba(8, 12, 40, 1)");
      bg.addColorStop(0.7, "rgba(5, 8, 28, 1)");
      bg.addColorStop(1,   "rgba(2, 4, 16, 1)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
    };

    // ══════════════════════════════════════════════════════════════════════════
    // NEBULA CLOUDS — deep blue/purple volumetric clouds
    // ══════════════════════════════════════════════════════════════════════════
    class Nebula {
      constructor(opts = {}) {
        this.x     = opts.x     !== undefined ? opts.x     : Math.random() * canvas.width;
        this.y     = opts.y     !== undefined ? opts.y     : Math.random() * canvas.height;
        this.rx    = opts.rx    || 300 + Math.random() * 400;
        this.ry    = opts.ry    || 150 + Math.random() * 250;
        this.hue   = opts.hue   || [225, 240, 210, 260][Math.floor(Math.random() * 4)];
        this.alpha = opts.alpha || 0.12 + Math.random() * 0.14;
        this.rot   = Math.random() * Math.PI;
        this.drift = (Math.random() - 0.5) * 0.00006;
        this.layers = opts.layers || 6;
      }
      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot);
        this.rot += this.drift;
        for (let l = 0; l < this.layers; l++) {
          const f   = 1 - l / this.layers;
          const rx  = this.rx * (0.3 + 0.7 * f) * (0.85 + Math.random() * 0.3);
          const ry  = this.ry * (0.3 + 0.7 * f) * (0.85 + Math.random() * 0.3);
          const hue = this.hue + l * 12;
          const sat = 60 + l * 5;
          const lit = 25 + l * 6;
          const a   = this.alpha * f * (0.5 + Math.random() * 0.5);
          const g   = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(rx, ry));
          g.addColorStop(0,   `hsla(${hue},${sat}%,${lit + 20}%,${a})`);
          g.addColorStop(0.4, `hsla(${hue},${sat}%,${lit}%,${a * 0.55})`);
          g.addColorStop(1,   `hsla(${hue},${sat}%,${lit}%,0)`);
          ctx.save();
          ctx.scale(1, ry / rx);
          ctx.beginPath();
          ctx.arc(0, 0, rx, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
          ctx.restore();
        }
        ctx.restore();
      }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // LARGE SPIRAL GALAXY — cinematic, reference-quality
    // ══════════════════════════════════════════════════════════════════════════
    class SpiralGalaxy {
      constructor(cx, cy, opts = {}) {
        this.cx      = cx;
        this.cy      = cy;
        this.arms    = opts.arms    || 3;
        // BIG radius — key change from original
        this.radius  = opts.radius  || Math.min(canvas.width, canvas.height) * (opts.sizeFactor || 0.38);
        this.tilt    = opts.tilt    || 0.38;
        this.rot     = opts.rot     || Math.random() * Math.PI * 2;
        this.speed   = opts.speed   || 0.00008;
        this.coreHue = opts.coreHue || 42;
        this.armHue  = opts.armHue  || 215;
        this.stars   = [];
        this.dust    = [];

        const N = opts.starCount || 2200;
        for (let i = 0; i < N; i++) {
          const arm     = i % this.arms;
          const t       = Math.pow(i / N, 0.75); // concentrate toward center
          const theta   = t * Math.PI * 5.5 + (arm / this.arms) * Math.PI * 2;
          const r       = this.radius * (0.03 + 0.97 * t);
          const scatter = (Math.random() + Math.random() - 1) * r * 0.18;
          const hue     = t < 0.20
            ? this.coreHue + (Math.random() - 0.5) * 25   // warm core
            : this.armHue  + (Math.random() - 0.5) * 55;  // cool blue arms
          this.stars.push({
            angle:  theta + scatter * 0.03,
            radius: r + scatter,
            size:   Math.random() < 0.025
              ? Math.random() * 3.2 + 1.4    // giant stars
              : Math.random() * 1.1 + 0.15,
            alpha:  t < 0.15
              ? 0.45 + Math.random() * 0.5
              : 0.15 + Math.random() * 0.75,
            hue,
            sat:    70 + Math.random() * 28,
            light:  t < 0.15 ? 75 + Math.random() * 22 : 58 + Math.random() * 32,
          });
        }

        // Dust lanes for depth
        for (let i = 0; i < 280; i++) {
          const arm   = i % this.arms;
          const t     = 0.08 + Math.random() * 0.70;
          const theta = t * Math.PI * 4.5 + (arm / this.arms) * Math.PI * 2;
          const r     = this.radius * t;
          this.dust.push({
            angle:  theta + (Math.random() - 0.5) * 0.5,
            radius: r,
            size:   6 + Math.random() * 14,
            alpha:  0.06 + Math.random() * 0.14,
          });
        }
      }

      update() { this.rot += this.speed; }

      draw() {
        // Galaxy detail is fixed in local coordinates. Rasterize once and rotate
        // that image, retaining every star, dust lane and the existing motion.
        if (!this.sprite) {
          const sprite = document.createElement("canvas");
          sprite.width = sprite.height = Math.ceil(this.radius * 3.2 + 32);
          const spriteContext = sprite.getContext("2d");
          if (!spriteContext) return;
          this.paint(spriteContext, sprite.width / 2);
          this.sprite = sprite;
        }
        ctx.save();
        ctx.translate(this.cx, this.cy);
        ctx.scale(1, this.tilt);
        ctx.rotate(this.rot);
        ctx.drawImage(this.sprite, -this.sprite.width / 2, -this.sprite.height / 2);
        ctx.restore();
      }

      paint(ctx, center) {
        ctx.save();
        ctx.translate(center, center);

        // Outer diffuse halo — large, blue, like reference
        const halo = ctx.createRadialGradient(0, 0, this.radius * 0.15, 0, 0, this.radius * 1.45);
        halo.addColorStop(0,    `hsla(${this.coreHue},85%,72%,0.12)`);
        halo.addColorStop(0.3,  `hsla(${this.armHue},75%,52%,0.08)`);
        halo.addColorStop(0.65, `hsla(${this.armHue},65%,38%,0.04)`);
        halo.addColorStop(1,    "rgba(0,0,0,0)");
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 1.45, 0, Math.PI * 2);
        ctx.fill();

        // Dust lanes
        for (const d of this.dust) {
          const x = Math.cos(d.angle) * d.radius;
          const y = Math.sin(d.angle) * d.radius;
          const g = ctx.createRadialGradient(x, y, 0, x, y, d.size);
          g.addColorStop(0, `rgba(0,0,10,${d.alpha * 1.8})`);
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(x, y, d.size, 0, Math.PI * 2);
          ctx.fill();
        }

        // Star particles
        for (const s of this.stars) {
          const x = Math.cos(s.angle) * s.radius;
          const y = Math.sin(s.angle) * s.radius;
          ctx.beginPath();
          ctx.arc(x, y, s.size, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${s.hue},${s.sat}%,${s.light}%,${s.alpha})`;
          if (s.size > 1.5) {
            ctx.shadowBlur  = 10;
            ctx.shadowColor = `hsla(${s.hue},100%,90%,0.85)`;
          }
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Bright warm nucleus — multi-layered like reference
        for (let ring = 0; ring < 4; ring++) {
          const frac = ring / 3;
          const nuc = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius * (0.04 + 0.22 * frac));
          if (ring === 0) {
            nuc.addColorStop(0,   `hsla(60,100%,100%,0.98)`);
            nuc.addColorStop(0.3, `hsla(50,100%,95%,0.90)`);
            nuc.addColorStop(1,   `hsla(${this.coreHue},95%,80%,0)`);
          } else {
            nuc.addColorStop(0,   `hsla(${this.coreHue + 15},95%,88%,${0.55 - frac * 0.35})`);
            nuc.addColorStop(0.5, `hsla(${this.coreHue},80%,62%,${0.35 - frac * 0.25})`);
            nuc.addColorStop(1,   `hsla(${this.armHue},65%,40%,0)`);
          }
          ctx.fillStyle = nuc;
          ctx.beginPath();
          ctx.arc(0, 0, this.radius * (0.04 + 0.22 * frac), 0, Math.PI * 2);
          ctx.fill();
        }

        // Lens-flare spikes (4-pointed like reference bright stars)
        ctx.save();
        ctx.globalAlpha = 0.28;
        for (let i = 0; i < 4; i++) {
          ctx.save();
          ctx.rotate((i / 4) * Math.PI);
          const spikeLen = this.radius * 0.38;
          const spike = ctx.createLinearGradient(0, -spikeLen, 0, spikeLen);
          spike.addColorStop(0,   "rgba(255,255,255,0)");
          spike.addColorStop(0.5, `hsla(${this.coreHue + 20},100%,97%,0.9)`);
          spike.addColorStop(1,   "rgba(255,255,255,0)");
          ctx.fillStyle = spike;
          ctx.fillRect(-1.5, -spikeLen, 3, spikeLen * 2);
          ctx.restore();
        }
        ctx.restore();

        ctx.restore();
      }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // ORBITAL RINGS — the teal/cyan ellipses from the reference image
    // ══════════════════════════════════════════════════════════════════════════
    class OrbitalRing {
      constructor(cx, cy, opts = {}) {
        this.cx       = cx;
        this.cy       = cy;
        this.rx       = opts.rx    || 120 + Math.random() * 180;
        this.ry       = opts.ry    || this.rx * (0.25 + Math.random() * 0.3);
        this.rot      = opts.rot   || Math.random() * Math.PI;
        this.tilt     = opts.tilt  || (Math.random() - 0.5) * 0.8;
        this.hue      = opts.hue   || 175 + Math.random() * 40; // teal-cyan
        this.alpha    = opts.alpha || 0.35 + Math.random() * 0.3;
        this.speed    = opts.speed || 0.0006 * (Math.random() < 0.5 ? 1 : -1);
        this.dash     = opts.dash  !== false;
        this.dotCount = opts.dotCount || Math.floor(3 + Math.random() * 5);
        this.dotAngle = Math.random() * Math.PI * 2;
        this.dotSpeed = this.speed * (1.2 + Math.random() * 0.8);
        this.glow     = opts.glow !== false;
      }

      update() {
        this.rot      += this.speed;
        this.dotAngle += this.dotSpeed;
      }

      draw() {
        ctx.save();
        ctx.translate(this.cx, this.cy);
        ctx.rotate(this.tilt);

        // Glow pass underneath
        if (this.glow) {
          ctx.save();
          ctx.globalAlpha = this.alpha * 0.25;
          ctx.shadowBlur  = 18;
          ctx.shadowColor = `hsla(${this.hue},100%,75%,1)`;
          ctx.beginPath();
          ctx.ellipse(0, 0, this.rx, this.ry, this.rot, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(${this.hue},100%,75%,1)`;
          ctx.lineWidth   = 3.5;
          ctx.stroke();
          ctx.restore();
        }

        // Main ring — slightly dashed like reference
        ctx.beginPath();
        ctx.ellipse(0, 0, this.rx, this.ry, this.rot, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${this.hue},90%,72%,${this.alpha})`;
        ctx.lineWidth   = 1.2;
        if (this.dash) ctx.setLineDash([8, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Glowing dots on the ring (like orbiting objects in reference)
        for (let d = 0; d < this.dotCount; d++) {
          const angle = this.dotAngle + (d / this.dotCount) * Math.PI * 2;
          const dx = Math.cos(angle) * this.rx;
          const dy = Math.sin(angle) * this.ry;
          // Apply ring rotation
          const rx2 = dx * Math.cos(this.rot) - dy * Math.sin(this.rot);
          const ry2 = dx * Math.sin(this.rot) + dy * Math.cos(this.rot);

          const dotSize = d === 0 ? 3.5 : 1.8;
          const dotAlpha = d === 0 ? 0.95 : 0.6;

          ctx.beginPath();
          ctx.arc(rx2, ry2, dotSize, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${this.hue},100%,88%,${dotAlpha})`;
          ctx.shadowBlur  = d === 0 ? 14 : 6;
          ctx.shadowColor = `hsla(${this.hue},100%,85%,0.9)`;
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        ctx.restore();
      }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // TWINKLING STARS — dense field matching reference's blue-white starfield
    // ══════════════════════════════════════════════════════════════════════════
    class Star {
      constructor(forceBottom = false) { this.forceBottom = forceBottom; this.reset(); }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = this.forceBottom
          ? canvas.height * (0.55 + Math.random() * 0.45)
          : Math.random() * canvas.height;
        // Larger star sizes for more visual presence
        this.r = this.forceBottom
          ? Math.random() * 2.2 + 0.3
          : Math.random() * 1.8 + 0.2;
        this.alpha = Math.random();
        this.dA    = (Math.random() * 0.007 + 0.001) * (Math.random() < 0.5 ? 1 : -1);
        const roll = Math.random();
        if      (roll < 0.50) { this.hue = 215; this.sat = 75; this.lit = 92; } // blue-white (dominant in ref)
        else if (roll < 0.68) { this.hue = 200; this.sat = 85; this.lit = 88; } // cyan-white
        else if (roll < 0.80) { this.hue = 45;  this.sat = 90; this.lit = 95; } // yellow
        else if (roll < 0.92) { this.hue = 20;  this.sat = 80; this.lit = 82; } // orange
        else                  { this.hue = 0;   this.sat = 90; this.lit = 78; } // red
        this.bright = this.r > 1.4 && Math.random() < 0.3;
      }
      update() {
        this.alpha += this.dA;
        if (this.alpha > 1 || this.alpha < 0) this.dA *= -1;
      }
      draw() {
        const a = Math.max(0, Math.min(1, this.alpha));
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue},${this.sat}%,${this.lit}%,${a})`;
        if (this.bright) {
          ctx.shadowBlur  = 8;
          ctx.shadowColor = `hsla(${this.hue},${this.sat}%,${this.lit}%,0.85)`;
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        // Cross diffraction on bright stars
        if (this.bright && a > 0.45) {
          const spikeLen = this.r * 6;
          ctx.save();
          ctx.globalAlpha = a * 0.4;
          for (let i = 0; i < 2; i++) {
            ctx.beginPath();
            ctx.moveTo(this.x - (i === 0 ? spikeLen : 0), this.y - (i === 1 ? spikeLen : 0));
            ctx.lineTo(this.x + (i === 0 ? spikeLen : 0), this.y + (i === 1 ? spikeLen : 0));
            ctx.strokeStyle = `hsla(${this.hue},${this.sat}%,${this.lit}%,1)`;
            ctx.lineWidth   = 0.6;
            ctx.stroke();
          }
          ctx.restore();
        }
      }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // BRIGHT FOREGROUND STARS — the large glowing stars from reference
    // ══════════════════════════════════════════════════════════════════════════
    class BrightStar {
      constructor(x, y, opts = {}) {
        this.x     = x;
        this.y     = y;
        this.r     = opts.r    || 3 + Math.random() * 5;
        this.hue   = opts.hue  || [45, 200, 30, 55][Math.floor(Math.random() * 4)];
        this.alpha = 0.7 + Math.random() * 0.3;
        this.dA    = (Math.random() * 0.004 + 0.001) * (Math.random() < 0.5 ? 1 : -1);
        this.spikeLen = this.r * (8 + Math.random() * 10);
      }
      update() {
        this.alpha += this.dA;
        if (this.alpha > 1)   { this.alpha = 1;   this.dA *= -1; }
        if (this.alpha < 0.5) { this.alpha = 0.5; this.dA *= -1; }
      }
      draw() {
        const a = this.alpha;
        // Multi-layer glow
        for (let ring = 3; ring >= 0; ring--) {
          const gr = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * (1 + ring * 3));
          gr.addColorStop(0,   `hsla(${this.hue},100%,98%,${a * (0.95 - ring * 0.2)})`);
          gr.addColorStop(0.3, `hsla(${this.hue},95%,80%,${a * (0.5 - ring * 0.1)})`);
          gr.addColorStop(1,   "rgba(0,0,0,0)");
          ctx.fillStyle = gr;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.r * (1 + ring * 3), 0, Math.PI * 2);
          ctx.fill();
        }

        // Core
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(60,100%,100%,${a})`;
        ctx.fill();

        // 4-pointed diffraction spikes
        ctx.save();
        ctx.globalAlpha = a * 0.55;
        for (let i = 0; i < 4; i++) {
          ctx.save();
          ctx.translate(this.x, this.y);
          ctx.rotate((i / 4) * Math.PI);
          const spike = ctx.createLinearGradient(0, -this.spikeLen, 0, this.spikeLen);
          spike.addColorStop(0,   "rgba(255,255,255,0)");
          spike.addColorStop(0.5, `hsla(${this.hue},90%,96%,0.85)`);
          spike.addColorStop(1,   "rgba(255,255,255,0)");
          ctx.fillStyle = spike;
          ctx.fillRect(-1.2, -this.spikeLen, 2.4, this.spikeLen * 2);
          ctx.restore();
        }
        ctx.restore();
      }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // SHOOTING STARS
    // ══════════════════════════════════════════════════════════════════════════
    class ShootingStar {
      constructor() { this.reset(); }
      reset() {
        this.x     = Math.random() * canvas.width * 0.7;
        this.y     = Math.random() * canvas.height * 0.5;
        this.len   = 100 + Math.random() * 200;
        this.speed = 10 + Math.random() * 16;
        this.angle = Math.PI / 6 + (Math.random() - 0.5) * 0.4;
        this.life  = 0;
        this.maxLife = 28 + Math.random() * 32;
        this.hue   = 195 + Math.random() * 50;
        this.active = false;
        this.nextSpawn = 150 + Math.floor(Math.random() * 500);
        this.timer = 0;
      }
      update() {
        this.timer++;
        if (!this.active && this.timer >= this.nextSpawn) {
          this.active = true;
          this.x    = Math.random() * canvas.width * 0.7;
          this.y    = Math.random() * canvas.height * 0.35;
          this.life = 0;
        }
        if (this.active) {
          this.x    += Math.cos(this.angle) * this.speed;
          this.y    += Math.sin(this.angle) * this.speed;
          this.life++;
          if (this.life >= this.maxLife) {
            this.active = false;
            this.timer = 0;
            this.nextSpawn = 150 + Math.floor(Math.random() * 500);
          }
        }
      }
      draw() {
        if (!this.active) return;
        const frac  = this.life / this.maxLife;
        const alpha = frac < 0.2 ? frac / 0.2 : frac > 0.7 ? (1 - frac) / 0.3 : 1;
        const tailX = this.x - Math.cos(this.angle) * this.len;
        const tailY = this.y - Math.sin(this.angle) * this.len;
        const grad  = ctx.createLinearGradient(tailX, tailY, this.x, this.y);
        grad.addColorStop(0, "rgba(0,0,0,0)");
        grad.addColorStop(0.6, `hsla(${this.hue},90%,85%,${alpha * 0.3})`);
        grad.addColorStop(1,   `hsla(${this.hue},100%,98%,${alpha})`);
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth   = 1.8;
        ctx.shadowBlur  = 10;
        ctx.shadowColor = `hsla(${this.hue},100%,90%,${alpha})`;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha * 0.95})`;
        ctx.fill();
      }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // INTERACTIVE PARTICLES
    // ══════════════════════════════════════════════════════════════════════════
    class Particle {
      constructor() { this.init(); }
      init() {
        this.originX = Math.random() * canvas.width;
        this.originY = Math.random() * canvas.height;
        this.x = this.originX; this.y = this.originY;
        this.vx = 0; this.vy = 0;
        this.size = Math.random() * 2.0 + 0.5;
        const hues = [200, 215, 230, 250, 270];
        const hue  = hues[Math.floor(Math.random() * hues.length)];
        this.color     = `hsla(${hue},90%,${68 + Math.random() * 22}%,${0.45 + Math.random() * 0.40})`;
        this.glowColor = `hsla(${hue},100%,80%,0.35)`;
      }
      update() {
        this.vx += (this.originX - this.x) * 0.055;
        this.vy += (this.originY - this.y) * 0.055;
        if (mouse.x !== null) {
          const mdx = this.x - mouse.x, mdy = this.y - mouse.y;
          const dist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (dist < REPEL_RADIUS && dist > 0) {
            const f = ((REPEL_RADIUS - dist) / REPEL_RADIUS) * REPEL_STRENGTH;
            this.vx += (mdx / dist) * f;
            this.vy += (mdy / dist) * f;
          }
        }
        this.vx *= 0.80; this.vy *= 0.80;
        this.x += this.vx; this.y += this.vy;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur  = 7;
        ctx.shadowColor = this.glowColor;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // ── BUILD SCENE ───────────────────────────────────────────────────────────
    const W = canvas.width, H = canvas.height;

    // Nebulae — large deep blue-purple clouds filling the space
    const nebulae = [
      new Nebula({ x: W * 0.50, y: H * 0.48, rx: 500, ry: 280, hue: 230, alpha: 0.16, layers: 7 }),
      new Nebula({ x: W * 0.20, y: H * 0.35, rx: 320, ry: 180, hue: 215, alpha: 0.12, layers: 5 }),
      new Nebula({ x: W * 0.80, y: H * 0.55, rx: 280, ry: 160, hue: 245, alpha: 0.11, layers: 5 }),
      new Nebula({ x: W * 0.10, y: H * 0.70, rx: 220, ry: 130, hue: 200, alpha: 0.10, layers: 4 }),
      new Nebula({ x: W * 0.90, y: H * 0.20, rx: 200, ry: 120, hue: 260, alpha: 0.09, layers: 4 }),
    ];

    // Dense star field — blue-white like reference
    const stars = [
      ...Array.from({ length: 320 }, () => new Star(false)),
      ...Array.from({ length: 420 }, () => new Star(true)),
    ];

    // THREE large spiral galaxies like reference (center, left-small, right)
    const galaxies = [
      // Centre hero galaxy — large, warm core + blue arms
      new SpiralGalaxy(W * 0.50, H * 0.48, {
        arms: 3, sizeFactor: 0.42, tilt: 0.36,
        coreHue: 42, armHue: 215,
        starCount: 2400, speed: 0.000075,
      }),
      // Left smaller galaxy — like the elliptical in reference top-left
      new SpiralGalaxy(W * 0.13, H * 0.38, {
        arms: 2, sizeFactor: 0.16, tilt: 0.50,
        coreHue: 38, armHue: 220,
        starCount: 650, speed: 0.00013,
      }),
      // Right galaxy — like reference right side
      new SpiralGalaxy(W * 0.88, H * 0.45, {
        arms: 2, sizeFactor: 0.14, tilt: 0.45,
        coreHue: 48, armHue: 225,
        starCount: 550, speed: 0.00015,
      }),
    ];

    // Orbital rings — teal/cyan ellipses from reference
    const orbitalRings = [
      // Large rings around centre galaxy
      new OrbitalRing(W * 0.50, H * 0.48, { rx: W*0.26, ry: H*0.10, hue: 175, alpha: 0.50, speed:  0.00045, dotCount: 5, dash: false }),
      new OrbitalRing(W * 0.50, H * 0.48, { rx: W*0.32, ry: H*0.13, hue: 185, alpha: 0.38, speed: -0.00035, dotCount: 4, dash: true  }),
      new OrbitalRing(W * 0.50, H * 0.48, { rx: W*0.18, ry: H*0.07, hue: 165, alpha: 0.42, speed:  0.00065, dotCount: 3, dash: false }),
      // Ring around left galaxy
      new OrbitalRing(W * 0.13, H * 0.38, { rx: W*0.09, ry: H*0.04, hue: 190, alpha: 0.45, speed:  0.00080, dotCount: 3, dash: false }),
      // Ring around right galaxy
      new OrbitalRing(W * 0.88, H * 0.45, { rx: W*0.08, ry: H*0.035, hue: 180, alpha: 0.42, speed: -0.00070, dotCount: 3, dash: true  }),
    ];

    // Bright foreground stars scattered across canvas like reference
    const brightStars = [
      new BrightStar(W * 0.07, H * 0.15, { r: 4.5, hue: 50  }),
      new BrightStar(W * 0.93, H * 0.12, { r: 3.5, hue: 200 }),
      new BrightStar(W * 0.72, H * 0.82, { r: 5.0, hue: 45  }),
      new BrightStar(W * 0.25, H * 0.78, { r: 3.8, hue: 55  }),
      new BrightStar(W * 0.38, H * 0.10, { r: 2.8, hue: 210 }),
      new BrightStar(W * 0.62, H * 0.88, { r: 3.2, hue: 40  }),
      new BrightStar(W * 0.85, H * 0.65, { r: 2.5, hue: 190 }),
    ];

    const shootingStars = Array.from({ length: 3 }, () => new ShootingStar());

    const PCNT = Math.min(220, Math.floor((W * H) / 7000));
    const particles = Array.from({ length: PCNT }, () => new Particle());

    const onResize = () => particles.forEach(p => p.init());
    window.addEventListener("resize", onResize);

    // Mesh lines
    const MAX_LINE = 80;
    const drawLines = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < MAX_LINE * MAX_LINE) {
            const a = (1 - Math.sqrt(d2) / MAX_LINE) * 0.12;
            ctx.strokeStyle = `rgba(120,160,255,${a})`;
            ctx.lineWidth = 0.45;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    // ── ANIMATE ───────────────────────────────────────────────────────────────
    const animate = (now) => {
      animationId = 0;
      if (!inView || document.hidden) return;
      // Existing background physics is calibrated to 60 updates/second.
      // Avoid doubling work and animation speed on 120/144 Hz displays.
      if (lastFrame && now - lastFrame < 1000 / 60) {
        animationId = requestAnimationFrame(animate);
        return;
      }
      lastFrame = lastFrame ? now - ((now - lastFrame) % (1000 / 60)) : now;
      // Draw deep blue space background first
      drawBackground();

      nebulae.forEach(n => n.draw());
      stars.forEach(s => { s.update(); s.draw(); });
      shootingStars.forEach(s => { s.update(); s.draw(); });

      // Draw galaxies before rings (rings sit on top)
      galaxies.forEach(g => { g.update(); g.draw(); });

      // Orbital rings on top of galaxies
      orbitalRings.forEach(r => { r.update(); r.draw(); });

      // Bright foreground stars on top of everything
      brightStars.forEach(s => { s.update(); s.draw(); });

      drawLines();
      particles.forEach(p => { p.update(); p.draw(); });

      if (!reducedMotion.matches) animationId = requestAnimationFrame(animate);
    };
    const stop = () => {
      if (animationId) cancelAnimationFrame(animationId);
      animationId = 0;
      lastFrame = 0;
    };
    const start = () => {
      if (inView && !document.hidden && !animationId) animationId = requestAnimationFrame(animate);
    };
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) start();
      else stop();
    });
    io.observe(canvas);
    const onVisibility = () => document.hidden ? stop() : start();
    const onMotion = () => { stop(); start(); };
    document.addEventListener("visibilitychange", onVisibility);
    reducedMotion.addEventListener("change", onMotion);

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      reducedMotion.removeEventListener("change", onMotion);
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position     : "absolute",
        top          : 0,
        left         : 0,
        width        : "100%",
        height       : "100%",
        pointerEvents: "none",
        zIndex       : 0,
        display      : "block",
      }}
    />
  );
}