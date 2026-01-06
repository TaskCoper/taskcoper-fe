import { pointerWithin, rectIntersection, type CollisionDetection } from '@dnd-kit/core'

export const customCollisionDetection: CollisionDetection = (args) => {
  // First, let's see if there are any collisions with the pointer
  const pointerCollisions = pointerWithin(args)

  // Collision detection algorithms return an array of collisions
  if (pointerCollisions.length > 0) {
    return pointerCollisions
  }

  // If there are no collisions with the pointer, return rectangle intersections
  return rectIntersection(args)
}
