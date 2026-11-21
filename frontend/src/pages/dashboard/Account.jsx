import { useSearchParams } from 'react-router-dom'
import { ProfileTab, SettingsTab, CreditTab } from '../../components/dashboard/account/AccountTabs'
import { PayoutsTab, StaffTab } from '../../components/dashboard/account/PayoutStaff'

const TABS = [['profile', 'Profile'], ['payouts', 'Payouts'], ['credit', 'TicketsGlobal credit'], ['settings', 'Settings'], ['staff', 'Staff management']]

export default function Account() {
  const [params, setParams] = useSearchParams()
  const tab = TABS.some(([k]) => k === params.get('tab')) ? params.get('tab') : 'profile'
  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold">Account</h1>
      <div role="tablist" aria-label="Account" className="mt-8 flex gap-6 overflow-x-auto border-b border-ink/10 sm:gap-10">
        {TABS.map(([k, label]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setParams(k === 'profile' ? {} : { tab: k })}
            className={`-mb-px whitespace-nowrap border-b-2 pb-4 text-sm ${tab === k ? 'border-brand font-medium text-brand' : 'border-transparent'}`}>{label}</button>
        ))}
      </div>
      <div role="tabpanel" className="mt-8">
        {tab === 'profile' && <ProfileTab />}
        {tab === 'payouts' && <PayoutsTab />}
        {tab === 'credit' && <CreditTab />}
        {tab === 'settings' && <SettingsTab />}
        {tab === 'staff' && <StaffTab />}
      </div>
    </div>
  )
}
