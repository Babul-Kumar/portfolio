/**
 * Downloads a file to the user's device.
 * First tries client-side blob fetching (fastest, keeps browser context).
 * Falls back to server-side attachment proxy route for cross-origin or restricted URLs.
 */
export async function downloadCertificateFile(
  fileUrl: string,
  preferredFilename?: string
): Promise<boolean> {
  if (!fileUrl) return false

  const cleanFilename = preferredFilename
    ? preferredFilename.replace(/[<>:"/\\|?*\x00-\x1F]/g, '').trim().replace(/\s+/g, '_')
    : 'Certificate'

  // Attempt 1: Direct client-side fetch -> Blob -> URL.createObjectURL
  try {
    const res = await fetch(fileUrl, { mode: 'cors' })
    if (res.ok) {
      const blob = await res.blob()
      const ext = blob.type.includes('pdf')
        ? '.pdf'
        : blob.type.includes('svg')
          ? '.svg'
          : '.png'
      const finalName =
        cleanFilename.toLowerCase().endsWith('.pdf') ||
        cleanFilename.toLowerCase().endsWith('.png') ||
        cleanFilename.toLowerCase().endsWith('.svg') ||
        cleanFilename.toLowerCase().endsWith('.jpg')
          ? cleanFilename
          : `${cleanFilename}${ext}`

      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = finalName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2500)
      return true
    }
  } catch {
    // If CORS or network prevents direct client-side blob download, proceed to proxy
  }

  // Attempt 2: Fetch via internal proxy endpoint so we get real blob and force save
  try {
    const proxyUrl = `/api/certificates/download?url=${encodeURIComponent(fileUrl)}&filename=${encodeURIComponent(cleanFilename)}`
    const res = await fetch(proxyUrl)
    if (res.ok) {
      const blob = await res.blob()
      const ext = blob.type.includes('pdf')
        ? '.pdf'
        : blob.type.includes('svg')
          ? '.svg'
          : '.png'
      const finalName =
        cleanFilename.toLowerCase().endsWith('.pdf') ||
        cleanFilename.toLowerCase().endsWith('.png') ||
        cleanFilename.toLowerCase().endsWith('.svg') ||
        cleanFilename.toLowerCase().endsWith('.jpg')
          ? cleanFilename
          : `${cleanFilename}${ext}`

      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = finalName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2500)
      return true
    }
  } catch {
    // If proxy fetch fails, proceed to direct link fallback
  }

  // Attempt 3: Direct anchor link fallback
  try {
    const proxyUrl = `/api/certificates/download?url=${encodeURIComponent(fileUrl)}&filename=${encodeURIComponent(cleanFilename)}`
    const link = document.createElement('a')
    link.href = proxyUrl
    link.download = cleanFilename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    return true
  } catch (proxyError) {
    console.error('All certificate download strategies failed:', proxyError)
    window.open(fileUrl, '_blank')
    return false
  }
}

