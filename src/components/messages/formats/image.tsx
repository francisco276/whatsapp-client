const getExtFromMime = (mime: string): string => {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
  }
  return map[mime] || '.jpg'
}

export const MessageImageComponent = ({ url, mimeType }: { url: string, mimeType?: string }) => {
  const handleDownload = () => {
    const ext = mimeType ? getExtFromMime(mimeType) : '.jpg'
    const link = document.createElement('a')
    link.href = url
    link.download = `imagen${ext}`
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    link.click()
  }

  return (
    <div>
      <div
        className="max-h-[200px] object-cover cursor-pointer"
        onClick={handleDownload}
        title="Clic para descargar"
      >
        <img
          src={url}
          alt="message"
          className="rounded-lg object-cover max-h-[200px] hover:opacity-90 transition-opacity"
          height={200}
        />
      </div>
    </div>
  )
}
