import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Coins } from 'lucide-react'
import Modal from '../../components/Modal'
import SendToModal from '../../components/dashboard/marketing/SendToModal'
import { CampaignsTab, SegmentsTab, SubscribersTab } from '../../components/dashboard/marketing/MarketingTabs'
import { getOverview } from '../../services/marketing'
import { CREDIT_COST } from '../../data/marketing'
import { useAuthStore } from '../../store/authStore'

const TABS = [['campaigns', 'Campaigns'], ['segments', 'Segments'], ['subscribers', 'Subscribers']]

export default function Marketing() {
  const user = useAuthStore((s) => s.user)
  const [params, setParams] = useSearchParams()
  const tab = TABS.some(([k]) => k === params.get('tab')) ? params.get('tab') : 'campaigns'
  const [overview, setOverview] = useState(null)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null) // 'sendTo' | 'credits'
  const load = useCallback(() => getOverview().then((o) => { setOverview(o); setError('') }).catch((e) => setError(e.message)), [])
  useEffect(() => { load() }, [load])

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Email marketing</h1>
        <button type="button" onClick={() => setModal('sendTo')} className="rounded-lg bg-brand px-6 py-3 text-sm text-white hover:bg-brand-dark">New email</button>
      </div>

      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error} <button className="underline" onClick={load}>Try again</button></p>}

      <div className="mt-6 inline-flex flex-wrap items-center gap-x-8 gap-y-3 rounded-xl border border-ink/10 px-5 py-3 text-xs">
        <p>Total subscribers: <b className="ml-2 text-sm">{overview?.total ?? 0}</b></p>
        <p className="flex items-center gap-1.5">Cost per email: <Coins size={13} className="text-brand" aria-label="credits" /><b className="text-sm">{CREDIT_COST}</b></p>
        <p className="flex items-center gap-1.5">Balance: <Coins size={13} className="text-brand" aria-label="credits" /><b className="text-sm">{overview?.credits ?? 0}</b></p>
        <button type="button" onClick={() => setModal('credits')} className="rounded-lg bg-[#fdece8] px-5 py-3 text-sm text-brand hover:bg-[#fbdcd3]">Buy credits</button>
      </div>

      <div role="tablist" aria-label="Email marketing" className="mt-8 flex gap-8 border-b border-ink/10">
        {TABS.map(([k, label]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setParams(k === 'campaigns' ? {} : { tab: k })}
            className={`-mb-px border-b-2 pb-3 text-sm ${tab === k ? 'border-brand font-medium text-brand' : 'border-transparent'}`}>{label}</button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'campaigns' && <CampaignsTab onNewEmail={() => setModal('sendTo')} />}
        {tab === 'segments' && <SegmentsTab overview={overview} reloadOverview={load} />}
        {tab === 'subscribers' && <SubscribersTab reloadOverview={load} />}
      </div>

      {modal === 'sendTo' && <SendToModal overview={overview} userId={user.id} onClose={() => setModal(null)} />}
      {modal === 'credits' && (
        <Modal title="Buy credits" align="left" width="max-w-md" onClose={() => setModal(null)}
          footer={<button type="button" onClick={() => setModal(null)} className="w-full rounded-lg bg-brand py-3 text-sm text-white hover:bg-brand-dark">OK</button>}>
          <p className="text-sm text-ink/80">Buying credits isn't available yet. It needs online payments, which are coming soon. Each email costs {CREDIT_COST} credit.</p>
        </Modal>
      )}
    </div>
  )
}
