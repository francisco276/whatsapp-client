import { Skeleton, VirtualizedList } from '@vibe/core'

export const SideBarList = ({ elements = 10 }: { elements?: number }) => {
  const arrayOfElements = Array.from({ length: elements }).map((_, index) => ({
    height: 58,
    id: index.toString(),
    size: 58,
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
          <div className='p-4'>
            <Skeleton fullWidth={true} height={48} type='rectangle' />
          </div>
        )}
        layout="vertical"
      />
    </div>
  )
}
