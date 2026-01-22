import { useQuery } from '@tanstack/react-query'
import * as TemplateService from '@/lib/services/templates'
import { useWorkspaceId } from '@/hooks/useWorkspaceId'
import { Modal, ModalContent, ModalFooter, ModalHeader, ModalSideBySideLayout } from '@vibe/core/next'
import {  Box, Flex, IconButton, ListItem, Menu, Text, TextArea, VirtualizedList, VirtualizedListItem } from '@vibe/core'
import { ChangeEvent, useState, CSSProperties, useCallback } from 'react'
import { TemplateItem } from '@/types/templates'
import { useDebounceEvent } from '@vibe/core'

type TemplateSelectorProps = {
  onSelect: (text: string) => void
  isChecked: boolean
  onChange: (event?: ChangeEvent<HTMLInputElement> | unknown) => void
}

export const TemplateSelector  = (props: TemplateSelectorProps) => {
  const { isChecked, onSelect, onChange } = props
  const workspaceId = useWorkspaceId()
  const [selected, changeSelect] = useState<TemplateItem | undefined>(undefined)
  const [, setMessage] = useState<string | undefined>(undefined)
  const { inputValue, onEventChanged, updateValue } = useDebounceEvent({ delay: 500, onChange: (value) => setMessage(value) })

  const { data } = useQuery({
    queryKey: [workspaceId,'TemplatesTableQuery'],
    queryFn: () => TemplateService.get({ workspaceId }),
  })

  function handleConfirm () {
    onSelect(inputValue)
    onChange()
  }

  const templatesItems = (data ?? []).map(template => ({
    height: 64,
    id: template.id,
    size: 58,
    value: template
  }))

  const itemRenderer = useCallback((item: VirtualizedListItem, _: number, style: CSSProperties) => {
    const template = item.value as TemplateItem
    return (
      <div key={item.id as string} style={{ ...style }}>
        <ListItem
          selected={template.id === selected?.name}
          size='large'
          onClick={() => {
            updateValue(template.message)
            changeSelect(template)
          }}
        >
          <Box>
            <Flex align='start' direction='column' justify='center'>
              <Text>{ template.name }</Text>
              <Text type='text3'>{ template.description }</Text>
            </Flex>
          </Box>
       </ListItem>
      </div>
    )
  }, [])

  return (
    <Modal
      id="modal-sbs"
      show={isChecked}
      renderHeaderAction={
        <IconButton
          icon={Menu}
          size="small"
          kind="tertiary"
          ariaLabel="Open Menu"
        />
      }
      size="large"
      onClose={onChange}
      style={{
        height: 400,
      }}
    >
      <ModalSideBySideLayout>
        <ModalHeader title="Seleccióna una plantilla" />
        <ModalContent>
          <div
            className='w-full h-[200px]'
          >
            <VirtualizedList
              getItemSize={item => item.height || 64}
              items={templatesItems}
              itemRenderer={itemRenderer}
              layout="vertical"
              onItemsRenderedThrottleMs={0}
              overscanCount={2}
            />
          </div>
        </ModalContent>
        <ModalContent>
          <Box>
            <Text type="text1" align="inherit" element="p">Personalízalo a tu gusto antes de compartirlo.</Text>
            <TextArea
              className='first:hidden!'
              size='small'
              placeholder='Escribe tu mensaje'
              value={inputValue}
              onChange={onEventChanged}
              resize={false}
              allowExceedingMaxLength
            />
          </Box>
        </ModalContent>
      </ModalSideBySideLayout>
      <ModalFooter
        primaryButton={{
          text: "Confirmar",
          onClick: handleConfirm,
        }}
        secondaryButton={{
          text: "Cancel",
          onClick: onChange,
        }}
      />
    </Modal>
  )
}
