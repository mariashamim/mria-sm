export const VERT = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

export const FRAG = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform vec2 uRes;
uniform float uTime;
uniform vec3 uTop;
uniform vec3 uMid;
uniform vec3 uHor;
uniform vec3 uSun;     // x, y, intensity
uniform vec3 uSunCol;
uniform float uStars;
uniform float uSnow;
uniform float uCity;
uniform float uGrain;
uniform float uRise;   // camera height above the roof, 0 (on it) to 1 (high)
uniform float uTravel; // scroll distance in viewport heights
uniform float uCloud;  // 1: draw clouds here; 0: cut-out cloud plates do it

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * vnoise(p);
    p = p * 2.03 + vec2(13.7, 7.1);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;
  float aspect = uRes.x / uRes.y;

  // The horizon sinks as the camera climbs.
  float hy = uv.y + uRise * 0.38;

  // Three-stop vertical gradient: horizon → mid → top.
  vec3 col = mix(uHor, uMid, smoothstep(0.0, 0.45, hy));
  col = mix(col, uTop, smoothstep(0.45, 1.0, hy));
  // Thinner air up high: the top of the sky deepens a little.
  col = mix(col, uTop * 0.82, 0.3 * uRise * smoothstep(0.4, 1.0, uv.y));

  // Sun / moon glow, drifting down a touch as we rise.
  vec2 d = uv - vec2(uSun.x, uSun.y - uRise * 0.2);
  d.x *= aspect;
  float glow = exp(-dot(d, d) * 6.0) * uSun.z;
  col += uSunCol * glow * 0.9;

  // The city, lit: a warm band at the horizon.
  float band = exp(-max(hy, 0.0) * 14.0) * uCity;
  col += vec3(1.0, 0.72, 0.38) * band * 0.35;

  // Stars at two depths, streaming down past us as we climb, twinkling slowly.
  float star = 0.0;
  {
    vec2 sp = (uv + vec2(0.0, uTravel * 0.04)) * vec2(aspect, 1.0) * 160.0;
    vec2 cell = floor(sp);
    float h = hash(cell);
    float tw = 0.6 + 0.4 * sin(uTime * 2.0 + h * 50.0);
    star += step(0.985, h) * (1.0 - smoothstep(0.0, 0.6, length(fract(sp) - 0.5))) * tw;

    vec2 sp2 = (uv + vec2(0.0, uTravel * 0.09)) * vec2(aspect, 1.0) * 95.0;
    vec2 cell2 = floor(sp2);
    float h2 = hash(cell2 + 31.7);
    float tw2 = 0.6 + 0.4 * sin(uTime * 1.6 + h2 * 40.0);
    star += 0.75 * step(0.988, h2) * (1.0 - smoothstep(0.0, 0.5, length(fract(sp2) - 0.5))) * tw2;
  }
  col += vec3(1.0) * star * uStars * smoothstep(0.15, 0.6, hy);

  // Thin clouds streaming past on the climb.
  float cloudAmt = uCloud * smoothstep(0.12, 0.5, uRise) * (1.0 - 0.35 * smoothstep(0.85, 1.0, uRise));
  if (cloudAmt > 0.001) {
    vec2 cp = vec2(uv.x * aspect * 1.6 + uTime * 0.012, uv.y * 4.2 + uTravel * 0.55);
    float c = fbm(cp) * 0.7 + fbm(cp * 2.1 + 5.0) * 0.3;
    float shape = smoothstep(0.46, 0.72, c);
    float night = clamp(uStars, 0.0, 1.0);
    vec3 cloudCol = mix(mix(uMid, vec3(1.0), 0.45), uMid * 0.9 + 0.08, night);
    col = mix(col, cloudCol, shape * cloudAmt * (0.24 - 0.12 * night));
  }

  // Snow: three drifting layers.
  float snow = 0.0;
  for (int k = 0; k < 3; k++) {
    float fk = float(k);
    float scale = 18.0 + fk * 10.0;
    float speed = 0.06 + fk * 0.03;
    vec2 p = uv * vec2(aspect, 1.0) * scale;
    p.y += uTime * speed * scale;
    p.x += sin(uTime * 0.5 + fk) * 0.5;
    vec2 c = floor(p);
    vec2 f = fract(p);
    float hh = hash(c + fk * 7.0);
    vec2 center = vec2(hash(c + 1.3), hash(c + 2.7));
    float dd = length(f - center);
    snow += (1.0 - smoothstep(0.0, 0.08, dd)) * step(0.7, hh);
  }
  col += vec3(1.0) * snow * uSnow * 0.9;

  // Film grain, always on, very low.
  float n = hash(uv * uRes + fract(uTime) * 100.0) - 0.5;
  col += n * uGrain;

  gl_FragColor = vec4(col, 1.0);
}
`
