import type { TaskPreview } from '@/types/task.type'

const HOUR_HEIGHT = 60

export interface LayoutedEvent {
  task: TaskPreview
  top: number
  height: number
  /** 0-based column index within the overlap group */
  column: number
  /** total columns in the overlap group */
  totalColumns: number
}

/**
 * Calculate the vertical position of a task within a day.
 */
function getMinuteRange(task: TaskPreview, dayStart: Date, dayEnd: Date) {
  const start = new Date(task.startDate!)
  const end = new Date(task.endDate!)

  const effectiveStart = start < dayStart ? dayStart : start
  const effectiveEnd = end > dayEnd ? dayEnd : end

  const startMin = effectiveStart.getHours() * 60 + effectiveStart.getMinutes()
  const endMin = effectiveEnd.getHours() * 60 + effectiveEnd.getMinutes()

  return { startMin, endMin: Math.max(endMin, startMin + 15) }
}

/**
 * Takes an array of tasks for a single day and returns layout info
 * with overlap columns computed (Google Calendar-style side-by-side).
 */
export function layoutDayEvents(tasks: TaskPreview[], day: Date): LayoutedEvent[] {
  const dayStart = new Date(day)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(day)
  dayEnd.setHours(23, 59, 59, 999)

  // Build positioned items
  const items = tasks
    .filter((t) => t.startDate && t.endDate)
    .map((task) => {
      const { startMin, endMin } = getMinuteRange(task, dayStart, dayEnd)
      return { task, startMin, endMin }
    })
    .sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin)

  if (items.length === 0) return []

  // Group overlapping events into clusters
  const clusters: (typeof items)[] = []
  let currentCluster = [items[0]]

  for (let i = 1; i < items.length; i++) {
    const clusterEnd = Math.max(...currentCluster.map((c) => c.endMin))
    if (items[i].startMin < clusterEnd) {
      // overlaps with current cluster
      currentCluster.push(items[i])
    } else {
      clusters.push(currentCluster)
      currentCluster = [items[i]]
    }
  }
  clusters.push(currentCluster)

  // Assign columns within each cluster
  const result: LayoutedEvent[] = []

  for (const cluster of clusters) {
    const columns: { endMin: number }[] = []

    for (const item of cluster) {
      // Find the first column where this event fits (no overlap)
      let placed = false
      for (let col = 0; col < columns.length; col++) {
        if (item.startMin >= columns[col].endMin) {
          columns[col].endMin = item.endMin
          result.push({
            task: item.task,
            top: (item.startMin / 60) * HOUR_HEIGHT,
            height: ((item.endMin - item.startMin) / 60) * HOUR_HEIGHT,
            column: col,
            totalColumns: 0 // filled below
          })
          placed = true
          break
        }
      }
      if (!placed) {
        columns.push({ endMin: item.endMin })
        result.push({
          task: item.task,
          top: (item.startMin / 60) * HOUR_HEIGHT,
          height: ((item.endMin - item.startMin) / 60) * HOUR_HEIGHT,
          column: columns.length - 1,
          totalColumns: 0
        })
      }
    }

    // Set totalColumns for all items in this cluster
    const total = columns.length
    for (const r of result) {
      if (cluster.some((c) => c.task.id === r.task.id) && r.totalColumns === 0) {
        r.totalColumns = total
      }
    }
  }

  return result
}
