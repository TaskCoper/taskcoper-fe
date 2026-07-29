import type { DraggableAttributes, DraggableSyntheticListeners } from '@dnd-kit/core'
import * as React from 'react'

export interface DataTableRowDragHandle {
  attributes: DraggableAttributes
  listeners: DraggableSyntheticListeners
  isDragging: boolean
}

export const DataTableRowDragContext = React.createContext<DataTableRowDragHandle | null>(null)

/** Read the enclosing draggable row's activator props. Returns null when the row is not draggable. */
export function useDataTableRowDrag() {
  return React.useContext(DataTableRowDragContext)
}
