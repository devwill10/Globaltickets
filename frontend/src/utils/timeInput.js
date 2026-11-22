// Helpers for the "hh:mm" box on the event form.
// Phones show a number-only keypad with no ":" key, so the colon is added automatically:
// typing 400 gives 4:00 and 1030 gives 10:30. Typing the colon yourself still works.

export function formatTime(raw, prev = '') {
  const d = raw.replace(/\D/g, '').slice(0, 4)
  if (!d) return ''
  let hour
  if (d[0] === '0') hour = d.slice(0, 2) // 05
  else if (d[0] === '1' && d.length > 1 && '012'.includes(d[1])) hour = d.slice(0, 2) // 10, 11, 12
  else hour = d[0]
  const mins = d.slice(hour.length)
  if (mins) return `${hour}:${mins}`
  // Only an hour so far: keep a colon the person typed, but never add one (so Backspace can't get stuck)
  return raw.includes(':') && raw.length > prev.length ? `${hour}:` : hour
}

// On leaving the box: "4" or "4:" becomes "4:00"
export function finishTime(v) {
  const m = /^(0?[1-9]|1[0-2]):?$/.exec((v || '').trim())
  return m ? `${m[1]}:00` : v
}
