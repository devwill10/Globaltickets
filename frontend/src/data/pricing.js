// !! SET YOUR OWN RATES HERE !!
// These numbers are placeholders. Use the commission you actually decided on.
// Display only: the real fee must also be calculated on your backend at checkout.
export const PRICING_COUNTRIES = {
  Nigeria: { percent: 5, flat: 100, symbol: '₦' },
  Ghana: { percent: 5, flat: 1, symbol: 'GH₵' },
  Kenya: { percent: 5, flat: 10, symbol: 'KSh ' },
  'South Africa': { percent: 5, flat: 2, symbol: 'R' },
}

export const formatFee = ({ percent, flat, symbol }) => `${percent}% + ${symbol}${flat}`

// DRAFT COPY. Keep only what TicketsGlobal will really offer at launch.
export const pricingCards = (fee) => [
  { id: 'types', title: 'Event Types', icon: 'CalendarDays', items: [
    'Unlimited free events', 'Unlimited paid events', 'Unlimited invite only events',
    'Virtual events', 'Recurring events', '1:1 events'] },
  { id: 'selling', title: 'Selling Tickets', icon: 'Ticket', items: [
    'No fee on free tickets', `${fee} fee per paid ticket`,
    'Pass online ticket fees to attendees', 'Manage your ticket inventory'] },
  { id: 'custom', title: 'Customisations', icon: 'Wand2', items: [
    'Custom event page link', 'Unlimited custom fields in checkout forms',
    'Customisable order confirmation email', 'Event page themes'] },
  { id: 'tracking', title: 'Tracking And Management', icon: 'BarChart3', items: [
    'Unlimited discount codes', 'Detailed report', 'Sales dashboard',
    'QR code check-in for attendees', 'Check-in analytics'] },
  { id: 'growth', title: 'Promotion And Growth', icon: 'Megaphone', items: [
    'Social sharing tools', 'Emails to attendees', 'Automated event reminders',
    'Search engine optimisation', 'Listing on the TicketsGlobal Discovery page'] },
  { id: 'security', title: 'Support And Security', icon: 'ShieldCheck', items: [
    'Chat and email support', 'Card payments', 'Bank transfers',
    'USSD payments', 'Secure payments through our payment partner'] },
]

export const customServices = [
  'Event staffing', 'APIs and white labelling', 'Event wristbands',
  'Equipment rentals', 'TicketsGlobal point of sale', 'Key account manager',
]
