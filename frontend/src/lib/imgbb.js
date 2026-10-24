const UPLOAD_URL = 'https://api.imgbb.com/1/upload'
const MAX_SIZE_BYTES = 5 * 1024 * 1024
const MIN_DIMENSION = 100
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

const readDimensions = (file) => new Promise((resolve, reject) => {
  const objectUrl = URL.createObjectURL(file)
  const image = new Image()

  image.onload = () => {
    URL.revokeObjectURL(objectUrl)
    resolve({ width: image.naturalWidth, height: image.naturalHeight })
  }
  image.onerror = () => {
    URL.revokeObjectURL(objectUrl)
    reject(new Error('This file could not be read as an image'))
  }
  image.src = objectUrl
})

// Throws an Error with a user-facing message when the file should not be uploaded.
export const validateImage = async (file) => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Use a JPG, PNG, GIF or WebP image')
  }

  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('Image must be 5 MB or smaller')
  }

  const { width, height } = await readDimensions(file)

  if (width < MIN_DIMENSION || height < MIN_DIMENSION) {
    throw new Error(`Image must be at least ${MIN_DIMENSION}×${MIN_DIMENSION} pixels`)
  }
}

export const uploadImage = async (file) => {
  const apiKey = import.meta.env.VITE_IMGBB_API_KEY

  if (!apiKey) {
    throw new Error('Image uploads are not configured (missing VITE_IMGBB_API_KEY)')
  }

  const body = new FormData()
  body.append('image', file)

  const response = await fetch(`${UPLOAD_URL}?key=${apiKey}`, { method: 'POST', body })
  const result = await response.json().catch(() => null)

  if (!response.ok || !result?.success) {
    throw new Error(result?.error?.message || 'Image upload failed')
  }

  return result.data.display_url || result.data.url
}

export const EMPTY_IMAGE_CHANGE = { file: null, removed: false }

// Turns a pending change ({ file, removed }) into the URL that should be saved.
export const resolveImageUrl = async (currentUrl, change) => {
  if (change.file) return uploadImage(change.file)
  if (change.removed) return ''
  return currentUrl || ''
}
