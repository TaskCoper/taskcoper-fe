import { ExternalLinkIcon, FileIcon, ImageIcon } from 'lucide-react'
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

  const handleMove = (e: React.MouseEvent<HTMLSpanElement>) => {
    const previewWidth = 320
    const previewHeight = 260

    let x = e.clientX + 14
    let y = e.clientY + 14

    if (x + previewWidth > window.innerWidth) {
      x = e.clientX - previewWidth - 14
    }

    if (y + previewHeight > window.innerHeight) {
      y = e.clientY - previewHeight - 14
    }

    setPosition({ x, y })
  }

  return (
    <>
      {/* File name */}
      <span
        onMouseEnter={(e) => {
          if (!canPreview) return
          handleMove(e)
          setShow(true)
        }}
        onMouseMove={handleMove}
        onMouseLeave={() => setShow(false)}
        onClick={() => window.open(url, '_blank', 'noreferrer')}
        className='group inline-flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition cursor-pointer'
      >
        <span className='truncate max-w-[160px] group-hover:underline underline-offset-2'>{name}</span>
        {canPreview && <ExternalLinkIcon className='size-3 opacity-0 group-hover:opacity-60 transition shrink-0' />}
      </span>

      {/* Preview popup */}
      {show && canPreview && (
        <div
          className='fixed z-[9999] w-[320px] rounded-xl border border-border/40 bg-white shadow-2xl overflow-hidden'
          style={{
            top: position.y,
            left: position.x,
            animation: 'previewFadeIn 0.15s ease-out'
          }}
        >
          {/* Header */}
          <div className='flex items-center justify-between px-3 py-2 border-b bg-muted/40'>
            <div className='flex items-center gap-2 min-w-0'>
              {isImage ? (
                <ImageIcon className='size-4 text-blue-500 shrink-0' />
              ) : (
                <FileIcon className='size-4 text-red-500 shrink-0' />
              )}
              <p className='text-xs font-medium truncate'>{name}</p>
            </div>

            <span className='text-[9px] font-semibold px-2 py-0.5 rounded-md bg-muted'>{isPdf ? 'PDF' : 'IMG'}</span>
          </div>

          {/* Preview Area */}
          <div className='relative h-[190px] bg-white overflow-hidden'>
            {isImage ? (
              <img src={url} alt={name} className='w-full h-full object-contain p-3' />
            ) : (
              <div className='w-full h-full overflow-hidden bg-white'>
                <iframe
                  src={`${url}#toolbar=0&navpanes=0&scrollbar=0&zoom=page-width`}
                  className='w-[165%] h-[165%] scale-[0.6] origin-top-left pointer-events-none'
                  title={name}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className='px-3 py-1 border-t bg-muted/20 text-[9px] text-muted-foreground flex justify-between'>
            <span>Preview</span>
            <span>Click to open</span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes previewFadeIn {
          from { opacity: 0; transform: translateY(4px) scale(.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  )
}
