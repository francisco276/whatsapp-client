export const MessageImageComponent = ({ url }: { url: string }) => {
  return (
    <div>
      <div className="max-h-[200px] object-cover">
        <img
          src={url}
          alt="message"
          className="rounded-lg object-cover max-h-[200px]"
          height={200}
        />
      </div>
    </div>
  )
}
