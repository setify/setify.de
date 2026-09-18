import { motionEnabled, isDesktop } from './gsap-setup';

/**
 * Pixel Blast als Hintergrund.
 * Shader-Logik portiert von reactbits.dev/backgrounds/pixel-blast, hier ohne
 * three.js und postprocessing als reines WebGL2. Der Liquid- und der
 * Noise-Pass der Vorlage entfallen, beide braeuchten einen Composer.
 *
 * Ein Wertrauschen (fbm) speist ein Bayer-Dither, daraus entsteht ein
 * Punktraster, das langsam durchs Bild wandert. Klicks setzen Ringe, die
 * durch das Raster laufen. Zusaetzlich zur Vorlage loesen sich in Ruhe
 * gelegentlich Ringe von selbst aus, damit der Effekt auch ohne Zutun lebt.
 */

const MAX_CLICKS = 10;

// Gold 700 auf sandfarbenem Grund.
const COLOR: [number, number, number] = [0x7a / 255, 0x6a / 255, 0x4c / 255];

const VERT = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

const FRAG = `#version 300 es
precision highp float;

uniform vec3  uColor;
uniform vec2  uResolution;
uniform float uTime;
uniform float uPixelSize;
uniform float uScale;
uniform float uDensity;
uniform float uPixelJitter;
uniform float uRippleSpeed;
uniform float uRippleThickness;
uniform float uRippleIntensity;
uniform float uEdgeFade;
uniform float uOpacity;

const int MAX_CLICKS = ${MAX_CLICKS};
uniform vec2  uClickPos[MAX_CLICKS];
uniform float uClickTimes[MAX_CLICKS];

out vec4 fragColor;

float Bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x / 2. + a.y * a.y * .75);
}
#define Bayer4(a) (Bayer2(.5*(a))*0.25 + Bayer2(a))
#define Bayer8(a) (Bayer4(.5*(a))*0.25 + Bayer2(a))

#define FBM_OCTAVES     5
#define FBM_LACUNARITY  1.25
#define FBM_GAIN        1.0

float hash11(float n){ return fract(sin(n)*43758.5453); }

float vnoise(vec3 p){
  vec3 ip = floor(p);
  vec3 fp = fract(p);
  float n000 = hash11(dot(ip + vec3(0.0,0.0,0.0), vec3(1.0,57.0,113.0)));
  float n100 = hash11(dot(ip + vec3(1.0,0.0,0.0), vec3(1.0,57.0,113.0)));
  float n010 = hash11(dot(ip + vec3(0.0,1.0,0.0), vec3(1.0,57.0,113.0)));
  float n110 = hash11(dot(ip + vec3(1.0,1.0,0.0), vec3(1.0,57.0,113.0)));
  float n001 = hash11(dot(ip + vec3(0.0,0.0,1.0), vec3(1.0,57.0,113.0)));
  float n101 = hash11(dot(ip + vec3(1.0,0.0,1.0), vec3(1.0,57.0,113.0)));
  float n011 = hash11(dot(ip + vec3(0.0,1.0,1.0), vec3(1.0,57.0,113.0)));
  float n111 = hash11(dot(ip + vec3(1.0,1.0,1.0), vec3(1.0,57.0,113.0)));
  vec3 w = fp*fp*fp*(fp*(fp*6.0-15.0)+10.0);
  float x00 = mix(n000, n100, w.x);
  float x10 = mix(n010, n110, w.x);
  float x01 = mix(n001, n101, w.x);
  float x11 = mix(n011, n111, w.x);
  float y0  = mix(x00, x10, w.y);
  float y1  = mix(x01, x11, w.y);
  return mix(y0, y1, w.z) * 2.0 - 1.0;
}

float fbm2(vec2 uv, float t){
  vec3 p = vec3(uv * uScale, t);
  float amp = 1.0;
  float freq = 1.0;
  float sum = 1.0;
  for (int i = 0; i < FBM_OCTAVES; ++i){
    sum  += amp * vnoise(p * freq);
    freq *= FBM_LACUNARITY;
    amp  *= FBM_GAIN;
  }
  return sum * 0.5 + 0.5;
}

float maskCircle(vec2 p, float cov){
  float r = sqrt(cov) * .25;
  float d = length(p - 0.5) - r;
  float aa = 0.5 * fwidth(d);
  return cov * (1.0 - smoothstep(-aa, aa, d * 2.0));
}

void main(){
  float pixelSize = uPixelSize;
  vec2 fragCoord = gl_FragCoord.xy - uResolution * .5;
  float aspectRatio = uResolution.x / uResolution.y;

  vec2 pixelUV = fract(fragCoord / pixelSize);

  float cellPixelSize = 8.0 * pixelSize;
  vec2 cellId = floor(fragCoord / cellPixelSize);
  vec2 cellCoord = cellId * cellPixelSize;
  vec2 uv = cellCoord / uResolution * vec2(aspectRatio, 1.0);

  float base = fbm2(uv, uTime * 0.05);
  base = base * 0.5 - 0.65;

  float feed = base + (uDensity - 0.5) * 0.3;

  const float dampT = 1.0;
  const float dampR = 10.0;

  for (int i = 0; i < MAX_CLICKS; ++i){
    vec2 pos = uClickPos[i];
    if (pos.x < 0.0) continue;
    vec2 cuv = (((pos - uResolution * .5 - cellPixelSize * .5) / uResolution)) * vec2(aspectRatio, 1.0);
    float t = max(uTime - uClickTimes[i], 0.0);
    float r = distance(uv, cuv);
    float waveR = uRippleSpeed * t;
    float ring = exp(-pow((r - waveR) / uRippleThickness, 2.0));
    float atten = exp(-dampT * t) * exp(-dampR * r);
    feed = max(feed, ring * atten * uRippleIntensity);
  }

  float bayer = Bayer8(fragCoord / uPixelSize) - 0.5;
  float bw = step(0.5, feed + bayer);

  float h = fract(sin(dot(floor(fragCoord / uPixelSize), vec2(127.1, 311.7))) * 43758.5453);
  float jitterScale = 1.0 + (h - 0.5) * uPixelJitter;
  float coverage = bw * jitterScale;

  float M = maskCircle(pixelUV, coverage);

  if (uEdgeFade > 0.0) {
    vec2 norm = gl_FragCoord.xy / uResolution;
    float edge = min(min(norm.x, norm.y), min(1.0 - norm.x, 1.0 - norm.y));
    M *= smoothstep(0.0, uEdgeFade, edge);
  }

  M *= uOpacity;
  fragColor = vec4(uColor * M, M);
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

export default function pixelBlast(root: HTMLElement): () => void {
  const canvas = root.querySelector<HTMLCanvasElement>('[data-pixel-canvas]');
  if (!canvas) return () => {};

  const gl = canvas.getContext('webgl2', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'low-power',
  });
  if (!gl) return () => {};

  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  const program = vs && fs ? gl.createProgram() : null;
  if (!vs || !fs || !program) return () => {};

  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.bindAttribLocation(program, 0, 'position');
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return () => {};
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
  const uResolution = u('uResolution');
  const uTime = u('uTime');
  const uPixelSize = u('uPixelSize');
  const uClickPos = u('uClickPos');
  const uClickTimes = u('uClickTimes');

  const desktop = isDesktop();
  const maxDpr = desktop ? 2 : 1.5;
  const PIXEL_SIZE = 5;

  gl.uniform3fv(u('uColor'), COLOR);
  gl.uniform1f(u('uScale'), 3.1);
  gl.uniform1f(u('uDensity'), 1.12);
  gl.uniform1f(u('uPixelJitter'), 0.35);
  gl.uniform1f(u('uRippleSpeed'), 0.32);
  gl.uniform1f(u('uRippleThickness'), 0.1);
  gl.uniform1f(u('uRippleIntensity'), 1.4);
  gl.uniform1f(u('uEdgeFade'), 0.32);
  gl.uniform1f(u('uOpacity'), 0.45);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  const klickPos = new Float32Array(MAX_CLICKS * 2).fill(-1);
  const klickZeit = new Float32Array(MAX_CLICKS);
  let klickIndex = 0;

  let raf = 0;
  let onScreen = true;
  let pageVisible = !document.hidden;
  const start = performance.now();
  const SPEED = 0.45;
  let zeit = 0;
  let naechsterRing = 2 + Math.random() * 3;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    const w = Math.max(1, Math.round(root.clientWidth * dpr));
    const h = Math.max(1, Math.round(root.clientHeight * dpr));
    if (canvas.width === w && canvas.height === h) return;
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    gl.uniform2f(uResolution, w, h);
    gl.uniform1f(uPixelSize, PIXEL_SIZE * dpr);
  };

  const ringSetzen = (x: number, y: number) => {
    klickPos[klickIndex * 2] = x;
    klickPos[klickIndex * 2 + 1] = y;
    klickZeit[klickIndex] = zeit;
    klickIndex = (klickIndex + 1) % MAX_CLICKS;
    gl.uniform2fv(uClickPos, klickPos);
    gl.uniform1fv(uClickTimes, klickZeit);
  };

  const render = (now: number) => {
    zeit = (now - start) * 0.001 * SPEED;
    gl.uniform1f(uTime, zeit);
    // In Ruhe von selbst einen Ring ausloesen, damit der Effekt nicht
    // ausschliesslich auf Klicks reagiert.
    if (zeit > naechsterRing) {
      ringSetzen(Math.random() * canvas.width, Math.random() * canvas.height);
      naechsterRing = zeit + 2.5 + Math.random() * 3.5;
    }
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

  const ro = new ResizeObserver(resize);
  ro.observe(root);
  resize();

  // Ohne Animation ein einzelnes Standbild zeichnen.
  if (!motionEnabled()) {
    render(performance.now());
    return () => {
      ro.disconnect();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }

  const onPointerDown = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    ringSetzen((event.clientX - rect.left) * sx, (rect.height - (event.clientY - rect.top)) * sy);
  };

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
  // Der Canvas liegt hinter dem Inhalt und nimmt keine Zeiger an, deshalb
  // haengt der Klick an der Sektion.
  root.parentElement?.addEventListener('pointerdown', onPointerDown, { passive: true });

  render(performance.now());
  play();

  return () => {
    pause();
    ro.disconnect();
    io.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    root.parentElement?.removeEventListener('pointerdown', onPointerDown);
    gl.deleteProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    gl.deleteBuffer(buffer);
    gl.deleteVertexArray(vao);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
}
