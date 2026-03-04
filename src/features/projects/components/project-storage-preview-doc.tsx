import { ExternalLinkIcon, FileIcon, ImageIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface PdfPreviewProps {
  url: string
  name: string
  mimeType: string
}

export function PdfPreview({ url, name, mimeType }: PdfPreviewProps) {
  const { t } = useTranslation()
  const [show, setShow] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const isPdf = mimeType === 'application/pdf'
  const isImage = mimeType.startsWith('image/')
  const isText = mimeType === 'text/plain'
  const isWord =
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword'

  const isExcel =
    mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    mimeType === 'application/vnd.ms-excel'

  const handleMove = (e: React.MouseEvent<HTMLSpanElement>) => {
    const previewWidth = 340
    const previewHeight = 280

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

  const renderPreview = () => {
    if (isImage) {
      return <img src={url} alt={name} className='w-full h-full object-contain p-3' />
    }

    if (isPdf) {
      return (
        <iframe
          src={`${url}#toolbar=0&navpanes=0&scrollbar=0&zoom=page-width`}
          className='w-[165%] h-[165%] scale-[0.6] origin-top-left pointer-events-none'
          title={name}
        />
      )
    }

    if (isText) {
      return <iframe src={url} className='w-full h-full p-3' title={name} />
    }

    if (isWord || isExcel) {
      return (
        <iframe
          src={`https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`}
          className='w-full h-full'
          title={name}
        />
      )
    }

    return (
      <div className='flex flex-col items-center justify-center w-full h-full text-muted-foreground gap-3 bg-muted/10 p-4 text-center'>
        <FileIcon className='size-10 opacity-30 stroke-1' />
        <p className='text-[11px]'>{t('project.priviewDocument.unsupported', 'Preview not supported')}</p>
      </div>
    )
  }

  return (
    <>
      <span
        onMouseEnter={(e) => {
          handleMove(e)
          setShow(true)
        }}
        onMouseMove={handleMove}
        onMouseLeave={() => setShow(false)}
        onClick={() => window.open(url, '_blank', 'noreferrer')}
        className='group inline-flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition cursor-pointer'
      >
        <span className='truncate max-w-[160px] group-hover:underline underline-offset-2'>{name}</span>

        <ExternalLinkIcon className='size-3 opacity-0 group-hover:opacity-60 transition shrink-0' />
      </span>

      {show && (
        <div
          className='fixed z-9999 w-[340px] rounded-xl border border-border/40 bg-white shadow-2xl overflow-hidden'
          style={{
            top: position.y,
            left: position.x,
            animation: 'previewFadeIn 0.15s ease-out'
          }}
        >
          <div className='flex items-center justify-between px-3 py-2 border-b bg-muted/40'>
            <div className='flex items-center gap-2 min-w-0'>
              {isImage ? (
                <ImageIcon className='size-4 text-blue-500 shrink-0' />
              ) : (
                <FileIcon className='size-4 text-red-500 shrink-0' />
              )}
              <p className='text-xs font-medium truncate'>{name}</p>
            </div>
          </div>

          <div className='relative h-[210px] bg-white overflow-hidden'>{renderPreview()}</div>

          <div className='px-3 py-1 border-t bg-muted/20 text-[9px] text-muted-foreground flex justify-between'>
            <span>{t('project.previewDocument.preview')}</span>
            <span>{t('project.previewDocument.clickToOpen')}</span>
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
