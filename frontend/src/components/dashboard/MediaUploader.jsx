import { useRef, useState } from 'react'
import { Plus, X, Play } from 'lucide-react'

const IMG_MAX = 5 * 1024 * 1024, VID_MAX = 30 * 1024 * 1024

// media: [{ type: 'image' | 'video', url, path }]. The first image is the event cover.
export default function MediaUploader({ media, onChange, upload }) {
  const ref = useRef(null)
  const [busy, setBusy] = useState(0)
  const [err, setErr] = useState('')
  const images = media.filter((m) => m.type === 'image').length
  const hasVideo = media.some((m) => m.type === 'video')
  const canAdd = images < 4 || !hasVideo

  async function pick(e) {
    const files = [...(e.target.files ?? [])]; e.target.value = ''
    setErr('')
    let list = [...media], imgs = images, vid = hasVideo
    for (const f of files) {
      const isImg = ['image/jpeg', 'image/png'].includes(f.type), isVid = f.type === 'video/mp4'
      if (!isImg && !isVid) { setErr('Use JPEG/PNG images or an MP4 video.'); continue }
      if (isImg && (imgs >= 4 || f.size > IMG_MAX)) { setErr(imgs >= 4 ? 'You can upload up to 4 images.' : 'Images can be up to 5MB.'); continue }
      if (isVid && (vid || f.size > VID_MAX)) { setErr(vid ? 'You can upload 1 video.' : 'Videos can be up to 30MB.'); continue }
      setBusy((b) => b + 1)
      try {
        const { url, path } = await upload(f)
        list = [...list, { type: isImg ? 'image' : 'video', url, path }]
        onChange(list)
        if (isImg) imgs++; else vid = true
      } catch (x) { setErr(x.message) } finally { setBusy((b) => b - 1) }
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-4">
        {media.map((m, i) => (
          <div key={m.path ?? m.url} className="relative h-40 w-32 overflow-hidden rounded-lg border border-ink/10 bg-gray-100">
            {m.type === 'image'
              ? <img src={m.url} alt="" className="h-full w-full object-cover" />
              : <div className="grid h-full place-items-center bg-ink text-white"><Play size={28} /></div>}
            {i === 0 && m.type === 'image' && <span className="absolute left-1 top-1 rounded bg-brand px-1.5 py-0.5 text-[10px] text-white">Cover</span>}
            <button type="button" aria-label="Remove file" onClick={() => onChange(media.filter((x) => x !== m))}
              className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-white shadow"><X size={14} /></button>
          </div>
        ))}
        {busy > 0 && <div className="grid h-40 w-32 animate-pulse place-items-center rounded-lg bg-gray-100 text-xs">Uploading…</div>}
        {canAdd && (
          <button type="button" onClick={() => ref.current?.click()} aria-label="Add image or video"
            className="grid h-40 w-32 place-items-center rounded-lg border border-dashed border-ink/30 text-ink/60 hover:bg-gray-50"><Plus /></button>
        )}
      </div>
      <input ref={ref} type="file" multiple accept="image/jpeg,image/png,video/mp4" className="hidden" onChange={pick} />
      {err && <p role="alert" className="mt-2 text-xs text-red-600">{err}</p>}
    </div>
  )
}
