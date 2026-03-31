import '@/components/tiptap-node/blockquote-node/blockquote-node.scss'
import '@/components/tiptap-node/code-block-node/code-block-node.scss'
import '@/components/tiptap-node/heading-node/heading-node.scss'
import '@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss'
import '@/components/tiptap-node/image-upload-node/image-upload-node.scss'
import '@/components/tiptap-node/list-node/list-node.scss'
import '@/components/tiptap-node/paragraph-node/paragraph-node.scss'

import type { MentionUser } from '@/types/user.type'
import DOMPurify from 'dompurify'
import { useMemo } from 'react'
import { useNavigate } from 'react-router'

interface SanitizedHtmlProps {
  /** The raw HTML string to be sanitized and displayed. */
  html: string
  /** Optional class names to apply to the root element. */
  className?: string
  /** Optional element type to render as (e.g., 'div', 'article'). Defaults to 'div'. */
  as?: keyof React.JSX.IntrinsicElements
  /** Optional array of users from the backend to dynamically update mentions. */
  mentionedUsers?: MentionUser[]
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
    'img',
    'span'
  ],
  // Added data-label, contenteditable, and data-mention-suggestion-char to preserve Tiptap mentions
  ALLOWED_ATTR: [
    'href',
    'target',
    'rel',
    'src',
    'alt',
    'width',
    'height',
    'class',
    'data-id',
    'data-type',
    'data-label',
    'contenteditable',
    'data-mention-suggestion-char'
  ],
  // Ensure links open in new tab for security
  ADD_ATTR: ['target'],
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
  FORBID_ATTR: ['onclick', 'onerror', 'onload']
}

export default function SanitizedHtml({
  html,
  className,
  as: Component = 'div',
  mentionedUsers = []
}: SanitizedHtmlProps) {
  const navigate = useNavigate()

  const finalHtml = useMemo(() => {
    // 1. Sanitize the raw HTML first
    const cleanHtml = DOMPurify.sanitize(html, PURIFY_CONFIG)

    // 2. If no users are passed, return the sanitized HTML immediately
    if (!mentionedUsers.length) return cleanHtml

    // 3. Parse the clean HTML to dynamically update names
    const parser = new DOMParser()
    const doc = parser.parseFromString(cleanHtml, 'text/html')
    const mentions = doc.querySelectorAll('.mention')

    mentions.forEach((mentionNode) => {
      const userId = mentionNode.getAttribute('data-id')
      const activeUser = mentionedUsers.find((u) => u.userId === userId)

      if (activeUser) {
        // Update the label attribute and the visible text content
        mentionNode.setAttribute('data-label', `${activeUser.firstName} ${activeUser.lastName}`)
        mentionNode.textContent = `@${activeUser.firstName} ${activeUser.lastName}`
      }
    })

    // 4. Return the updated HTML string
    return doc.body.innerHTML
  }, [html, mentionedUsers])

  const handleContainerClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    const mention = target.closest('.mention')

    if (mention) {
      const userId = mention.getAttribute('data-id')
      const type = mention.getAttribute('data-type')

      if (type === 'user' && userId) {
        e.preventDefault()
        e.stopPropagation()
        navigate(`/users/${userId}`)
      }
    }
  }

  const ElementType = Component as keyof React.JSX.IntrinsicElements

  if (typeof window === 'undefined') {
    return null
  }

  return (
    <ElementType
      onClick={handleContainerClick}
      className={`
        tiptap ProseMirror prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl overflow-auto
        prose-pre:whitespace-pre-wrap prose-pre:break-words wrap-break-word
        ${className ?? ''}
      `}
      dangerouslySetInnerHTML={{ __html: finalHtml }}
    />
  )
}
