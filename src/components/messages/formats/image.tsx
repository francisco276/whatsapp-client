export const MessageImageComponent = ({ url }: { url: string }) => {
  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = url
    link.download = 'image'
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
