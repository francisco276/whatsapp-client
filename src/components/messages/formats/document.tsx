import { Flex, Icon } from '@vibe/core'
import { Doc } from '@vibe/icons'

export const MessageDocumentComponent = ({
  name
}: { name: string, type?: string }) => {
  return (
    <Flex
      align='center'
      gap={10}
      className='bg-blue-400 rounded-sm p-2 bg-blend-soft-light'
    >
      <Icon icon={Doc} />
      <p className='text-sm'>{name}</p>
    </Flex>
  )
}
