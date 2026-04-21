export const cropImageFile = async (file: File, options?: { width?: number; height?: number }) => {
  const width = Math.max(1, Number(options?.width || 600))
  const height = Math.max(1, Number(options?.height || width))
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error || new Error('file_read_failed'))
    reader.readAsDataURL(file)
  })

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('image_load_failed'))
    img.src = dataUrl
  })

  const sourceRatio = image.width / image.height
  const targetRatio = width / height
  let sx = 0
  let sy = 0
  let sw = image.width
  let sh = image.height

  if (sourceRatio > targetRatio) {
    sw = image.height * targetRatio
    sx = (image.width - sw) / 2
  } else {
    sh = image.width / targetRatio
    sy = (image.height - sh) / 2
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('canvas_context_failed')
  }

  context.drawImage(image, sx, sy, sw, sh, 0, 0, width, height)

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => {
      if (value) resolve(value)
      else reject(new Error('blob_create_failed'))
    }, 'image/jpeg', 0.92)
  })

  return {
    file: new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' }),
    previewUrl: canvas.toDataURL('image/jpeg', 0.92)
  }
}

export const uploadPreparedImage = async (file: File) => {
  const body = new FormData()
  body.append('file', file)
  return await $fetch<{ url: string }>('/api/upload', { method: 'POST', body })
}
