const MAX = 600 // langste zijde in pixels

// Verkleint een gekozen foto in de browser en geeft base64 + type terug.
export async function verklein(file) {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const schaal = Math.min(1, MAX / Math.max(bmp.width, bmp.height))
  const w = Math.round(bmp.width * schaal)
  const h = Math.round(bmp.height * schaal)

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  canvas.getContext('2d').drawImage(bmp, 0, 0, w, h)
  bmp.close?.()

  let blob = await new Promise((r) => canvas.toBlob(r, 'image/webp', 0.82))
  // Oudere Safari maakt geen WebP: dan JPEG
  if (!blob || blob.type !== 'image/webp') blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', 0.85))

  const data = await new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => resolve(String(fr.result).split(',')[1])
    fr.onerror = reject
    fr.readAsDataURL(blob)
  })
  return { data, type: blob.type }
}
