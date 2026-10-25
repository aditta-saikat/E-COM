import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

// Open modals, topmost last. Only the topmost one reacts to Escape, so a modal opened on top of another closes alone.
const openModals = []

const Modal = ({ open, onClose, title, children, maxWidth = 'max-w-md' }) => {
  const idRef = useRef(Symbol('modal'))

  useEffect(() => {
    if (!open) return undefined

    const id = idRef.current
    openModals.push(id)

    const onKeyDown = (event) => {
      if (event.key === 'Escape' && openModals[openModals.length - 1] === id) onClose()
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      openModals.splice(openModals.indexOf(id), 1)
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative max-h-[90vh] w-full ${maxWidth} animate-fade-in-up overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}

export default Modal
