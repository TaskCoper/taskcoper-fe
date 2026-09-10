import '@/components/tiptap-node/blockquote-node/blockquote-node.scss'
import '@/components/tiptap-node/code-block-node/code-block-node.scss'
import '@/components/tiptap-node/heading-node/heading-node.scss'
import '@/components/tiptap-node/list-node/list-node.scss'
import '@/components/tiptap-node/paragraph-node/paragraph-node.scss'

import { BlockquoteButton } from '@/components/tiptap-ui/blockquote-button'
import { CodeBlockButton } from '@/components/tiptap-ui/code-block-button'
import { HeadingDropdownMenu } from '@/components/tiptap-ui/heading-dropdown-menu'
import { ListDropdownMenu } from '@/components/tiptap-ui/list-dropdown-menu'
import { MarkButton } from '@/components/tiptap-ui/mark-button'
import { Placeholder } from '@tiptap/extensions'
import { EditorContent, EditorContext, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { useEffect } from 'react'
import { cn } from '@/shared/utils'

interface SystemPromptEditorProps {
  content: string
  onChange: (html: string) => void
  className?: string
}

export default function SystemPromptEditor({ content, onChange, className }: SystemPromptEditorProps) {
  const { t } = useTenantTranslation()
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: t('systemPrompts.edit.placeholder')
      })
    ],
    content,
    onUpdate: ({ editor: updatedEditor }) => {
      const html = updatedEditor.isEmpty || updatedEditor.getHTML() === '<p></p>' ? '' : updatedEditor.getHTML()
      onChange(html)
    },
    editorProps: {
      attributes: {
        class: cn('tiptap prose prose-sm min-h-72 max-h-[min(52vh,32rem)] max-w-none overflow-auto p-4', className)
      }
    },
    immediatelyRender: false
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) return null

  return (
    <EditorContext.Provider value={{ editor }}>
      <div className='overflow-hidden rounded-lg border bg-background'>
        <div className='flex flex-wrap items-center gap-2 border-b p-2'>
          <HeadingDropdownMenu editor={editor} levels={[1, 2, 3, 4, 5, 6]} hideWhenUnavailable={true} portal={false} />
          <div className='h-6 w-px bg-border' />
          <div className='flex gap-0.5'>
            <MarkButton type='bold' />
            <MarkButton type='italic' />
            <MarkButton type='strike' />
            <MarkButton type='code' />
          </div>
          <div className='h-6 w-px bg-border' />
          <ListDropdownMenu
            editor={editor}
            types={['bulletList', 'orderedList']}
            hideWhenUnavailable={true}
            portal={false}
          />
          <div className='h-6 w-px bg-border' />
          <BlockquoteButton editor={editor} />
          <CodeBlockButton editor={editor} hideWhenUnavailable={true} />
        </div>
        <EditorContent editor={editor} />
      </div>
    </EditorContext.Provider>
  )
}
