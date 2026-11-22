// Help centre content. Block types: ['h', text] heading · ['p', text] · ['ul', [..]] · ['ol', [..]] · ['note', text] · ['link', path, label]
// Use **bold** inside any text. Only describe things that exist in the product today.

export const CATEGORIES = [
  { id: 'start', name: 'Organizer: Start Here', color: '#fa6540', text: 'Everything you need to know about getting started with TicketsGlobal as an event organizer.' },
  { id: 'attending', name: 'Attending an Event', color: '#1a8a98', text: "If you're an event attendee, you'll find answers to the most common questions here." },
  { id: 'tutorials', name: 'Organizer: Tutorials', color: '#000000', text: 'Step-by-step guides on how to carry out different tasks as an event organizer.' },
  { id: 'faqs', name: 'Organizer: FAQs', color: '#b620e0', text: 'Helpful answers to the most common questions event organizers ask us.' },
]

export const POPULAR = ['getting-a-ticket', 'access-your-ticket', 'create-live-event', 'create-tickets', 'check-in-guests', 'add-payout-account']

export const ARTICLES = [
  // ---------------- Attending ----------------
  {
    slug: 'getting-a-ticket', category: 'attending', updated: '2026-11-21', title: 'Getting a ticket',
    body: [
      ['p', 'You can get tickets in a few quick steps. You do not need an account to buy.'],
      ['h', 'How do I get a ticket?'],
      ['ol', ['Open the event page and click **Get a Ticket**.', 'Choose how many of each ticket you want.', 'Enter your name, email address and phone number. If you are buying for friends, you can add a different email for each ticket so everyone receives their own.', 'Click **Order Ticket**.']],
      ['p', 'Your tickets appear on the confirmation page straight away and are also emailed to you.'],
      ['h', 'Good to know'],
      ['ul', ['You have **10 minutes** to finish once you reach the details step.', 'You can order up to **10 tickets** at a time, and organizers can set a lower limit per person for each ticket type.', 'Some tickets only go on sale at a set time. If a ticket says "Sales start…", come back at that time. If it says "Sales ended", it is no longer available online.', 'Some tickets are invite-only. Ask the organizer for details.', 'Marketing emails are optional. A tick-box asks if you want updates from the organizer, and it is never ticked for you.']],
      ['h', 'What about paid tickets?'],
      ['p', 'Online payment for paid tickets is coming soon. Until then, free tickets can be ordered online. For a paid event, contact the organizer about how to buy.'],
      ['link', '/help/articles/access-your-ticket', 'How to access your ticket'],
    ],
  },
  {
    slug: 'access-your-ticket', category: 'attending', updated: '2026-11-21', title: 'How to access your ticket',
    body: [
      ['p', 'There are two ways to find your tickets after you order.'],
      ['h', 'From your email'],
      ['p', 'We email your tickets to the address you used when ordering. Each ticket has its own **QR code**. Show it on your phone at the entrance.'],
      ['h', 'By signing in with a link'],
      ['ol', ['Go to **Find your tickets** and enter the email address you used to order.', 'Open the email we send you and click the sign-in link.', 'Your tickets are listed under **My Tickets**.']],
      ['note', 'Sign-in links work **once** and expire after a short time. If a link has expired or been used, request a new one. You can request another after 60 seconds.'],
      ['p', 'You never need a password to see tickets you bought as a guest. Always use the **same email address** you ordered with.'],
      ['link', '/tickets/sign-in', 'Find your tickets'],
    ],
  },
  {
    slug: 'no-ticket-email', category: 'attending', updated: '2026-11-21', title: "I didn't get my ticket email",
    body: [
      ['p', 'Ticket emails usually arrive within a minute. If yours has not, try these in order.'],
      ['ol', ['**Check your spam or junk folder** and any "Promotions" tab.', 'Make sure the email address on your order is correct. Tickets go only to the address you entered.', 'Wait a few minutes and refresh your inbox.', 'Use **Find your tickets** to sign in with your email. Your tickets are there even if the email never arrives.']],
      ['p', 'If you still cannot find your tickets, contact us with the event name and the email address you used.'],
      ['link', '/tickets/sign-in', 'Find your tickets'],
    ],
  },
  {
    slug: 'what-to-bring', category: 'attending', updated: '2026-11-21', title: 'What do I need to attend an event?',
    body: [
      ['ul', ['Your **ticket QR code**, on your phone or printed. A screenshot works too.', 'Staff scan the code at the entrance. Each ticket can be used **once**, so please do not post your QR code online.', 'A **group ticket** admits the number of people shown on it (for example "admits 4"). One scan covers the whole group.', 'If your phone dies or the code will not scan, give staff your name. They can find you on the guest list.']],
      ['p', 'For the programme, seating and venue rules, contact the organizer using the details on the event page.'],
    ],
  },
  // ---------------- Start here ----------------
  {
    slug: 'getting-started', category: 'start', updated: '2026-11-21', title: 'Getting started as an organizer',
    body: [
      ['p', 'Anyone can create and sell tickets on TicketsGlobal. There is no approval process.'],
      ['h', 'The quick path'],
      ['ol', ['**Sign up** as an individual or an organisation and confirm your email address.', '**Create an event** in three steps: Details, Appearance and Tickets.', '**Publish** it from your events list. You need a confirmed email and at least one ticket.', '**Share** your event link.', 'On the day, add **staff** to scan tickets and, if you like, sell at the door.']],
      ['h', 'Free or paid?'],
      ['p', 'Free events need no payment setup. To publish **paid** tickets, you first add a payout account so we know where to send your money.'],
      ['link', '/help/articles/create-live-event', 'How to create a live event'],
      ['link', '/help/articles/add-payout-account', 'How to add your payout account'],
    ],
  },
  {
    slug: 'publish-your-event', category: 'start', updated: '2026-11-21', title: 'How to publish or unpublish your event',
    body: [
      ['p', 'New events start as drafts. Only published events appear on Discover and can be bought from.'],
      ['ol', ['Go to **Dashboard → Events**.', 'Find your event and choose **Publish**.']],
      ['h', 'If it will not publish'],
      ['ul', ['Confirm your **email address**. Publishing needs a verified email.', 'Add **at least one ticket** to the event.', 'For **paid** tickets, add a verified **payout account** under Account → Payouts.']],
      ['p', 'To take an event offline, choose **Unpublish** from the same list. Tickets already sold stay valid. You can also delete drafts you no longer need.'],
    ],
  },
  // ---------------- Tutorials ----------------
  {
    slug: 'create-live-event', category: 'tutorials', updated: '2026-11-21', title: 'How to create a live event',
    body: [
      ['ol', ['**Log in** (or sign up) to your account.', 'Open **Dashboard → Events** and click **Add new event**.', 'Fill in the **Details**: name, description, country, venue address, format, category, and date and time. Pick the right time zone for your event.', 'Optional: add a lineup (speakers, artists), social links, and a custom URL for your event page.', 'Click **Continue** to the **Appearance** step. Upload up to four images and one video, choose a theme and colour, and preview the page.', 'Click **Continue** to **Tickets** and create your tickets.', 'When you are happy, **publish** the event.']],
      ['note', 'You can come back and edit a draft or live event at any time.'],
      ['link', '/help/articles/create-tickets', 'How to create tickets'],
      ['link', '/help/articles/publish-your-event', 'How to publish your event'],
    ],
  },
  {
    slug: 'create-tickets', category: 'tutorials', updated: '2026-11-21', title: 'How to create tickets',
    body: [
      ['ol', ['In the **Tickets** step of your event, click **Create ticket**.', 'Choose **Single ticket** (admits one person) or **Group ticket** (admits 2 to 20 people on one QR code), then **Continue**.', 'Choose **Free** or **Paid** and set the price for paid tickets.', 'Give the ticket a name and description, and choose a limited or unlimited quantity.', 'Set the **order limit** per person (single tickets) or the group size (group tickets).', 'Optional: add perks, and set a **sales window**.', 'Click **Save**.']],
      ['h', 'Invite-only tickets'],
      ['p', 'Tick **Invite-only** to protect a ticket with a password. You can also require your approval.'],
      ['h', 'Edit or delete'],
      ['p', 'Use the pencil and bin icons beside a ticket. You can create as many ticket types as you need, such as Early bird, Regular and VIP.'],
      ['link', '/help/articles/ticket-sales-window', 'Set when ticket sales open and close'],
    ],
  },
  {
    slug: 'ticket-sales-window', category: 'tutorials', updated: '2026-11-21', title: 'How to set when ticket sales open and close',
    body: [
      ['p', 'Every ticket can have its own **Sales start** and **Sales end**. This is handy for early-bird prices, a late batch of tickets, or tickets released shortly before the event.'],
      ['ol', ['Open your event and go to the **Tickets** step.', 'Create a ticket, or click the pencil on an existing one.', 'Set **Sales start**, **Sales end**, or both.', 'Click **Save**.']],
      ['ul', ['Times use **your event\'s time zone**, shown next to the fields.', 'Leave both empty to sell from now until the event ends.', 'Before the start time, buyers see when sales start. After the end time, they see "Sales ended".', 'Your staff can still **sell at the door** outside the window.']],
    ],
  },
  {
    slug: 'add-payout-account', category: 'tutorials', updated: '2026-11-21', title: 'How to add your payout account',
    body: [
      ['p', 'You need a payout account before you can publish paid tickets. Free events do not need one.'],
      ['ol', ['Go to **Dashboard → Account → Payouts**.', 'Click to add an account.', 'Choose your **bank** from the list.', 'Enter your **account number**. The account name fills in automatically.', 'Click **Save**.']],
      ['note', 'The account name must match the name on your profile. If you signed up as an organisation, it must match your business name. If they differ, update your profile first.'],
      ['p', 'We keep only the last four digits of your account number.'],
    ],
  },
  {
    slug: 'check-in-guests', category: 'tutorials', updated: '2026-11-21', title: 'How to add staff and check in guests',
    body: [
      ['h', 'Add a team member'],
      ['ol', ['Go to **Dashboard → Account → Staff** and click **Add team member**.', 'Enter their name and choose what they can do: check in tickets, and optionally sell at the door.', 'Copy the **passcode** shown next to their name and send it to them.', 'Click the clipboard icon to choose which events they can work on, or give them all your events.']],
      ['h', 'On event day'],
      ['ol', ['Staff open the **scan page** and sign in with their passcode.', 'They tap the event, then **Scan QR code**, and allow camera access.', 'They hold the QR code inside the frame. Scanning starts by itself.', 'Check the guest details and tap **Check In**.']],
      ['p', 'No QR code? Staff can search the attendee list by name, email or order ID and check the guest in from there.'],
      ['ul', ['A ticket that was already used shows as **Checked in**, with who checked it in and when.', 'A ticket for a different event, or a cancelled one, is flagged and cannot be checked in.', 'You can switch a team member off at any time with the person icon on the Staff page.']],
    ],
  },
  {
    slug: 'sell-at-the-door', category: 'tutorials', updated: '2026-11-21', title: 'How to sell tickets at the door',
    body: [
      ['p', 'Let trusted staff sell tickets at the entrance. The guest pays your staff directly, and the sale is recorded.'],
      ['h', 'Turn it on'],
      ['ol', ['Go to **Dashboard → Account → Staff** and edit the team member.', 'Switch on **Sell tickets at the door** and save.', 'Ask them to sign out and back in to the scan page if they were already signed in.']],
      ['h', 'Make a sale'],
      ['ol', ['On the scan page, open the event and tap **Sell tickets**.', 'Choose the tickets and enter the guest\'s name. Email and phone are optional. Add an email to send the ticket to them.', 'For paid tickets, choose **Cash** or **Bank transfer**.', 'Leave **Check the guest in now** ticked if they are entering right away.', 'Tap **Sell tickets**.']],
      ['note', 'Staff confirm the payment themselves, so only give this permission to people you trust. Door sales are not charged online fees. Ticket quantities still apply, so you cannot oversell.'],
    ],
  },
  {
    slug: 'box-office', category: 'tutorials', updated: '2026-11-21', title: 'How to create a box office page',
    body: [
      ['p', 'A box office page is one shareable page that shows several of your events together, with your own look.'],
      ['ol', ['Go to **Dashboard → Box office** and click **Create box office**.', 'Fill in the **Details**, then pick a theme, font and colours under **Design**.', 'Under **Events**, choose which of your published events to show.', 'Save and **publish** it, then share the link.']],
      ['p', 'Only your own published events can be added. To publish, you need a confirmed email and at least one event.'],
    ],
  },
  // ---------------- FAQs ----------------
  {
    slug: 'who-can-sell', category: 'faqs', updated: '2026-11-21', title: 'Who can create events?',
    body: [
      ['p', 'Anyone. Sign up, confirm your email, and create an event. There is no approval step.'],
      ['p', 'To keep buyers safe, you must confirm your email before publishing, and paid events need a verified payout account whose name matches your profile.'],
    ],
  },
  {
    slug: 'guests-need-account', category: 'faqs', updated: '2026-11-21', title: 'Do my guests need an account?',
    body: [
      ['p', 'No. Guests can order with just their name, email and phone number. Their tickets are emailed to them, and they can see them later by signing in with a one-time email link. No password needed.'],
    ],
  },
  {
    slug: 'ticket-limits', category: 'faqs', updated: '2026-11-21', title: 'How many tickets can one person buy?',
    body: [
      ['p', 'You choose an **order limit per person** for each single ticket type, and group tickets default to five. Nobody can buy more than **10 tickets** in one order.'],
      ['p', 'Limits are checked on our servers, so they cannot be skipped by refreshing the page.'],
    ],
  },
  {
    slug: 'staff-event-access', category: 'faqs', updated: '2026-11-21', title: 'Can staff only see some of my events?',
    body: [
      ['p', 'Yes. For each team member you can choose all your events or a specific list. They only see the events you assign.'],
      ['p', 'Staff never see your dashboard, earnings or other accounts. They can only use the scan page.'],
    ],
  },
  {
    slug: 'fees', category: 'faqs', updated: '2026-11-21', title: 'What does it cost?',
    body: [
      ['p', 'Free events cost nothing. Fees on paid tickets are shown on our pricing page.'],
      ['link', '/pricing', 'See pricing'],
    ],
  },
]

export const articleBySlug = (slug) => ARTICLES.find((a) => a.slug === slug)
export const byCategory = (id) => ARTICLES.filter((a) => a.category === id)
export const categoryById = (id) => CATEGORIES.find((c) => c.id === id)
export const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const plain = (a) => `${a.title} ${a.body.map(([t, v, l]) => (t === 'ul' || t === 'ol' ? v.join(' ') : t === 'link' ? l : v)).join(' ')}`.toLowerCase().replace(/\*\*/g, '')

export function search(query) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (!words.length) return []
  return ARTICLES
    .map((a) => {
      const text = plain(a), title = a.title.toLowerCase()
      if (!words.every((w) => text.includes(w))) return null
      return { a, score: words.reduce((s, w) => s + (title.includes(w) ? 3 : 0) + 1, 0) }
    })
    .filter(Boolean).sort((x, y) => y.score - x.score).map((r) => r.a)
}
