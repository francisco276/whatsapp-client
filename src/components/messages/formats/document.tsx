export const MessageDocumentComponent = ({
  name,
  type
}:  { name: string, type?: string }) => {
  return (
    <div>
      {name}
    </div>
  )
}
