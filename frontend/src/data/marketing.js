export const CREDIT_COST = 1 // credits per email (display only until sending exists)

export const AUTO_SEGMENTS = [
  { key: 'bought3', title: 'Bought at least 3 events', text: 'Subscribers who have bought tickets to 3 or more of your events.' },
  { key: 'first_timers', title: 'First timers', text: 'Subscribers who have bought tickets to exactly one of your events.' },
  { key: 'slipping_away', title: 'Slipping away', text: "Bought tickets before but haven't bought a ticket in the last 12 months." },
  { key: 'high_spenders', title: 'High spenders', text: 'Total spend places them in the top 20% of all buyers, calculated at send time.' },
]

export const CONDITIONS = [
  { type: 'tickets_gt', label: 'Tickets purchased is more than', short: (n) => `Tickets purchased > ${n}` },
  { type: 'spent_gt', label: 'Amount spent is greater than', short: (n) => `Amount spent > ${n}` },
  { type: 'last_within_months', label: 'Last purchase is within (months)', short: (n) => `Last purchase within ${n} month${Number(n) === 1 ? '' : 's'}` },
  { type: 'opens_gt', label: 'Emails opened is greater than', short: (n) => `Emails opened > ${n}` },
]
export const conditionText = (c) => CONDITIONS.find((x) => x.type === c.type)?.short(c.value) ?? 'Unknown condition'
