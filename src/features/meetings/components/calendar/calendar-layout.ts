import { CALENDAR_HOUR_HEIGHT as HOUR_HEIGHT } from '@/features/projects/tasks/core/constants'
import type { MeetingBooking } from '../../types'

export interface LayoutedEvent {
  meeting: MeetingBooking
  top: number
  height: number
  /** 0-based column index within the overlap group */
  column: number
  /** total columns in the overlap group */
  totalColumns: number
}

/**
 * Calculate the vertical position of a meeting within a day.
 */
function getMinuteRange(meeting: MeetingBooking, dayStart: Date, dayEnd: Date) {
  const start = new Date(meeting.startTimeUtc)
  const end = new Date(meeting.endTimeUtc)

  const effectiveStart = start < dayStart ? dayStart : start
  const startMin = effectiveStart.getHours() * 60 + effectiveStart.getMinutes()

  let endMin: number
  if (end > dayEnd) {
    // If it crosses past this day, cap its visual render at the very bottom (minute 1440)
    endMin = 24 * 60
  } else {
    // Note: if end is exactly 00:00 of the *same* day, getHours() is 0.
    // It shouldn't happen for end times normally.
    endMin = end.getHours() * 60 + end.getMinutes()
  }

  return { startMin, endMin: Math.max(endMin, startMin + 15) }
}

/**
 * Takes an array of meetings for a single day and returns layout info
 * with overlap columns computed (Google Calendar-style side-by-side).
 */
export function layoutDayEvents(meetings: MeetingBooking[], day: Date): LayoutedEvent[] {
  const dayStart = new Date(day)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(day)
  dayEnd.setHours(23, 59, 59, 999)

  // Build positioned items
  const items = meetings
    .filter((m) => m.startTimeUtc && m.endTimeUtc)
    .map((meeting) => {
      const { startMin, endMin } = getMinuteRange(meeting, dayStart, dayEnd)
      return { meeting, startMin, endMin }
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
            meeting: item.meeting,
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
          meeting: item.meeting,
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
      if (cluster.some((c) => c.meeting.id === r.meeting.id) && r.totalColumns === 0) {
        r.totalColumns = total
      }
    }
  }

  return result
}
