import { cn } from '@/shared/utils'
import { useCallback, useEffect, useState } from 'react'
import { useDropzone, type DropzoneOptions } from 'react-dropzone'

interface FileDropzoneProps extends Omit<DropzoneOptions, 'onDrop'> {
  value?: File | string | null
  defaultValue?: File | string | null
  onFileChange?: (file: File | null) => void
  children?:
    | React.ReactNode
    | ((props: { file: File | string | null; preview: string | null; isDragActive: boolean }) => React.ReactNode)
  className?: string
}

export default function FileDropzone({
  value,
  defaultValue,
  onFileChange,
  children,
  className,
  ...dropzoneProps
}: FileDropzoneProps) {
  const [internalFile, setInternalFile] = useState<File | string | null>(defaultValue || null)
  const currentFile = value !== undefined ? value : internalFile

  const [blobPreview, setBlobPreview] = useState<string | null>(null)

  const preview = typeof currentFile === 'string' ? currentFile : currentFile instanceof File ? blobPreview : null

  useEffect(() => {
    if (currentFile instanceof File) {
      const objectUrl = URL.createObjectURL(currentFile)
      queueMicrotask(() => {
        setBlobPreview(objectUrl)
      })

      return () => {
        URL.revokeObjectURL(objectUrl)
        queueMicrotask(() => {
          setBlobPreview(null)
        })
      }
    } else {
      queueMicrotask(() => {
        setBlobPreview(null)
      })
    }
  }, [currentFile])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (file) {
        setInternalFile(file)
        onFileChange?.(file)
      }
    },
    [onFileChange]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    ...dropzoneProps
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        'relative cursor-pointer transition-all focus-visible:outline-none',
        isDragActive && 'ring-2 ring-primary ring-offset-2',
        className
      )}
    >
      <input {...getInputProps()} />
      {typeof children === 'function' ? children({ file: currentFile, preview, isDragActive }) : children}
    </div>
  )
}
