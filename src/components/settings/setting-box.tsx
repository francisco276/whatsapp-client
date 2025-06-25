import { Box, Text } from '@vibe/core'

type SettingBoxprops = {
  title: string
  children?: React.ReactNode
}

export const SettingBox = ({ title, children }: SettingBoxprops) => {
  return (
    <Box border rounded="medium" padding="medium" marginBottom="medium" borderColor="layoutBorderColor">
      <Text type="text1" weight="bold" className='uppercase'>{title}</Text>
      {children}
    </Box>
  )
}
