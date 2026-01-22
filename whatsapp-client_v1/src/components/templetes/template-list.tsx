import { useCallback } from 'react'
import { Table, TableVirtualizedBody, TableRow, TableHeader, TableHeaderCell, TableVirtualizedRow } from "@vibe/core"
import { TableColumn } from "node_modules/@vibe/core/dist/components/Table/Table/Table"
import { TemplateItem } from '@/types/templates'
import { TemplateListItem } from './template-list-item'
import { EmptyState } from '../empty-state'
import { Error } from '../error'

const HeaderColumn: TableColumn[] = [
  {
    id: 'name',
    title: 'Nombre',
  },
  {
    id: 'description',
    title: 'Descripción'
  },
  {
    id: 'message',
    title: 'Mensajes'
  },
  {
    id: 'active',
    title: 'Activo'
  },
  {
    id: 'updatedAt',
    title: 'Última modificación'
  },
  {
    id: 'actions',
    title: 'Acciones'
  }
]

export const TemplateList = ({ templates }: { templates: TemplateItem[] }) => {
  const items: TableVirtualizedRow[] = templates

  const Row = (data: TableVirtualizedRow) => {
    const item = data as TemplateItem

    return (
      <TableRow>
        <TemplateListItem item={item}/>
      </TableRow>
    )
  }

  const Header = useCallback((columns: TableColumn[]) => {
    return (
      <TableHeader>
        {columns.map((cell, index) => (
          <TableHeaderCell sticky={index === 0} key={index} {...cell} />
        ))}
      </TableHeader>
    )
  }, [])

  return ((
    <Table
      errorState={<Error 
        title='Ups... algo salió mal'
        errorMessage='No pudimos cargar tus elementos. Intenta de nuevo.' 
      />
      }
      emptyState={<EmptyState 
        title='Todavía no hay nada por aquí'
        description='Crea un template para empezar a dar forma a tu lista de elementos.'
        icon='AddSmall'
        iconClassName='text-[#A3E7F3]'
      />}
      columns={HeaderColumn}
      style={{
        height: 500,
      }}
    >
      <TableVirtualizedBody
        rowRenderer={Row}
        items={items}
        columns={HeaderColumn}
        headerRenderer={Header}
      />
    </Table>
  ))
}
