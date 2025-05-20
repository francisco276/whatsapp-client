import { Skeleton, VirtualizedList } from '@vibe/core'

export const SideBarList = ({ elements = 10 }: { elements?: number }) => {
  const arrayOfElements = Array.from({ length: elements }).map((_, index) => ({
    height: 40,
    id: index.toString(),
    size: 40,
    value: index.toString()
  }))
  return (
    <div
      className='w-full flex-1'
    >
      <VirtualizedList
        getItemSize={() => 40}
        items={arrayOfElements}
        itemRenderer={() => (
          <div className='!mt-2 !px-0'>
            <Skeleton fullWidth={true} height={40} type='rectangle' />
          </div>
        )}
        layout="vertical"
      />
    </div>
  )
}