import { Flex, Icon, Loader } from '@vibe/core'
import { Doc, Download } from '@vibe/icons'

export const MessageDocumentComponent = ({
  name,
  url,
  isLoading,
  onDownload
}: { name: string, type?: string, url?: string, isLoading?: boolean, onDownload?: () => void }) => {
  const handleClick = () => {
    if (url) {
      const link = document.createElement('a')
      link.href = url
      link.download = name
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      link.click()
    } else if (onDownload) {
      onDownload()
    }
  }

  return (
    <Flex
      align='center'
      gap={10}
      className='bg-[#0B8AA0] rounded-sm p-2 bg-blend-soft-light cursor-pointer hover:brightness-110 transition-all'
      onClick={handleClick}
    >
      <Icon icon={Doc} />
      <p className='text-sm flex-1'>{name}</p>
      {isLoading ? (
        <Loader size="xs" />
      ) : (
        <Icon icon={Download} iconSize={16} className="opacity-70" />
      )}
    </Flex>
  )
}
