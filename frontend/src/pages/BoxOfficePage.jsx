import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import BoxOfficeView from '../components/boxoffice/BoxOfficeView'
import { getPublicBoxOffice, listPublicBoxOfficeEvents } from '../services/boxOffice'

// Public page at /discover/bo/<custom-url or id>
export default function BoxOfficePage() {
  const { key } = useParams()
  const [state, setState] = useState({ status: 'loading' })

  useEffect(() => {
    let off = false
    setState({ status: 'loading' })
    ;(async () => {
      try {
        const box = await getPublicBoxOffice(key)
        if (off) return
        if (!box) return setState({ status: 'missing' })
        const events = await listPublicBoxOfficeEvents(box.id).catch(() => [])
        if (!off) setState({ status: 'ready', box, events })
      } catch { if (!off) setState({ status: 'error' }) }
    })()
    return () => { off = true }
  }, [key])

  useEffect(() => {
    if (state.status === 'ready') document.title = `${state.box.title} | TicketsGlobal`
    return () => { document.title = 'TicketsGlobal' }
  }, [state])

  if (state.status === 'loading') return <div className="mx-auto max-w-5xl px-5 py-16" aria-busy="true"><div className="h-96 animate-pulse rounded-2xl bg-gray-100" /></div>
  if (state.status !== 'ready') return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      <h1 className="text-3xl font-bold">{state.status === 'missing' ? 'Box office not found' : "We couldn't load this page"}</h1>
      <p className="mt-3 text-ink/70">{state.status === 'missing' ? 'It may have been removed or the link is wrong.' : 'Please refresh and try again.'}</p>
      <Link to="/events" className="mt-8 inline-block rounded-md bg-brand px-8 py-3 text-sm text-white hover:bg-brand-dark">Discover events</Link>
    </div>
  )
  const { box, events } = state
  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      {box.status !== 'published' && <p role="status" className="mb-4 rounded-md bg-amber-50 px-4 py-2 text-sm text-amber-800">Preview: this box office is not published, so only you can see it.</p>}
      <BoxOfficeView box={box} events={events} theme={box.theme} settings={box.settings} />
    </div>
  )
}
