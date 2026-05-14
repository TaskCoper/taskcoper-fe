import type { ProjectMember } from '@/features/projects/core/types'
import { getAvatarFallback } from '@/shared/utils'
import { forwardRef, useImperativeHandle, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

export interface MentionListProps {
  items: ProjectMember[]
  command: (params: { id: string; label?: string }) => void
}

export interface MentionListRef {
  onKeyDown: (params: { event: KeyboardEvent }) => boolean
}

const MentionList = forwardRef<MentionListRef, MentionListProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Synchronize selection state with items prop without using useEffect
  // to avoid cascading renders and satisfy React lint rules.
  const [prevItems, setPrevItems] = useState(props.items)
  if (props.items !== prevItems) {
    setPrevItems(props.items)
    setSelectedIndex(0)
  }

  const selectItem = (index: number) => {
    const item = props.items[index]

    if (item) {
      props.command({ id: item.userId, label: item.fullName })
    }
  }

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
  }

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length)
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        upHandler()
        return true
      }

      if (event.key === 'ArrowDown') {
        downHandler()
        return true
      }

      if (event.key === 'Enter') {
        enterHandler()
        return true
      }

      return false
    }
  }))

  if (props.items.length === 0) {
    return null
  }

  return (
    <div className='mention-dropdown-menu'>
      {props.items.map((item, index) => (
        <button
          type='button'
          className={index === selectedIndex ? 'is-selected' : ''}
          key={item.userId}
          onMouseEnter={() => setSelectedIndex(index)}
          onMouseDown={(event) => {
            event.preventDefault()
            event.stopPropagation()
            selectItem(index)
          }}
        >
          <div className='flex items-center gap-2.5'>
            <Avatar>
              <AvatarImage src={item.avatar ?? undefined} />
              <AvatarFallback>{getAvatarFallback(item.fullName)}</AvatarFallback>
            </Avatar>
            <div className='-space-y-0.5'>
              <p className='text-sm font-medium'>{item.fullName}</p>
              <p className='text-xs text-muted-foreground'>{item.email}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
})

MentionList.displayName = 'MentionList'

export default MentionList
