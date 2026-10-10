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

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  vec2 uv = vUv;
  float aspect = uRes.x / uRes.y;

  // Three-stop vertical gradient: horizon → mid → top.
  vec3 col = mix(uHor, uMid, smoothstep(0.0, 0.45, uv.y));
  col = mix(col, uTop, smoothstep(0.45, 1.0, uv.y));

  // Sun / moon glow.
  vec2 d = uv - uSun.xy;
  d.x *= aspect;
  float glow = exp(-dot(d, d) * 6.0) * uSun.z;
  col += uSunCol * glow * 0.9;

  // The city, lit: a warm band at the horizon.
  float band = exp(-uv.y * 14.0) * uCity;
  col += vec3(1.0, 0.72, 0.38) * band * 0.35;

  // Stars, only in the upper sky, twinkling slowly.
  vec2 sp = uv * vec2(aspect, 1.0) * 160.0;
  vec2 cell = floor(sp);
  float h = hash(cell);
  float star = step(0.985, h) * (1.0 - smoothstep(0.0, 0.6, length(fract(sp) - 0.5)));
  float tw = 0.6 + 0.4 * sin(uTime * 2.0 + h * 50.0);
  col += vec3(1.0) * star * tw * uStars * smoothstep(0.15, 0.6, uv.y);

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
