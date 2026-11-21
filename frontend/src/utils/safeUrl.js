export function safeHttpUrl(u) {
  try { const x = new URL(u); return /^https?:$/.test(x.protocol) ? x.href : null } catch { return null }
}

const HANDLE = /^[A-Za-z0-9._]{1,30}$/
// Organiser-supplied links are checked before they are shown.
export function socialLinks(s = {}) {
  const out = []
  const web = s.website && safeHttpUrl(s.website)
  if (web) out.push({ label: 'Website', href: web })
  if (s.instagram && HANDLE.test(s.instagram)) out.push({ label: 'Instagram', href: `https://instagram.com/${s.instagram}` })
  if (s.x && HANDLE.test(s.x)) out.push({ label: 'X', href: `https://x.com/${s.x}` })
  const fb = s.facebook && safeHttpUrl(s.facebook)
  if (fb) out.push({ label: 'Facebook', href: fb })
  return out
}
