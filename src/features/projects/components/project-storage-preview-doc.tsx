import { useState } from 'react'

interface PdfPreviewProps {
  url: string
  name: string
  mimeType: string
}

export function PdfPreview({ url, name, mimeType }: PdfPreviewProps) {
  const [show, setShow] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const isPdf = mimeType === 'application/pdf'
  const isImage = mimeType.startsWith('image/')
  const canPreview = isPdf || isImage

  return (
    <>
      <span
        onMouseEnter={(e) => {
          setShow(true)
          setPosition({
            x: e.clientX,
            y: e.clientY
          })
        }}
        onMouseMove={(e) => {
          setPosition({
            x: e.clientX,
            y: e.clientY
          })
        }}
        onMouseLeave={() => setShow(false)}
        className='font-medium text-sm hover:underline cursor-pointer'
      >
        {name}
      </span>

      {show && canPreview && (
        <div
          className='
            fixed z-[9999]
            w-[400px] h-[300px]
            border bg-white shadow-2xl rounded-md overflow-hidden
            transition-all duration-200 ease-out
            animate-in fade-in zoom-in-95
          '
          style={{
            top: position.y + 20,
            left: position.x + 20
          }}
        >
          {isImage ? (
            <img src={url} alt={name} className='w-full h-full object-contain' />
          ) : (
            <iframe src={`${url}#toolbar=0`} className='w-full h-full' title={name} />
          )}
        </div>
      )}
    </>
  )
}
