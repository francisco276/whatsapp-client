import { Loader, Flex } from '@vibe/core'

export function FullLoader({ title, description }: {
  title: string,
  description: string
}) {
  return (
    <Flex className='h-screen w-full bg-slate-50'>
      <Flex className='flex-1' justify='center' align='center' direction='column'>
        <Loader size='medium' className='mx-auto text-[#0DACC8]' hasBackground />
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2 text-slate-700 mt-4">{title}</h3>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </Flex>
    </Flex>
  )
}
