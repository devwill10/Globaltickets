import { MessageSquare } from 'lucide-react'

// Floating help button. Point href at your support email, WhatsApp or chat widget.
export default function SupportButton() {
  return (
    <a href="mailto:support@ticketsglobal.com" aria-label="Contact support"
      className="fixed bottom-6 right-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-brand text-white shadow-lg hover:bg-brand-dark">
      <MessageSquare size={24} />
    </a>
  )
}
