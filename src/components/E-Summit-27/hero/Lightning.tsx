'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { observeMotionActivity } from '../motionActivity';
import { FrameClock } from './firePerformance';
import { LightningStrikes, MAX_LIGHTNING_STRIKES } from './lightningStrikes';

import './Lightning.css';

const MAX_BOLTS = 4;
const MAX_STRIKES = MAX_LIGHTNING_STRIKES;

const VERTEX = `#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAGMENT = `#version 300 es
precision highp float;

uniform vec2 uResolution;
uniform float uPhase;
uniform vec3 uColor;
uniform float uIntensity;
uniform float uSize;
uniform float uThickness;
uniform float uGlow;
uniform float uFlicker;
uniform float uBranches;
uniform float uXOffset;
uniform float uAngle;
uniform float uSpread;
uniform int uBolts;
uniform vec4 uPointer;
uniform vec4 uStrikes[${MAX_STRIKES}];
uniform vec4 uStrikeInfo[${MAX_STRIKES}];
uniform float uFlash;
uniform float uIntro;
uniform float uLight;
uniform float uFade;
uniform float uOpacity;

out vec4 outColor;

const float TAU = 6.28318530718;
const float PERIOD = 8.0;
const float WARP = 2.1;

vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy) * 2.0 - 1.0;
}

float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}

float gnoise(vec2 p, float period) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = dot(hash22(mod(i, period)), f);
  float b = dot(hash22(mod(i + vec2(1.0, 0.0), period)), f - vec2(1.0, 0.0));
  float c = dot(hash22(mod(i + vec2(0.0, 1.0), period)), f - vec2(0.0, 1.0));
  float d = dot(hash22(mod(i + vec2(1.0, 1.0), period)), f - vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  float period = PERIOD;
  for (int i = 0; i < 8; i++) {
    if (i >= octaves) break;
    value += amplitude * gnoise(p, period);
    p = p * 2.0 + vec2(17.0, 31.0);
    period *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

float warpField(vec2 q, float base, float reach, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  float period = PERIOD;
  for (int i = 0; i < 8; i++) {
    if (i >= octaves) break;
    float weight = 1.0;
    if (i >= 3) {
      float estimate = abs(base + value * WARP);
      weight = 1.0 - smoothstep(reach * 0.6, reach, estimate);
      if (weight <= 0.0) break;
      reach *= 0.62;
    }
    value += amplitude * gnoise(q, period) * weight;
    q = q * 2.0 + vec2(17.0, 31.0);
    period *= 2.0;
    amplitude *= 0.5;
  }
  return value * WARP;
}

float flicker(float seed) {
  float steady = 0.82 + 0.18 * sin(TAU * (uPhase * 13.0 + seed)) * sin(TAU * (uPhase * 7.0 + seed * 1.7));
  float burst = 0.0;
  for (int j = 0; j < 3; j++) {
    float at = hash11(seed * 17.0 + float(j) * 5.3);
    float since = fract(uPhase - at) * 10.0;
    burst += exp(-since * 7.0) * (0.75 + 0.45 * sin(since * 70.0));
  }
  return mix(1.0, steady + burst * 0.9, uFlicker);
}

float glow(float d, float width) {
  float reach = d / (width * 3.5);
  return width / (d + width * 0.08) / (1.0 + reach * reach);
}

vec2 gDrift;
float gWidth;
float gCore;
float gPixel;

vec3 bolt(
  vec2 p,
  vec2 offset,
  float seed,
  float pinned,
  float front,
  float strength,
  float branches,
  float blink,
  float branchGain,
  vec2 range,
  float heat,
  int octaves
) {
  vec2 q = p * uSize + gDrift + offset;
  float pin = pinned > 0.5 ? fbm(gDrift + offset, octaves) * WARP : 0.0;
  float warp = warpField(q, p.x - pin, 1.3 * max(1.0, uGlow), octaves) - pin;
  float crackle = heat > 0.001 ? heat * 0.012 * gnoise(q * 9.0 + vec2(41.0, 7.0), PERIOD * 9.0) : 0.0;
  float x = p.x + warp + crackle;
  float d = length(vec2(x, max(front - p.y, 0.0)));
  float energy = glow(d, gWidth * (1.0 + heat * 0.6)) * strength;
  float core = (1.0 - smoothstep(gCore - gPixel, gCore + gPixel, d)) * min(strength, 1.6);
  float line = glow(d, gWidth * 0.55) * strength;

  for (int k = 0; k < 6; k++) {
    float order = float(k) + 0.5;
    if (order > branches + heat * 2.0) break;
    float h = seed * 31.0 + float(k) * 13.7;
    float start = mix(range.x, range.y, hash11(h));
    float span = mix(0.22, 0.7, hash11(h + 3.0));
    if (pinned > 0.5) span = min(span, max(start - 0.04, 0.06));
    float along = (start - p.y) / span;
    if (along <= 0.0 || along >= 1.0) continue;
    float side = hash11(h + 1.0) > 0.5 ? 1.0 : -1.0;
    float slope = mix(0.35, 1.15, hash11(h + 2.0));
    float offset = x - side * slope * (start - p.y);
    if (abs(offset) - 0.12 * along > gWidth * 13.0) continue;
    float gain = branchGain;
    if (blink > 0.5) {
      float window = fract(uPhase * 3.0 + hash11(h + 4.0));
      float shown = smoothstep(0.0, 0.03, window) * (1.0 - smoothstep(0.3, 0.42, window));
      gain *= max(shown, heat * 0.8);
      if (gain <= 0.001) continue;
      gain *= flicker(seed + order);
    }
    if (gain <= 0.001) continue;
    vec2 jq = q * 3.0 + vec2(order * 11.0, order * 5.0);
    float jag = (gnoise(jq, PERIOD * 3.0) * 0.12 + gnoise(jq * 3.0 + vec2(5.0, 9.0), PERIOD * 9.0) * 0.035) * along;
    float bd = abs(offset - jag);
    float taper = pow(1.0 - along, 1.6) * smoothstep(0.0, 0.2, along) * smoothstep(front, front + 0.08, p.y);
    energy += glow(bd, gWidth * 0.4) * taper * gain;
    line += glow(bd, gWidth * 0.2) * taper * gain;
    core += (1.0 - smoothstep(gCore * 0.6 - gPixel, gCore * 0.6 + gPixel, bd)) * taper * min(gain, 1.0) * 0.8;
  }
  return vec3(energy, core, line);
}

void main() {
  vec2 uv = (2.0 * gl_FragCoord.xy - uResolution) / uResolution.y;
  gPixel = 2.0 / uResolution.y;
  gDrift = vec2(PERIOD) * uPhase;
  gWidth = 0.07 * uGlow;
  gCore = 0.0032 * uThickness;
  float ca = cos(uAngle);
  float sa = sin(uAngle);
  mat2 turn = mat2(ca, -sa, sa, ca);
  vec2 local = turn * uv;
  vec2 pointer = turn * uPointer.xy;
  vec2 toPointer = uv - uPointer.xy;
  float heat = uPointer.z * exp(-dot(toPointer, toPointer) / 0.09);
  int octaves = uResolution.y > 1400.0 ? 8 : 7;

  float energy = 0.0;
  float core = 0.0;
  float line = 0.0;

  for (int b = 0; b < ${MAX_BOLTS}; b++) {
    if (b >= uBolts) break;
    float seed = float(b) * 7.13 + 0.37;
    float lane = uXOffset + (float(b) - 0.5 * float(uBolts - 1)) * uSpread;
    vec2 p = local - vec2(lane, 0.0);
    float near = exp(-pow(pointer.x - lane, 2.0) / 0.5);
    float lean = uPointer.z * uPointer.w * near * exp(-pow(p.y - pointer.y, 2.0) / 0.14);
    p.x -= lean * clamp(pointer.x - lane, -0.45, 0.45) * 0.55;
    float reveal = uIntro >= 1.0 ? 1.0 : smoothstep(0.0, 0.08, uv.y - (1.1 - 2.4 * uIntro));
    float strength = flicker(seed) * reveal * (1.0 + heat * 1.4) * (1.0 + uFlash);
    vec3 hit = bolt(
      p,
      vec2(float(b) * 3.0, float(b) * 5.0),
      seed,
      0.0,
      -1000.0,
      strength,
      uBranches * 6.0,
      1.0,
      reveal,
      vec2(-0.75, 0.9),
      heat,
      octaves
    );
    energy += hit.x;
    core += hit.y;
    line += hit.z;
  }

  for (int j = 0; j < ${MAX_STRIKES}; j++) {
    vec4 strike = uStrikes[j];
    if (strike.w <= 0.001) continue;
    vec4 info = uStrikeInfo[j];
    vec2 p = local - turn * strike.xy;
    if (p.y < strike.z - 1.6) continue;
    vec3 hit = bolt(
      p,
      vec2(info.x * 0.731, info.x * 1.377),
      info.x,
      1.0,
      strike.z,
      strike.w,
      uBranches * 6.0,
      0.0,
      strike.w,
      vec2(0.12, info.y),
      heat,
      octaves
    );
    energy += hit.x + info.z * strike.w * glow(length(p), gWidth * 0.5) * 0.12;
    core += hit.y;
    line += hit.z;
  }

  float e = energy * uIntensity * 0.6;
  float hot = clamp(core + smoothstep(6.0, 20.0, e) * 0.55, 0.0, 1.0);
  vec2 edge = min(gl_FragCoord.xy, uResolution - gl_FragCoord.xy) / (uResolution.y * max(uFade, 0.0001) * 0.5);
  float fade = uFade > 0.0 ? smoothstep(0.0, 1.0, edge.x) * smoothstep(0.0, 1.0, edge.y) : 1.0;

  vec3 rgb;
  float alpha;
  if (uLight > 0.5) {
    float stroke = smoothstep(1.0, 3.6, line * uIntensity);
    float halo = 1.0 - exp(-e * 0.35);
    vec3 ink = uColor * 0.82;
    alpha = clamp(stroke + halo * 0.15, 0.0, 1.0);
    rgb = mix(ink, vec3(1.0), hot * 0.85) * alpha;
  } else {
    vec3 lit = 1.0 - exp(-uColor * e * 0.9);
    rgb = mix(lit, vec3(1.0), hot);
    alpha = clamp(max(rgb.r, max(rgb.g, rgb.b)), 0.0, 1.0);
  }
  float keep = fade * uOpacity;
  outColor = vec4(rgb * keep, alpha * keep);
}
`;


interface LightningProps {
  color?: string;
  bolts?: number;
  spread?: number;
  branches?: number;
  xOffset?: number;
  angle?: number;
  size?: number;
  thickness?: number;
  glow?: number;
  intensity?: number;
  speed?: number;
  flicker?: number;
  clickStrike?: boolean;
  fade?: number;
  opacity?: number;
  paused?: boolean;
  dpr?: number;
  className?: string;
  style?: CSSProperties;
}

const toRgb = (color: string): [number, number, number] => {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim());
  if (!match) return [0.56, 0.19, 0.94];
  const hex = match[1].length === 3 ? match[1].replace(/./g, digit => digit + digit) : match[1];
  return [0, 2, 4].map(index => parseInt(hex.slice(index, index + 2), 16) / 255) as [number, number, number];
};

const compile = (gl: WebGL2RenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
};

const UNIFORMS = [
  'uResolution', 'uPhase', 'uColor', 'uIntensity', 'uSize', 'uThickness',
  'uGlow', 'uFlicker', 'uBranches', 'uXOffset', 'uAngle', 'uSpread', 'uBolts',
  'uPointer', 'uStrikes', 'uStrikeInfo', 'uFlash', 'uIntro', 'uLight', 'uFade', 'uOpacity',
];

/**
 * React Bits Lightning shader by David Haz (see Lightning.LICENSE.md).
 * https://github.com/DavidHDev/react-bits/blob/main/src/ts-default/Backgrounds/Lightning/Lightning.tsx
 * Local renderer: transparent output, bounded resolution, 30 fps, visibility/
 * reduced-motion pause and context recovery. Click strikes use a fixed pool;
 * a passive window listener leaves native links, touch and controls usable.
 */
export default function Lightning({
  color = '#9030f0',
  bolts = 2,
  spread = 1.4,
  branches = 0.3,
  xOffset = 0,
  angle = 0,
  size = 1,
  thickness = 0.7,
  glow = 0.65,
  intensity = 0.65,
  speed = 0.6,
  flicker = 0.12,
  clickStrike = true,
  fade = 0,
  opacity = 0.72,
  paused = false,
  dpr,
  className = '',
  style,
}: LightningProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const refreshRef = useRef<(() => void) | null>(null);
  const strikeCountRef = useRef(0);
  const [contextVersion, setContextVersion] = useState(0);
  const settingsRef = useRef({ color, bolts, spread, branches, xOffset, angle, size,
    thickness, glow, intensity, speed, flicker, clickStrike, fade, opacity, paused, dpr });
  settingsRef.current = { color, bolts, spread, branches, xOffset, angle, size,
    thickness, glow, intensity, speed, flicker, clickStrike, fade, opacity, paused, dpr };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let gl: WebGL2RenderingContext | null;
    try {
      gl = canvas.getContext('webgl2', {
        alpha: true, premultipliedAlpha: true, antialias: false,
        depth: false, stencil: false, powerPreference: 'low-power',
      });
    } catch { return; }
    if (!gl) return;
    const context = gl;
    const vertex = compile(context, context.VERTEX_SHADER, VERTEX);
    const fragment = compile(context, context.FRAGMENT_SHADER, FRAGMENT);
    const program = context.createProgram();
    if (!vertex || !fragment || !program) {
      if (vertex) context.deleteShader(vertex);
      if (fragment) context.deleteShader(fragment);
      if (program) context.deleteProgram(program);
      return;
    }
    context.attachShader(program, vertex);
    context.attachShader(program, fragment);
    context.linkProgram(program);
    context.deleteShader(vertex);
    context.deleteShader(fragment);
    if (!context.getProgramParameter(program, context.LINK_STATUS)) {
      context.deleteProgram(program);
      return;
    }
    const buffer = context.createBuffer();
    if (!buffer) { context.deleteProgram(program); return; }
    context.bindBuffer(context.ARRAY_BUFFER, buffer);
    context.bufferData(context.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), context.STATIC_DRAW);
    const position = context.getAttribLocation(program, 'aPosition');
    if (position < 0) {
      context.deleteBuffer(buffer);
      context.deleteProgram(program);
      return;
    }
    const uniforms = Object.fromEntries(UNIFORMS.map(name => [name, context.getUniformLocation(program, name)]));
    const strikes = new LightningStrikes();
    const strikeData = new Float32Array(MAX_STRIKES * 4);
    const infoData = new Float32Array(MAX_STRIKES * 4);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const frameClock = new FrameClock(30);
    let active = false;
    let disposed = false;
    let contextLost = false;
    let raf = 0;
    let phase = 0.21;
    let colorKey = '';
    let rgb: [number, number, number] = [0.56, 0.19, 0.94];
    let resolutionScale = 1;
    let slowSamples = 0;
    let sampleCount = 0;
    let warmup = 20;

    const resize = () => {
      if (disposed || contextLost) return;
      const width = Math.max(1, canvas.clientWidth);
      const height = Math.max(1, canvas.clientHeight);
      const mobile = width < 768 || window.matchMedia('(pointer: coarse)').matches;
      const ratio = Math.min(
        settingsRef.current.dpr ?? window.devicePixelRatio ?? 1,
        mobile ? 1 : 1.25,
        Math.sqrt((mobile ? 300_000 : 800_000) / (width * height)),
      ) * resolutionScale;
      const w = Math.max(1, Math.floor(width * ratio));
      const h = Math.max(1, Math.floor(height * ratio));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    const draw = (now = performance.now()) => {
      if (disposed || contextLost || document.hidden) return;
      const s = settingsRef.current;
      if (colorKey !== s.color) { colorKey = s.color; rgb = toRgb(s.color); }
      context.viewport(0, 0, canvas.width, canvas.height);
      context.clearColor(0, 0, 0, 0);
      context.clear(context.COLOR_BUFFER_BIT);
      context.useProgram(program);
      context.bindBuffer(context.ARRAY_BUFFER, buffer);
      context.enableVertexAttribArray(position);
      context.vertexAttribPointer(position, 2, context.FLOAT, false, 0, 0);
      context.uniform2f(uniforms.uResolution, canvas.width, canvas.height);
      context.uniform1f(uniforms.uPhase, phase);
      context.uniform3f(uniforms.uColor, rgb[0], rgb[1], rgb[2]);
      context.uniform1f(uniforms.uIntensity, Math.max(0, s.intensity));
      context.uniform1f(uniforms.uSize, Math.max(0.05, s.size));
      context.uniform1f(uniforms.uThickness, Math.max(0, s.thickness));
      context.uniform1f(uniforms.uGlow, Math.max(0.01, s.glow));
      context.uniform1f(uniforms.uFlicker, reduce.matches ? 0 : Math.min(0.2, Math.max(0, s.flicker)));
      context.uniform1f(uniforms.uBranches, Math.min(1, Math.max(0, s.branches)));
      context.uniform1f(uniforms.uXOffset, s.xOffset);
      context.uniform1f(uniforms.uAngle, (s.angle * Math.PI) / 180);
      // Shader coordinates use viewport height; keep both lanes on narrow screens.
      context.uniform1f(uniforms.uSpread, s.spread * Math.min(1, canvas.width / canvas.height));
      context.uniform1i(uniforms.uBolts, Math.min(MAX_BOLTS, Math.max(1, Math.round(s.bolts))));
      const flash = strikes.writeUniforms(now, strikeData, infoData);
      // Hover-following stays off; click strikes use the original shader inputs.
      context.uniform4f(uniforms.uPointer, 0, 0, 0, 0);
      context.uniform4fv(uniforms.uStrikes, strikeData);
      context.uniform4fv(uniforms.uStrikeInfo, infoData);
      context.uniform1f(uniforms.uFlash, flash);
      context.uniform1f(uniforms.uIntro, 1);
      context.uniform1f(uniforms.uLight, 0);
      context.uniform1f(uniforms.uFade, Math.min(1, Math.max(0, s.fade)));
      context.uniform1f(uniforms.uOpacity, Math.min(1, Math.max(0, s.opacity)));
      context.drawArrays(context.TRIANGLE_STRIP, 0, 4);
      if (canvas.dataset.ready !== 'true') canvas.dataset.ready = 'true';
    };

    const canRun = () => active && !disposed && !contextLost &&
      !document.hidden && !reduce.matches && !settingsRef.current.paused;
    const canAnimate = (now = performance.now()) => canRun() &&
      (settingsRef.current.speed > 0 || strikes.hasActive(now));

    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      frameClock.reset();
      canvas.dataset.motionPaused = 'true';
      slowSamples = sampleCount = 0;
      warmup = 20;
    };

    const frame = (now: number) => {
      raf = 0;
      if (!canRun()) { stop(); return; }
      const delta = frameClock.advance(now);
      if (delta === null) { raf = requestAnimationFrame(frame); return; }
      if (delta !== null) {
        phase = (phase + (Math.min(delta, 100) / 1000 * Math.max(0, settingsRef.current.speed)) / 10) % 1;
        draw(now);
        // Sustained slow frames reduce pixel work rather than speeding up time.
        if (warmup > 0) warmup--;
        else {
          slowSamples += delta > 48 ? 1 : 0;
          if (++sampleCount >= 90) {
            if (slowSamples > 50 && resolutionScale > 0.55) {
              resolutionScale = Math.max(0.55, resolutionScale * 0.8);
              resize();
            }
            slowSamples = sampleCount = 0;
          }
        }
      }
      // Always draw the final empty strike frame, including when ambient speed=0.
      if (canAnimate(now)) raf = requestAnimationFrame(frame);
      else stop();
    };

    const wake = () => {
      if (!canAnimate()) { stop(); return; }
      canvas.dataset.motionPaused = 'false';
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const refresh = () => {
      if (settingsRef.current.paused || !settingsRef.current.clickStrike || reduce.matches) strikes.clear();
      resize();
      // A single settled frame remains readable under reduced motion or pause.
      if (!document.hidden) draw();
      wake();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!settingsRef.current.clickStrike || !canRun() || event.button !== 0 || !event.isPrimary) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;
      const ux = (2 * x - rect.width) / rect.height;
      const uy = (rect.height - 2 * y) / rect.height;
      const radians = settingsRef.current.angle * Math.PI / 180;
      const sin = Math.sin(radians);
      const cos = Math.cos(radians);
      const top = rect.width / rect.height * Math.abs(sin) + Math.abs(cos);
      strikes.add({ x: ux, y: uy, reach: top - (-sin * ux + cos * uy) + 0.2,
        seed: Math.random() * 100 }, performance.now());
      canvas.dataset.strikeCount = String(++strikeCountRef.current);
      wake();
    };

    const onContextLost = (event: Event) => {
      event.preventDefault();
      contextLost = true;
      strikes.clear();
      delete canvas.dataset.ready;
      stop();
    };
    const onContextRestored = () => {
      if (!disposed) setContextVersion(version => version + 1);
    };
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    const resizeObserver = new ResizeObserver(refresh);
    resizeObserver.observe(canvas);
    const stopActivity = observeMotionActivity(canvas, next => {
      active = next;
      if (!next) {
        strikes.clear();
        stop();
        if (reduce.matches && !document.hidden) draw();
      } else {
        resize();
        draw();
        wake();
      }
    });
    refreshRef.current = refresh;
    refresh();

    return () => {
      disposed = true;
      stop();
      refreshRef.current = null;
      delete canvas.dataset.ready;
      resizeObserver.disconnect();
      stopActivity();
      window.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      context.deleteBuffer(buffer);
      context.deleteProgram(program);
    };
  }, [contextVersion]);

  useEffect(() => { refreshRef.current?.(); }, [color, bolts, spread, branches,
    xOffset, angle, size, thickness, glow, intensity, speed, flicker, clickStrike, fade, opacity, paused, dpr]);

  return <canvas ref={canvasRef} className={`e27-lightning-canvas ${className}`.trim()}
    style={style} aria-hidden="true" data-effect="react-bits-lightning" data-strike-count="0" />;
}

