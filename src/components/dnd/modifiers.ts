import type { Modifier } from '@dnd-kit/core'

/**
 * Snaps the center of the dragging element to the cursor position.
 * Useful for dialogs with CSS transforms that offset the default position.
 */
export const snapCenterToCursor: Modifier = ({ activatorEvent, draggingNodeRect, transform }) => {
  if (activatorEvent && draggingNodeRect) {
    const activatorCoordinates = activatorEvent as MouseEvent | TouchEvent
    const x = 'clientX' in activatorCoordinates ? activatorCoordinates.clientX : 0
    const y = 'clientY' in activatorCoordinates ? activatorCoordinates.clientY : 0

    const offsetX = x - draggingNodeRect.left - draggingNodeRect.width / 2
    const offsetY = y - draggingNodeRect.top - draggingNodeRect.height / 2

    return {
      ...transform,
      x: transform.x + offsetX,
      y: transform.y + offsetY
    }
  }
  return transform
}
