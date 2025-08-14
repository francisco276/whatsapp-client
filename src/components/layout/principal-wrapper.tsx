import { Box, Flex } from '@vibe/core'

type PrincipalWrapperProps = {
  children: React.ReactNode
}

export default function PrincipalWrapper({ children }: PrincipalWrapperProps) {
  return (
    <Flex className='w-screen h-screen' justify='center' align='center' >
      <Box>
        <Flex align='stretch' className='min-h-screen w-screen'>
          {children}
        </Flex>
      </Box>
    </Flex>
  )
}
