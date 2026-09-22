import { AlertTriangle, Loader2 } from 'lucide-react'
import Modal from './Modal'

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Delete',
  confirming = false,
}) => (
  <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
        <AlertTriangle size={17} />
      </span>
      <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
    </div>
    <div className="mt-5 flex justify-end gap-2">
      <button
        type="button"
        onClick={onClose}
        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={confirming}
        className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {confirming && <Loader2 size={14} className="animate-spin" />}
        {confirmLabel}
      </button>
    </div>
  </Modal>
)

export default ConfirmDialog
