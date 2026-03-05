export function calcEngajamento(followers, following, posts) {
  if (!followers || followers === 0) return null
  const ratio = followers / Math.max(following, 1)
  let base
  if (followers < 1000) base = 8.0
  else if (followers < 5000) base = 5.5
  else if (followers < 10000) base = 4.0
  else if (followers < 50000) base = 3.0
  else if (followers < 100000) base = 2.0
  else base = 1.5
  const ratioBonus = Math.min(ratio / 10, 1.5)
  return (base + ratioBonus).toFixed(1)
}

export function engColor(eng) {
  const v = parseFloat(eng)
  if (v >= 6) return { bg: 'rgba(34,197,94,0.15)', color: '#22c55e', border: 'rgba(34,197,94,0.3)' }
  if (v >= 3) return { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' }
  if (v >= 1) return { bg: 'rgba(249,115,22,0.15)', color: '#f97316', border: 'rgba(249,115,22,0.3)' }
  return { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'rgba(239,68,68,0.3)' }
}

export default function EngajamentoBadge({ followers, following, posts, realEng }) {
  const eng = realEng || calcEngajamento(followers, following, posts)
  if (!eng) return null
  const { bg, color, border } = engColor(eng)
  return (
    <span style={{
      backgroundColor: bg,
      color,
      border: `1px solid ${border}`,
      fontSize: '11px',
      fontWeight: '700',
      padding: '2px 8px',
      borderRadius: '20px',
      letterSpacing: '0.02em',
    }}>
      {eng}% eng.
    </span>
  )
}
