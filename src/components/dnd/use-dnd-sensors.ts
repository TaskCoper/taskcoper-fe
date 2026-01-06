import {
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  defaultKeyboardCoordinateGetter,
  useSensor,
  useSensors
} from '@dnd-kit/core'

export const useDndSensors = () => {
  return useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: defaultKeyboardCoordinateGetter })
  )
}
