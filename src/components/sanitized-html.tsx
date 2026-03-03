import '@/components/tiptap-node/blockquote-node/blockquote-node.scss'
import '@/components/tiptap-node/code-block-node/code-block-node.scss'
import '@/components/tiptap-node/heading-node/heading-node.scss'
import '@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss'
import '@/components/tiptap-node/image-upload-node/image-upload-node.scss'
import '@/components/tiptap-node/list-node/list-node.scss'
import '@/components/tiptap-node/paragraph-node/paragraph-node.scss'

import DOMPurify from 'dompurify'
import { useMemo } from 'react'

interface SanitizedHtmlProps {
  /** The raw HTML string to be sanitized and displayed. */
  html: string
  /** Optional class names to apply to the root element. */
  className?: string
  /** Optional element type to render as (e.g., 'div', 'article'). Defaults to 'div'. */
  as?: keyof React.JSX.IntrinsicElements
}

// Configuration for DOMPurify to keep the component body clean
const PURIFY_CONFIG = {
  ALLOWED_TAGS: [
    'p',
    'br',
    'strong',
    'em',
    'u',
    's',
    'code',
    'pre',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'blockquote',
    'a',
    'img'
  ],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'width', 'height', 'class'],
  // Ensure links open in new tab for security
  ADD_ATTR: ['target'],
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
  FORBID_ATTR: ['onclick', 'onerror', 'onload']
}

export default function SanitizedHtml({ html, className, as: Component = 'div' }: SanitizedHtmlProps) {
  const sanitizedHtml = useMemo(() => {
    return DOMPurify.sanitize(html, PURIFY_CONFIG)
  }, [html])

  const ElementType = Component as keyof React.JSX.IntrinsicElements

  if (typeof window === 'undefined') {
    return null
  }

  return (
    <ElementType
      className={`
        tiptap ProseMirror prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl overflow-auto
        prose-pre:whitespace-pre-wrap prose-pre:break-words wrap-break-word
        ${className ?? ''}
      `}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  )
}
