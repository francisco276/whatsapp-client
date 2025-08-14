import { Flex, Icon } from '@vibe/core'
import * as Icons from '@vibe/icons'

type IconName = keyof typeof Icons

type EmptyStateProps = {
  title?: string
  icon?: IconName
  description: string
  iconClassName?: string
}

export const EmptyState = ({ title, description, icon, iconClassName }: EmptyStateProps) => (
  <Flex className='h-full w-full bg-slate-50'>
    <Flex className='flex-1' justify='center' align='center' direction='column'>
      {icon && <Icon iconSize={56} icon={Icons[icon]} className={`${iconClassName ?? ''}`} />}
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2 text-slate-700 mt-4">{title}</h3>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
    </Flex>
  </Flex>
)
