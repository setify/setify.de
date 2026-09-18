import { motionEnabled, isDesktop, canHover } from './gsap-setup';

/**
 * Raymarched Gradient-Waves im Hero.
 * Shader-Logik portiert von reactbits.dev/backgrounds/gradient-waves,
 * hier ohne ogl als reines WebGL2 und in der dunklen setify-Palette.
 */

// Dunkle Graphit- und Blaumetall-Toene, damit die Gold-Akzente traegen.
const HORIZON = [0x0a / 255, 0x0c / 255, 0x11 / 255];
const WAVE = [0x10 / 255, 0x17 / 255, 0x23 / 255];
const CREST = [0x4a / 255, 0x5f / 255, 0x7c / 255];

const FALLBACK_BG =
  'radial-gradient(ellipse at 50% 85%, #1c2736 0%, #101723 40%, #0a0c11 78%)';

const VERT = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

const FRAG = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uAmplitude;
uniform float uWaveScale;
uniform float uWaveRatio;
uniform float uSwell;
uniform float uTurbulence;
uniform float uTilt;
uniform float uZoom;
uniform float uHeight;
uniform float uFogDepth;
uniform float uSteps;
uniform float uBrightness;
uniform float uOpacity;
uniform float uGrainIntensity;
uniform vec2 uMouse;
uniform float uParallax;
uniform vec3 uHorizonColor;
uniform vec3 uWaveColor;
uniform vec3 uCrestColor;
out vec4 fragColor;

const float MAX_DIST = 20000.0;

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float plasma(vec3 r, vec2 freq, vec4 tc) {
  float mx = r.x + tc.x;
  mx += uSwell * sin((r.y + mx) / 20.0 + tc.y);
  float my = r.y - tc.z;
  my += uTurbulence * cos(r.x / 23.0 + tc.w);
  return r.z - (sin(mx * freq.x) * uAmplitude + sin(my * freq.y) * uAmplitude + uHeight);
}

float raymarch(vec3 pos, vec3 dir, vec2 freq, vec4 tc) {
  float dist = 0.0;
  for (int i = 0; i < 128; i++) {
    if (float(i) >= uSteps) break;
    float dscene = plasma(pos + dist * dir, freq, tc);
    if (abs(dscene) < 0.1) break;
    dist += 0.9 * dscene;
    if (!(abs(dist) < MAX_DIST)) return MAX_DIST;
  }
  return dist;
}

void main() {
  float T = iTime * uSpeed;
  vec2 freq = vec2(uWaveScale / 7.0, (uWaveScale * uWaveRatio) / 3.0);
  vec4 tc = vec4(T / 0.130, T / 0.810, T / 0.200, T / 0.710);
  float c, s;
  float vfov = (3.14159 / 2.3) / max(uZoom, 0.05);
  vec3 cam = vec3(0.0, 0.0, 30.0);
  vec2 uv = (gl_FragCoord.xy / iResolution.xy) - 0.5;
  uv.x *= iResolution.x / iResolution.y;
  uv.y *= -1.0;

  vec3 dir = vec3(0.0, 0.0, -1.0);
  float ulen = length(uv);
  float xrot = vfov * ulen;
  c = cos(xrot); s = sin(xrot);
  dir = mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c) * dir;
  vec2 nuv = ulen > 1e-5 ? uv / ulen : vec2(1.0, 0.0);
  c = nuv.x; s = nuv.y;
  dir = mat3(c, -s, 0.0, s, c, 0.0, 0.0, 0.0, 1.0) * dir;
  c = cos(uTilt); s = sin(uTilt);
  dir = mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c) * dir;

  float yaw = (uMouse.x - 0.5) * uParallax * 0.4;
  float pitch = (uMouse.y - 0.5) * uParallax * 0.4;
  c = cos(yaw); s = sin(yaw);
  dir = mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c) * dir;
  c = cos(pitch); s = sin(pitch);
  dir = mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c) * dir;

  float dist = raymarch(cam, dir, freq, tc);
  vec3 pos = cam + dist * dir;

  float t = clamp(uFogDepth / max(dist, 0.001), 0.0, 1.0);
  vec3 body = mix(uWaveColor, uCrestColor, clamp(pos.z * 0.08 + 0.5, 0.0, 1.0));
  vec3 col = mix(uHorizonColor, body, t);
  col *= uBrightness;
  col = clamp(col, 0.0, 1.0);

  float alpha = clamp(t, 0.0, 1.0) * uOpacity;
  float g = hash21(gl_FragCoord.xy + mod(iTime, 64.0) * 11.0);
  alpha += (g - 0.5) * uGrainIntensity;
  alpha = clamp(alpha, 0.0, 1.0);
  fragColor = vec4(col * alpha, alpha);
}
`;

function compile(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function heroGradient(root: HTMLElement): () => void {
  const canvas = root.querySelector<HTMLCanvasElement>('[data-hero-canvas]');
  const scrollBar = root.querySelector<HTMLElement>('[data-hero-scroll-bar]');

  const scrollAnim = scrollBar?.animate(
    [{ transform: 'translateY(-100%)' }, { transform: 'translateY(200%)' }],
    { duration: 1600, iterations: Infinity, easing: 'ease-in-out' },
  );
  const stopScrollAnim = () => scrollAnim?.cancel();

  if (!canvas) return stopScrollAnim;

  const fallback = () => {
    canvas.style.background = FALLBACK_BG;
    canvas.setAttribute('data-geladen', '');
  };

  if (!motionEnabled()) {
    fallback();
    return stopScrollAnim;
  }

  const gl = canvas.getContext('webgl2', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'low-power',
  });

  if (!gl) {
    fallback();
    return stopScrollAnim;
  }

  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  const program = vs && fs ? gl.createProgram() : null;
  if (!vs || !fs || !program) {
    fallback();
    return stopScrollAnim;
  }

  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.bindAttribLocation(program, 0, 'position');
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    fallback();
    return stopScrollAnim;
  }
  gl.useProgram(program);

  // Fullscreen-Triangle, deckt den Viewport mit drei Vertices ab.
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const u = (name: string) => gl.getUniformLocation(program, name);
  const uResolution = u('iResolution');
  const uTime = u('iTime');
  const uMouse = u('uMouse');

  const desktop = isDesktop();

  gl.uniform1f(u('uSpeed'), 0.22);
  gl.uniform1f(u('uAmplitude'), 3.2);
  gl.uniform1f(u('uWaveScale'), 1.3);
  gl.uniform1f(u('uWaveRatio'), 0.9);
  gl.uniform1f(u('uSwell'), 35);
  gl.uniform1f(u('uTurbulence'), 20);
  gl.uniform1f(u('uTilt'), 1.11);
  gl.uniform1f(u('uZoom'), 0.7);
  gl.uniform1f(u('uHeight'), 6.5);
  gl.uniform1f(u('uFogDepth'), 24);
  gl.uniform1f(u('uSteps'), desktop ? 90 : 32);
  gl.uniform1f(u('uBrightness'), 0.46);
  gl.uniform1f(u('uOpacity'), 1.0);
  gl.uniform1f(u('uGrainIntensity'), 0.04);
  gl.uniform1f(u('uParallax'), 0.45);
  gl.uniform3fv(u('uHorizonColor'), HORIZON);
  gl.uniform3fv(u('uWaveColor'), WAVE);
  gl.uniform3fv(u('uCrestColor'), CREST);
  gl.clearColor(0, 0, 0, 0);

  if (import.meta.env.DEV) {
    (window as unknown as Record<string, unknown>).__heroWaves = {
      set: (name: string, ...values: number[]) => {
        const loc = u(name);
        if (!loc) return `unknown uniform ${name}`;
        if (values.length === 3) gl.uniform3f(loc, values[0], values[1], values[2]);
        else if (values.length === 2) gl.uniform2f(loc, values[0], values[1]);
        else gl.uniform1f(loc, values[0]);
        return `${name} = ${values.join(', ')}`;
      },
    };
  }

  const maxDpr = desktop ? 2 : 1.5;
  let raf = 0;
  let onScreen = true;
  let pageVisible = !document.hidden;
  const start = performance.now();
  const mouse: [number, number] = [0.5, 0.5];
  const target: [number, number] = [0.5, 0.5];

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    const w = Math.max(1, Math.round(root.clientWidth * dpr));
    const h = Math.max(1, Math.round(root.clientHeight * dpr));
    if (canvas.width === w && canvas.height === h) return;
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    gl.uniform2f(uResolution, w, h);
  };

  const render = (now: number) => {
    gl.uniform1f(uTime, (now - start) * 0.001);
    mouse[0] += 0.05 * (target[0] - mouse[0]);
    mouse[1] += 0.05 * (target[1] - mouse[1]);
    gl.uniform2f(uMouse, mouse[0], mouse[1]);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const loop = (now: number) => {
    render(now);
    raf = requestAnimationFrame(loop);
  };

  const play = () => {
    if (onScreen && pageVisible && raf === 0) raf = requestAnimationFrame(loop);
  };
  const pause = () => {
    if (raf !== 0) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };

  const onPointerMove = (event: PointerEvent) => {
    const rect = root.getBoundingClientRect();
    target[0] = (event.clientX - rect.left) / rect.width;
    target[1] = 1 - (event.clientY - rect.top) / rect.height;
  };
  const onPointerLeave = () => {
    target[0] = 0.5;
    target[1] = 0.5;
  };

  const ro = new ResizeObserver(resize);
  ro.observe(root);

  const io = new IntersectionObserver(
    ([entry]) => {
      onScreen = entry.isIntersecting;
      onScreen ? play() : pause();
    },
    { threshold: 0 },
  );
  io.observe(root);

  const onVisibility = () => {
    pageVisible = !document.hidden;
    pageVisible ? play() : pause();
  };
  document.addEventListener('visibilitychange', onVisibility);

  const parallaxOn = canHover();
  if (parallaxOn) {
    root.addEventListener('pointermove', onPointerMove);
    root.addEventListener('pointerleave', onPointerLeave);
  }

  resize();
  render(performance.now());
  canvas.setAttribute('data-geladen', '');
  play();

  return () => {
    pause();
    ro.disconnect();
    io.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    if (parallaxOn) {
      root.removeEventListener('pointermove', onPointerMove);
      root.removeEventListener('pointerleave', onPointerLeave);
    }
    stopScrollAnim();
    gl.deleteProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    gl.deleteBuffer(buffer);
    gl.deleteVertexArray(vao);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
}
