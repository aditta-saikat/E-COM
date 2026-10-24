import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Trash2, Undo2 } from 'lucide-react'
import { validateImage } from '../lib/imgbb'

// Controlled picker: nothing is uploaded here. The parent uploads `change.file` when the form is saved.
const ImageUploader = ({
  currentUrl,
  change,
  onChange,
  disabled = false,
  label = 'Choose image',
  fallback = null,
  rounded = 'rounded-xl',
  size = 'h-24 w-24',
}) => {
  const inputRef = useRef(null)
  const [error, setError] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    if (!change.file) {
      setPreviewUrl('')
      return undefined
    }

    const objectUrl = URL.createObjectURL(change.file)
    setPreviewUrl(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [change.file])

  const displayUrl = change.file ? previewUrl : change.removed ? '' : currentUrl
  const hasPendingChange = Boolean(change.file) || change.removed

  const handleFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    try {
      await validateImage(file)
      setError('')
      onChange({ file, removed: false })
    } catch (err) {
      setError(err.message)
    }
  }

  const resetChange = () => {
    setError('')
    onChange({ file: null, removed: false })
  }

  return (
    <div>
      <div className="flex items-center gap-4">
        <div className={`flex shrink-0 items-center justify-center overflow-hidden bg-slate-100 text-slate-400 dark:bg-slate-800 ${rounded} ${size}`}>
          {displayUrl ? <img src={displayUrl} alt="" className="h-full w-full object-cover" /> : fallback || <ImagePlus size={22} />}
        </div>

        <div className="flex flex-col items-start gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ImagePlus size={14} />
            {displayUrl ? 'Change image' : label}
          </button>

          <div className="flex items-center gap-3">
            {displayUrl && !disabled && (
              <button
                type="button"
                onClick={() => onChange({ file: null, removed: true })}
                className="flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:text-rose-500 dark:text-rose-400"
              >
                <Trash2 size={12} />
                Remove
              </button>
            )}
            {hasPendingChange && !disabled && (
              <button
                type="button"
                onClick={resetChange}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <Undo2 size={12} />
                Undo
              </button>
            )}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {hasPendingChange ? 'Preview only. It is uploaded when you save.' : 'JPG, PNG, GIF or WebP · up to 5 MB · min 100×100.'}
          </p>
        </div>
      </div>

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleFile} className="hidden" />
      {error && <p role="alert" className="mt-2 text-sm text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  )
}

export default ImageUploader
