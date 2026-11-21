import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { CheckCircle2, AlertCircle } from 'lucide-react'

const ToastCtx = createContext(() => {})
export const useToast = () => useContext(ToastCtx)

export function ToastProvider({ children }) {
  const [t, setT] = useState(null)
  const show = useCallback((text, type = 'success') => setT({ text, type, id: Date.now() }), [])
  useEffect(() => {
    if (!t) return
    const id = setTimeout(() => setT(null), 3500)
    return () => clearTimeout(id)
  }, [t])

  return (
    <ToastCtx.Provider value={show}>
      {children}
      {t && (
        <div role="status" className={`fixed left-1/2 top-4 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm shadow-lg ${t.type === 'error' ? 'border-red-300 text-red-700' : 'border-green-300 text-green-800'}`}>
          {t.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}{t.text}
        </div>
      )}
    </ToastCtx.Provider>
  )
}
