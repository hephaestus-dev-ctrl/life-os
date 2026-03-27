import { useState } from 'react'
import { ArrowUpIcon } from '@heroicons/react/24/outline'

function formatDate(str) {
  const d = new Date(str)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function SwedishLadder({ currentStage, ladderStages, advanceStage, setStage }) {
  const [advancing, setAdvancing] = useState(false)
  const [customStage, setCustomStage] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [error, setError] = useState(null)

  const handleAdvance = async () => {
    setAdvancing(true)
    setError(null)
    const { error: err } = await advanceStage()
    if (err) setError(err.message)
    setAdvancing(false)
  }

  const handleSetCustom = async () => {
    const n = parseInt(customStage)
    if (!n || n < 1) { setError('Enter a valid stage number (1 or higher).'); return }
    setError(null)
    const { error: err } = await setStage(n)
    if (err) { setError(err.message); return }
    setCustomStage('')
    setShowCustom(false)
  }

  return (
    <div className="space-y-5">
      {/* Current stage display */}
      <div className="bg-purple-950/40 border border-purple-800/50 rounded-2xl p-8 text-center">
        <p className="text-xs font-semibold text-purple-400 uppercase tracking-widest mb-3">
          Current Stage
        </p>
        {currentStage ? (
          <>
            <div className="text-8xl font-bold text-purple-300 leading-none mb-3">
              {currentStage.stage_number}
            </div>
            <p className="text-sm text-purple-500">Started {formatDate(currentStage.started_at)}</p>
          </>
        ) : (
          <>
            <div className="text-5xl font-bold text-purple-800 mb-2">—</div>
            <p className="text-sm text-purple-700">No stage set yet</p>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleAdvance}
          disabled={advancing}
          className="flex-1 flex items-center justify-center gap-2 bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white py-3 rounded-xl font-medium transition-colors"
        >
          <ArrowUpIcon className="w-5 h-5" />
          {advancing
            ? 'Advancing…'
            : `Advance to Stage ${(currentStage?.stage_number ?? 0) + 1}`}
        </button>
        <button
          onClick={() => { setShowCustom((v) => !v); setError(null) }}
          className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-colors"
        >
          Set Stage
        </button>
      </div>

      {showCustom && (
        <div className="flex gap-2">
          <input
            type="number"
            value={customStage}
            onChange={(e) => setCustomStage(e.target.value)}
            placeholder="Stage number"
            min={1}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-purple-500"
            onKeyDown={(e) => e.key === 'Enter' && handleSetCustom()}
          />
          <button
            onClick={handleSetCustom}
            className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Set
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* Stage history */}
      {ladderStages.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-800">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Stage History
            </h2>
          </div>
          <div className="divide-y divide-gray-800">
            {[...ladderStages].reverse().map((s, i) => (
              <div key={s.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                      i === 0 ? 'bg-purple-700 text-white' : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {s.stage_number}
                  </span>
                  <span className={`text-sm ${i === 0 ? 'text-purple-300 font-medium' : 'text-gray-400'}`}>
                    Stage {s.stage_number}
                    {i === 0 && ' (current)'}
                  </span>
                </div>
                <span className="text-xs text-gray-500">{formatDate(s.started_at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
