// SVG line chart for weight-over-time progress — no external library

function niceMax(val) {
  if (val <= 0) return 10
  const exp = Math.floor(Math.log10(val))
  const factor = Math.pow(10, exp)
  return Math.ceil(val / factor) * factor
}

export function ProgressChart({ data }) {
  // data: [{ date: 'YYYY-MM-DD', weight: number }]
  if (!data || data.length === 0) return null

  const W = 560
  const H = 220
  const PAD = { top: 16, right: 16, bottom: 40, left: 52 }
  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top - PAD.bottom

  const weights = data.map((d) => d.weight)
  const minW = Math.min(...weights)
  const maxW = Math.max(...weights)
  const yMax = niceMax(maxW * 1.1)
  const yMin = Math.max(0, Math.floor(minW * 0.85))
  const yRange = yMax - yMin || 1

  const xScale = (i) =>
    data.length === 1 ? chartW / 2 : (i / (data.length - 1)) * chartW
  const yScale = (w) => chartH - ((w - yMin) / yRange) * chartH

  const points = data.map((d, i) => ({
    x: xScale(i) + PAD.left,
    y: yScale(d.weight) + PAD.top,
    date: d.date,
    weight: d.weight,
  }))

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ')

  const areaPath = [
    `M ${points[0].x.toFixed(1)},${(PAD.top + chartH).toFixed(1)}`,
    ...points.map((p) => `L ${p.x.toFixed(1)},${p.y.toFixed(1)}`),
    `L ${points[points.length - 1].x.toFixed(1)},${(PAD.top + chartH).toFixed(1)}`,
    'Z',
  ].join(' ')

  const yTicks = Array.from({ length: 5 }, (_, i) => yMin + ((yMax - yMin) * i) / 4)

  const xLabelIndices =
    data.length <= 6
      ? data.map((_, i) => i)
      : [
          0,
          Math.floor(data.length / 4),
          Math.floor(data.length / 2),
          Math.floor((data.length * 3) / 4),
          data.length - 1,
        ]

  const peak = Math.max(...weights)
  const avg = (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1)
  const latest = weights[weights.length - 1]

  return (
    <div className="space-y-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 280 }}>
        <defs>
          <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid + Y labels */}
        {yTicks.map((tick, i) => {
          const y = yScale(tick) + PAD.top
          return (
            <g key={i}>
              <line
                x1={PAD.left}
                y1={y}
                x2={PAD.left + chartW}
                y2={y}
                stroke="#374151"
                strokeDasharray="3 3"
              />
              <text
                x={PAD.left - 6}
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize={10}
                fill="#6b7280"
              >
                {tick.toFixed(0)}
              </text>
            </g>
          )
        })}

        {/* Area fill */}
        <path d={areaPath} fill="url(#wGrad)" />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="#6366f1"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Data points with native SVG tooltip */}
        {points.map((p, i) => (
          <g key={i}>
            <title>
              {p.date}: {p.weight} lbs
            </title>
            <circle
              cx={p.x}
              cy={p.y}
              r={4}
              fill="#6366f1"
              stroke="#111827"
              strokeWidth={2}
            />
          </g>
        ))}

        {/* X labels */}
        {xLabelIndices.map((i) => (
          <text
            key={i}
            x={xScale(i) + PAD.left}
            y={PAD.top + chartH + 18}
            textAnchor="middle"
            fontSize={10}
            fill="#6b7280"
          >
            {data[i].date.slice(5)}
          </text>
        ))}

        {/* Axes */}
        <line
          x1={PAD.left}
          y1={PAD.top}
          x2={PAD.left}
          y2={PAD.top + chartH}
          stroke="#374151"
        />
        <line
          x1={PAD.left}
          y1={PAD.top + chartH}
          x2={PAD.left + chartW}
          y2={PAD.top + chartH}
          stroke="#374151"
        />
      </svg>

      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { label: 'Peak', value: `${peak} lbs` },
          { label: 'Average', value: `${avg} lbs` },
          { label: 'Latest', value: `${latest} lbs` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-800 rounded-xl py-3">
            <div className="text-xs text-gray-500 mb-1">{label}</div>
            <div className="text-lg font-semibold text-indigo-400">{value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
