export const BOX_THEMES = [
  { id: 'default', label: 'Default' }, { id: 'boxie', label: 'Boxie' },
  { id: 'edge', label: 'Edge' }, { id: 'night', label: 'Night' },
]

// Only these fonts can be used (they are loaded from Google Fonts)
export const FONTS = ['Inter', 'DM Sans', 'Space Mono', 'Space Grotesk', 'Work Sans', 'Syne', 'Libre Franklin', 'Cormorant', 'Fira Sans', 'Eczar',
  'Alegreya Sans', 'Alegreya', 'Source Sans Pro', 'Source Serif Pro', 'Roboto', 'Roboto Slab', 'BioRhyme', 'Inknut Antiqua', 'Poppins', 'Archivo Narrow',
  'Libre Baskerville', 'Playfair Display', 'Karla', 'Lora', 'Proza Libre', 'Spectral', 'IBM Plex Sans', 'Manrope', 'Montserrat', 'Lato', 'PT Sans',
  'PT Serif', 'Cardo', 'Chivo', 'Neuton', 'Rubik', 'Open Sans', 'Inconsolata', 'Raleway', 'Merriweather']

export const FONT_FIELDS = {
  header: 'Page header', body: 'Body Description Text', links: 'Body Description Links',
  sectionTitle: 'Section Title Text', sectionLink: 'Section Link Text', eventTitle: 'Event Title Text',
  eventDetails: 'Event Details Text', eventPrice: 'Event Price Text',
}
export const COLOR_FIELDS = { body: 'Body Description Text', links: 'Body Description Links', social: 'Social Icons' }
export const DEFAULT_COLORS = { body: '#161a2b', links: '#fa6540', social: '#161a2b' }

const HEX = /^#[0-9a-fA-F]{6}$/
export const isHex = (c) => HEX.test(c || '')

// Turns stored settings into values that are safe to use in styles (anything unexpected is dropped)
export function cleanSettings(s = {}) {
  const fonts = {}
  for (const k of Object.keys(FONT_FIELDS)) if (FONTS.includes(s.fonts?.[k])) fonts[k] = s.fonts[k]
  const colors = {}
  for (const k of Object.keys(COLOR_FIELDS)) colors[k] = isHex(s.colors?.[k]) ? s.colors[k] : DEFAULT_COLORS[k]
  return { logo_url: s.logo_url || '', fonts, colors }
}

export const fontsHref = (names) => {
  const uniq = [...new Set(names.filter((n) => FONTS.includes(n)))]
  return uniq.length ? `https://fonts.googleapis.com/css2?${uniq.map((n) => `family=${n.replace(/ /g, '+')}`).join('&')}&display=swap` : null
}
