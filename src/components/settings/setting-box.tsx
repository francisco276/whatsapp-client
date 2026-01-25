import { Box, Text } from '@vibe/core'

type SettingBoxprops = {
  title: string
  children?: React.ReactNode
}

export const SettingBox = ({ title, children }: SettingBoxprops) => {
  return (
    <Box border rounded="medium" padding="medium" marginBottom="medium" borderColor="layoutBorderColor" className="bg-white">
      <Text type="text1" weight="bold" className='uppercase text-gray-700!'>{title}</Text>
      {children}
    </Box>
  )
}
