type Props = { className?: string }

// x, width, height in a 1000 × 200 box; deterministic so SSR and client match.
const BUILDINGS: Array<[number, number, number]> = [
  [0, 46, 70], [50, 30, 110], [84, 60, 60], [148, 22, 140], [174, 54, 90], [232, 40, 50],
  [276, 70, 120], [350, 28, 160], [382, 52, 80], [438, 36, 100], [478, 80, 56], [562, 30, 130],
  [596, 58, 72], [658, 24, 150], [686, 66, 96], [756, 44, 64], [804, 32, 118], [840, 70, 84],
  [914, 38, 104], [956, 44, 60],
]

const ANTENNAS: Array<[number, number, number]> = [
  [160, 3, 40], [362, 2, 52], [670, 2, 46], [816, 3, 34],
]

/** A flat Karachi skyline silhouette: water tanks, antennas, uneven rooftops. */
export default function Skyline({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 1000 200" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <g fill="currentColor">
        {BUILDINGS.map(([x, w, h], i) => (
          <rect key={i} x={x} y={200 - h} width={w} height={h} />
        ))}
        {ANTENNAS.map(([x, w, h], i) => {
          const b = BUILDINGS.find(([bx, bw]) => x >= bx && x <= bx + bw)
          const base = b ? 200 - b[2] : 200
          return <rect key={`a${i}`} x={x} y={base - h} width={w} height={h} />
        })}
        {/* water tanks */}
        <rect x="292" y="68" width="22" height="14" rx="3" />
        <rect x="700" y="92" width="20" height="12" rx="3" />
        <rect x="420" y="86" width="16" height="12" rx="2" />
      </g>
    </svg>
  )
}
