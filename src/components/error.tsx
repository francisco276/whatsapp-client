import { Flex, Icon } from '@vibe/core'
import { Warning } from '@vibe/icons'
import { DEFAULT_ERROR } from '../config/errors'

type ErrorProps = {
  title?: string
  errorMessage: string
}

export const Error = ({ title, errorMessage }: ErrorProps) => (
  <Flex className='h-screen w-full bg-slate-50'>
    <Flex className='flex-1' justify='center' align='center' direction='column'>
      <Icon iconSize={56} icon={Warning} className='text-[#E83442]' />
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2 text-slate-700 mt-4">{title}</h3>
        <p className="text-sm text-slate-500">{errorMessage ?? DEFAULT_ERROR}</p>
      </div>
    </Flex>
  </Flex>
)
