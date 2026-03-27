// SVG-based line chart — no external library needed

const PAD = { top: 20, right: 24, bottom: 44, left: 54 }
const W = 640
const H = 240

function fmtDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function niceMax(val) {
  if (val <= 0) return 10
  const magnitude = Math.pow(10, Math.floor(Math.log10(val)))
  return Math.ceil(val / magnitude) * magnitude
}

export default function ProgressChart({ exerciseName, history }) {
  if (!history.length) return null

  // Primary metric: weight_lbs if any session has it, else reps
  const hasWeight = history.some((h) => h.weight_lbs != null && h.weight_lbs > 0)
  const metric = hasWeight ? 'weight_lbs' : 'reps'
  const metricLabel = hasWeight ? 'Weight (lbs)' : 'Reps'

  const values = history.map((h) => h[metric] ?? 0)
  const minVal  = 0
  const maxVal  = niceMax(Math.max(...values))
  const valRange = maxVal - minVal || 1

  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom

  const pts = history.map((h, i) => ({
    x:    PAD.left + (i / Math.max(history.length - 1, 1)) * innerW,
    y:    PAD.top  + innerH - (((h[metric] ?? 0) - minVal) / valRange) * innerH,
    val:  h[metric],
    date: h.workout_date,
  }))

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  const areaPath = pts.length > 1
    ? `${linePath} L ${pts[pts.length - 1].x.toFixed(1)} ${(PAD.top + innerH).toFixed(1)} L ${pts[0].x.toFixed(1)} ${(PAD.top + innerH).toFixed(1)} Z`
    : ''

  // Y-axis: 5 evenly spaced ticks
  const yTicks = 5
  const yTickVals = Array.from({ length: yTicks }, (_, i) =>
    minVal + ((maxVal - minVal) / (yTicks - 1)) * i
  )

  // X-axis: show at most 10 labels to avoid crowding
  const xStep = Math.ceil(pts.length / 10)
  const xLabels = pts.filter((_, i) => i % xStep === 0 || i === pts.length - 1)

  const avg    = values.reduce((a, b) => a + b, 0) / values.length
  const latest = values[values.length - 1] ?? 0
  const peak   = Math.max(...values)

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <h3 className="font-semibold text-gray-100">{exerciseName}</h3>
      <p className="text-xs text-gray-500 mt-0.5 mb-5">
        {metricLabel} · {history.length} {history.length === 1 ? 'session' : 'sessions'}
      </p>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ minWidth: 300, height: H }}
          aria-label={`${exerciseName} progress chart`}
        >
          {/* Y-axis grid lines + labels */}
          {yTickVals.map((val, i) => {
            const y = PAD.top + innerH - ((val - minVal) / valRange) * innerH
            return (
              <g key={i}>
                <line
                  x1={PAD.left}
                  y1={y.toFixed(1)}
                  x2={PAD.left + innerW}
                  y2={y.toFixed(1)}
                  stroke="#1F2937"
                  strokeWidth="1"
                />
                <text
                  x={PAD.left - 8}
                  y={(y + 4).toFixed(1)}
                  textAnchor="end"
                  fill="#4B5563"
                  fontSize="11"
                >
                  {Math.round(val)}
                </text>
              </g>
            )
          })}

          {/* X-axis labels */}
          {xLabels.map((p, i) => (
            <text
              key={i}
              x={p.x.toFixed(1)}
              y={(H - 6).toFixed(1)}
              textAnchor="middle"
              fill="#4B5563"
              fontSize="10"
            >
              {fmtDate(p.date)}
            </text>
          ))}

          {/* Area fill */}
          {areaPath && (
            <path d={areaPath} fill="#6366F1" fillOpacity="0.08" />
          )}

          {/* Line */}
          {pts.length > 1 && (
            <path
              d={linePath}
              fill="none"
              stroke="#6366F1"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}

          {/* Data points */}
          {pts.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x.toFixed(1)}
                cy={p.y.toFixed(1)}
                r="4"
                fill="#6366F1"
                stroke="#111827"
                strokeWidth="1.5"
              />
              <title>{p.date}: {p.val ?? 0} {metricLabel}</title>
            </g>
          ))}

          {/* Y-axis label (rotated) */}
          <text
            transform={`rotate(-90)`}
            x={(-(PAD.top + innerH / 2)).toFixed(1)}
            y="14"
            textAnchor="middle"
            fill="#4B5563"
            fontSize="11"
          >
            {metricLabel}
          </text>
        </svg>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-gray-800">
        <div className="text-center">
          <p className="text-xl font-bold text-indigo-300">{peak}</p>
          <p className="text-xs text-gray-500 mt-0.5">Peak</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-gray-200">{Math.round(avg)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Average</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-gray-200">{latest}</p>
          <p className="text-xs text-gray-500 mt-0.5">Latest</p>
        </div>
      </div>
    </div>
  )
}
