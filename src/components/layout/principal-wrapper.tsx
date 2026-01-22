import { Box, Flex } from '@vibe/core'

type PrincipalWrapperProps = {
  children: React.ReactNode
}

export default function PrincipalWrapper({ children }: PrincipalWrapperProps) {
  return (
    <div className="flex flex-col h-screen w-screen">
      <Flex className='flex-1' justify='center' align='center' >
        <Box className="w-full h-full">
          <Flex align='stretch' className='h-full w-full'>
            {children}
          </Flex>
        </Box>
      </Flex>
      <div className="bg-slate-50 border-t border-slate-200 px-4 py-1 text-right">
        <span className="text-[10px] text-slate-400 font-medium">Versión 16</span>
      </div>
    </div>
  )
}
