import { useCallback, useMemo, useState } from 'react'

type ClickType = 'single' | 'double'

interface UseInlineEditOptions {
  initialValue: string
  onSave: (value: string) => void
  clickType?: ClickType
  allowEmpty?: boolean
}

export const useInlineEdit = ({
  initialValue,
  onSave,
  clickType = 'single',
  allowEmpty = false
}: UseInlineEditOptions) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(initialValue)

  const startEditing = useCallback(() => {
    setIsEditing(true)
    setEditValue(initialValue)
  }, [initialValue])

  const cancelEditing = useCallback(() => {
    setEditValue(initialValue)
    setIsEditing(false)
  }, [initialValue])

  const completeEditing = useCallback(() => {
    const trimmedValue = editValue.trim()
    const nextValue = trimmedValue

    if ((allowEmpty || trimmedValue) && nextValue !== initialValue) {
      onSave(nextValue)
    }

    setIsEditing(false)
  }, [allowEmpty, editValue, initialValue, onSave])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      // Prevent arrow keys and other keys from propagating
      e.stopPropagation()

      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        completeEditing()
      } else if (e.key === 'Escape') {
        cancelEditing()
      }
    },
    [completeEditing, cancelEditing]
  )

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditValue(e.target.value)
  }, [])

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.select()
  }, [])

  // can be used with spreading ... for convenience
  const triggerProps = useMemo(() => {
    if (clickType === 'double') {
      return { onDoubleClick: startEditing }
    }
    return { onClick: startEditing }
  }, [clickType, startEditing])

  const inputProps = useMemo(
    () => ({
      value: editValue,
      onChange: handleChange,
      onBlur: completeEditing,
      onKeyDown: handleKeyDown,
      onFocus: handleFocus,
      autoFocus: true
    }),
    [editValue, handleChange, completeEditing, handleKeyDown, handleFocus]
  )

  return {
    isEditing,
    editValue,
    setEditValue,
    startEditing,
    cancelEditing,
    completeEditing,
    handleKeyDown,
    handleChange,
    handleFocus,
    triggerProps,
    inputProps
  }
}
