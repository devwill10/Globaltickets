// Decorative panels. Swap for your own illustrations/images when you have them.
const Star = ({ x, y, s = 1, fill }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} fill={fill}
    d="M0,-40 Q0,0 40,0 Q0,0 0,40 Q0,0 -40,0 Q0,0 0,-40Z" />
)

function Blue() {
  return (
    <svg aria-hidden="true" viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <rect width="600" height="800" fill="#1b9ad6" />
      <path d="M0 0H600V260L0 120Z" fill="#2baee0" opacity=".6" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={300 + i * 70} y="60" width="70" height="120" rx="30" fill={i % 2 ? '#fff' : '#fb7e5c'} />
      ))}
      <rect x="40" y="260" width="300" height="360" rx="24" fill="#fdece8" transform="rotate(-6 190 440)" />
      <rect x="120" y="360" width="200" height="14" rx="7" fill="#1b9ad6" opacity=".35" transform="rotate(-6 220 367)" />
      <rect x="120" y="400" width="140" height="14" rx="7" fill="#1b9ad6" opacity=".35" transform="rotate(-6 190 407)" />
      <path d="M0 520Q200 480 420 640T600 720V800H0Z" fill="#94b4c1" />
      <Star x={110} y={120} s={1.5} fill="#fff" />
      <Star x={330} y={720} s={1.3} fill="#fb7e5c" />
      <Star x={70} y={640} s={0.7} fill="#16213b" />
      <circle cx="260" cy="560" r="7" fill="#fff" />
    </svg>
  )
}

function Peach() {
  return (
    <svg aria-hidden="true" viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <rect width="600" height="800" fill="#f1d3cb" />
      <path d="M170 150L330 520L430 520Z" fill="#f2a998" />
      <path d="M520 190L600 520L330 520Z" fill="#f2a998" opacity=".8" />
      <rect x="260" y="470" width="260" height="190" rx="14" fill="#fff" />
      <rect x="230" y="640" width="320" height="26" rx="10" fill="#fff" />
      <path d="M0 560Q150 520 260 600L260 800H0Z" fill="#8fb4c4" />
      <path d="M380 640Q500 560 600 620V740H380Z" fill="#1b9ad6" />
      <rect y="720" width="600" height="80" fill="#f2a998" />
      <Star x={510} y={110} s={1.3} fill="#fff" />
      <Star x={400} y={260} s={0.6} fill="#16213b" />
    </svg>
  )
}

export default function AuthArt({ variant = 'blue' }) {
  return variant === 'peach' ? <Peach /> : <Blue />
}
