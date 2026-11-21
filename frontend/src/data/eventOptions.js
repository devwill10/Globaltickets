// [tag shown to organisers, broad category used for Discover filters]
export const TAGS = [
  ['Democracy', 'Community'], ['Policy and Elections', 'Community'], ['Wellness', 'Sports & Wellness'],
  ['Visual Arts', 'Art & Culture'], ['Books and Literature', 'Art & Culture'], ['Gender and Equality', 'Community'],
  ['Shopping', 'Community'], ['Easter', 'Spirituality & Religion'], ['Christmas', 'Community'],
  ['Funfairs and Carnivals', 'Community'], ['Hiking', 'Sports & Wellness'], ['Kayaking', 'Sports & Wellness'],
  ['Travel and Outdoor', 'Sports & Wellness'], ['Dance', 'Art & Culture'], ['Christianity', 'Spirituality & Religion'],
  ['Ramadan', 'Spirituality & Religion'], ['Eid', 'Spirituality & Religion'], ['Islam', 'Spirituality & Religion'],
  ['Podcasts', 'Art & Culture'], ['Improv', 'Art & Culture'], ['Entrepreneurship', 'Career & Business'],
  ['Theatre', 'Art & Culture'], ['Poetry and Spoken Word', 'Art & Culture'], ['Comedy', 'Art & Culture'],
  // shown after "See more"
  ['Music', 'Art & Culture'], ['Fashion', 'Art & Culture'], ['Film', 'Art & Culture'], ['Networking', 'Career & Business'],
  ['Technology', 'Career & Business'], ['Education', 'Career & Business'], ['Fitness', 'Sports & Wellness'],
  ['Football', 'Sports & Wellness'], ['Food Festival', 'Food & Drink'], ['Wine and Spirits', 'Food & Drink'],
  ['Charity', 'Community'], ['Family', 'Community'], ['Youth', 'Community'], ['Gospel', 'Spirituality & Religion'],
]
export const VISIBLE_TAGS = 24
export const tagToCategory = Object.fromEntries(TAGS)

export const FORMATS = ['Conference', 'Concert', 'Festival', 'Workshop', 'Party', 'Meetup', 'Exhibition', 'Sports event', 'Networking', 'Religious service', 'Other']
export const LINEUP_TITLES = ['Artists', 'Speakers', 'Guests', 'Hosts', 'Performers', 'Panelists']
export const LINEUP_ROLES = ['Headliner', 'Featured', 'Performer']
export const CURRENCY = { Nigeria: 'NGN', Ghana: 'GHS', Kenya: 'KES', 'South Africa': 'ZAR' }

export const THEMES = [
  { id: 'default', label: 'Default' }, { id: 'mist', label: 'Mist' },
  { id: 'split', label: 'Split' }, { id: 'heritage', label: 'Heritage' },
]
export const THEME_COLORS = ['#fa6540', '#dc2626', '#1b9ad6', '#161a2b', '#7c6bf0', '#e8912d', '#36b37e', '#6b2f0b']
export const DEFAULT_COLOR = THEME_COLORS[0]

export const CURRENCY_SYMBOL = { NGN: '₦', GHS: 'GH₵', KES: 'KSh ', ZAR: 'R' }
// Default time zone for an organiser, from their country
export const COUNTRY_TZ = { Nigeria: 'Africa/Lagos', Ghana: 'Africa/Accra', Kenya: 'Africa/Nairobi', 'South Africa': 'Africa/Johannesburg' }
