const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const ordinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

// "Fri, Feb 5, 4PM" or, with ordinal=true, "Sat, Nov 7th, 6PM"
export function formatEventDate(iso, withOrdinal = false) {
  const d = new Date(iso)
  const h = d.getHours(), m = d.getMinutes()
  const hour = `${h % 12 || 12}${m ? ':' + String(m).padStart(2, '0') : ''}${h >= 12 ? 'PM' : 'AM'}`
  const day = withOrdinal ? ordinal(d.getDate()) : d.getDate()
  return `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${day}, ${hour}`
}

const LOCALES = { NGN: 'en-NG', GHS: 'en-GH', KES: 'en-KE', ZAR: 'en-ZA' }
export const formatPrice = (price, currency = 'NGN') =>
  price > 0
    ? new Intl.NumberFormat(LOCALES[currency] ?? 'en', { style: 'currency', currency, maximumFractionDigits: 0 }).format(price)
    : 'Free'

// Always shows the currency, even for zero (used for fees and totals)
export const formatMoney = (amount, currency = 'NGN') =>
  new Intl.NumberFormat(LOCALES[currency] ?? 'en', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
