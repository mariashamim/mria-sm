/**
 * The stage's effects layer: above every chapter layer, under the top bar and
 * the rail. It holds the set pieces that cross chapter boundaries and so
 * belong to no single chapter (lib/setpieces.ts):
 *   the ink bleed from the opening into 2007 (an SVG: the word گھر, and ink
 *   blobs merged by a "goo" filter whose edges a turbulence displaces);
 *   the fly-through from 2017 into 2023 (a canvas: the paper plane, mist and
 *   clouds).
 * Both are drawn only while their stretch of scroll is on screen.
 */
export default function Fx() {
  return (
    <div className="fx" aria-hidden="true">
      <svg className="fx__ink">
        <defs>
          {/* Edges that look like ink in wet paper: blur, threshold, then a slow wobble. */}
          <filter id="ink-goo" filterUnits="userSpaceOnUse" x="-200" y="-200" width="4000" height="4000" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="b" />
            <feColorMatrix in="b" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 26 -11" result="g" />
            <feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves="2" seed="4" result="n" />
            <feDisplacementMap className="fx__disp" in="g" in2="n" scale="46" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          {/* Phones: the same merge without the displacement, which is the expensive part. */}
          <filter id="ink-soft" filterUnits="userSpaceOnUse" x="-200" y="-200" width="4000" height="4000" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="b" />
            <feColorMatrix in="b" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" />
          </filter>
          {/* The ink is 2007's dawn: it becomes the chapter's sky. */}
          <linearGradient id="ink-dawn" className="fx__grad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="900">
            <stop offset="0" stopColor="#f6e7d2" />
            <stop offset="0.55" stopColor="#f4b183" />
            <stop offset="1" stopColor="#e58a5a" />
          </linearGradient>
        </defs>
        <g className="fx__blobs" fill="url(#ink-dawn)" />
        <text className="fx__word" textAnchor="middle" lang="ur">
          گھر
        </text>
      </svg>
      <canvas className="fx__fly" />
    </div>
  )
}
