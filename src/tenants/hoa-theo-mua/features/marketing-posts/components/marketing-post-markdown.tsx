import { cn } from '@/shared/utils'
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { useMemo } from 'react'

// Prompt là markdown do người trong đội gõ, nhưng vẫn đi qua DOMPurify: nội dung tự viết
// hôm nay thì mai đã có thể tới từ API, để hở một lần là hở luôn.
const PURIFY_CONFIG = {
  ALLOWED_TAGS: [
    'p',
    'br',
    'strong',
    'em',
    'del',
    'code',
    'pre',
    'h1',
    'h2',
    'h3',
    'h4',
    'ul',
    'ol',
    'li',
    'blockquote',
    'hr',
    'a'
  ],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
  FORBID_ATTR: ['onclick', 'onerror', 'onload']
}

// Dự án không cài @tailwindcss/typography nên style từng thẻ bằng arbitrary variant,
// khỏi phụ thuộc plugin chỉ để hiện vài đoạn prompt.
const MARKDOWN_CLASSES = [
  'text-sm leading-relaxed',
  '[&_h1]:mt-5 [&_h1]:mb-2 [&_h1]:text-base [&_h1]:font-bold',
  '[&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:text-sm [&_h2]:font-bold [&_h2]:tracking-wide [&_h2]:uppercase [&_h2]:text-muted-foreground',
  '[&_h3]:mt-4 [&_h3]:mb-1.5 [&_h3]:text-sm [&_h3]:font-semibold',
  '[&>*:first-child]:mt-0',
  '[&_p]:my-2',
  '[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5',
  '[&_li]:my-1 [&_li::marker]:text-muted-foreground',
  '[&_strong]:font-semibold [&_strong]:text-foreground',
  '[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.8em]',
  '[&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground',
  '[&_hr]:my-4 [&_hr]:border-t',
  '[&_a]:underline [&_a]:underline-offset-2'
].join(' ')

const MarketingPostMarkdown = ({ source, className }: { source: string; className?: string }) => {
  const html = useMemo(() => {
    // `marked.parse` trả Promise khi bật extension bất đồng bộ; ở đây không bật nên luôn là string
    const parsed = marked.parse(source, { async: false })

    return DOMPurify.sanitize(parsed, PURIFY_CONFIG)
  }, [source])

  return <div className={cn(MARKDOWN_CLASSES, className)} dangerouslySetInnerHTML={{ __html: html }} />
}

export default MarketingPostMarkdown
