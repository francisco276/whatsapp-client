export const MessageVideoComponent = ({ 
  url,
  isGift = false
}: { url: string, isGift: boolean }) => {
  return (
    <video
      src={url}
      autoPlay={isGift}
      controls={!isGift}
      loop={isGift}
      className="rounded-lg max-h-[200px] object-cover"
    />
  )
}
