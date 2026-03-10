import '@/components/tiptap-node/blockquote-node/blockquote-node.scss'
import '@/components/tiptap-node/code-block-node/code-block-node.scss'
import '@/components/tiptap-node/heading-node/heading-node.scss'
import '@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss'
import '@/components/tiptap-node/image-node/image-node.scss'
import '@/components/tiptap-node/image-upload-node/image-upload-node.scss'
import '@/components/tiptap-node/list-node/list-node.scss'
import '@/components/tiptap-node/paragraph-node/paragraph-node.scss'

import { BlockquoteButton } from '@/components/tiptap-ui/blockquote-button'
import { CodeBlockButton } from '@/components/tiptap-ui/code-block-button'
import { HeadingDropdownMenu } from '@/components/tiptap-ui/heading-dropdown-menu'
import { ImageUploadButton } from '@/components/tiptap-ui/image-upload-button'
import { LinkPopover } from '@/components/tiptap-ui/link-popover'
import { ListDropdownMenu } from '@/components/tiptap-ui/list-dropdown-menu'
import { MarkButton } from '@/components/tiptap-ui/mark-button'
import { FieldError } from '@/components/ui/field'
import { useUploadFile } from '@/hooks/use-upload-file'
import type { ErrorResponse } from '@/lib/axios'
import { MAX_UPLOAD_IMAGE_SIZE } from '@/shared/constants'
import { cn } from '@/shared/utils'
import FileHandler from '@tiptap/extension-file-handler'
import { Image } from '@tiptap/extension-image'
import { Placeholder } from '@tiptap/extensions'
import type { Editor } from '@tiptap/react'
import { EditorContent, EditorContext, useEditor } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import type { AxiosError } from 'axios'
import { MoreHorizontalIcon, PaperclipIcon } from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ImageUploadNode } from './tiptap-node/image-upload-node'
import { Button } from './tiptap-ui-primitive/button'
import { Card, CardBody } from './tiptap-ui-primitive/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './tiptap-ui-primitive/dropdown-menu'
import { Progress } from './ui/progress'

interface RichTextEditorProps {
  isDisplay?: boolean
  isInitialFocus?: boolean
  compact?: boolean
  content: string
  placeholder?: string
  onChange: (html: string) => void
  invalid?: boolean
  error?: { message?: string }
}

export default function RichTextEditor({
  content,
  isDisplay = true,
  isInitialFocus = false,
  compact = false,
  onChange,
  placeholder = 'richTextEditor.placeholder',
  invalid = false,
  error
}: RichTextEditorProps) {
  const { t, i18n } = useTranslation()
  const { uploadFileAsync } = useUploadFile()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const placeholderText = t(placeholder)

  const handleUploadAndInsertFile = useCallback(
    async (editor: Editor, file: File, pos?: number) => {
      const toastId = toast.loading(t('common.ui.uploading'), {
        description: t('common.ui.pleaseWait')
      })

      try {
        const url = await uploadFileAsync({
          file,
          onProgress: (progress) => {
            toast.loading(t('common.ui.uploading'), {
              id: toastId,
              description: (
                <div className='w-full min-w-72 space-y-1'>
                  <Progress value={progress} className='w-full' />
                  <p className='text-xs text-muted-foreground'>{progress}%</p>
                </div>
              )
            })
          }
        })

        if (url) {
          toast.success(t('common.ui.uploadSuccess'), {
            id: toastId,
            description: null
          })

          const insertPos = pos ?? editor.state.selection.anchor
          const isImage = file.type.startsWith('image/')

          if (isImage) {
            // Insert as image
            editor
              .chain()
              .insertContentAt(insertPos, {
                type: 'image',
                attrs: { src: url }
              })
              .focus()
              .run()
          } else {
            // Insert as link with filename
            editor
              .chain()
              .insertContentAt(insertPos, {
                type: 'text',
                text: file.name,
                marks: [
                  {
                    type: 'link',
                    attrs: { href: url, target: '_blank' }
                  }
                ]
              })
              .focus()
              .run()
          }
        } else {
          toast.dismiss(toastId)
        }
      } catch (error) {
        toast.error(t('error.somethingWentWrong'), {
          id: toastId,
          description: (error as AxiosError<ErrorResponse>).response?.data?.detail
        })
      }
    },
    [t, uploadFileAsync]
  )

  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        Image,
        FileHandler.configure({
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
          onDrop: (currentEditor, files, pos) => {
            files.forEach((file) => {
              handleUploadAndInsertFile(currentEditor, file, pos)
            })
          },
          onPaste: (currentEditor, files, htmlContent) => {
            if (htmlContent) {
              // if there is htmlContent, let other extensions handle insertion via inputRule
              return false
            }
            files.forEach((file) => {
              handleUploadAndInsertFile(currentEditor, file)
            })
          }
        }),
        ImageUploadNode.configure({
          accept: 'image/*',
          maxSize: MAX_UPLOAD_IMAGE_SIZE,
          limit: 1,
          upload: async (file) => {
            const toastId = toast.loading(t('common.ui.uploading'), {
              description: t('common.ui.pleaseWait')
            })

            try {
              const url = await uploadFileAsync({
                file,
                onProgress: (progress) => {
                  toast.loading(t('common.ui.uploading'), {
                    id: toastId,
                    description: (
                      <div className='w-full min-w-72 space-y-1'>
                        <Progress value={progress} className='w-full' />
                        <p className='text-xs text-muted-foreground'>{progress}%</p>
                      </div>
                    )
                  })
                }
              })

              if (url) {
                toast.success(t('common.ui.uploadSuccess'), {
                  id: toastId,
                  description: null
                })
                return url
              }

              toast.dismiss(toastId)
              return ''
            } catch (error) {
              toast.error(t('error.somethingWentWrong'), {
                id: toastId,
                description: (error as AxiosError<ErrorResponse>).response?.data?.detail
              })
              return ''
            }
          },
          onError: (error) => {
            if (error instanceof Error) {
              toast.error(error.message)
            }
          }
        }),
        Placeholder.configure({
          placeholder: ({ editor }) => {
            if (editor.isEmpty) {
              return placeholderText
            }
            return ''
          },
          emptyEditorClass: 'is-editor-empty'
        })
      ],
      editorProps: {
        attributes: {
          class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl p-4 min-h-48 max-h-96 overflow-auto'
        }
      },
      content,
      onUpdate: ({ editor }) => {
        if (editor.isEmpty || editor.getHTML() === '<p></p>') {
          onChange('')
        } else {
          onChange(editor.getHTML())
        }
      },
      // Don't render immediately on the server to avoid SSR issues
      immediatelyRender: false
    },
    [i18n.language, placeholderText]
  )

  useEffect(() => {
    if (isDisplay && isInitialFocus && editor) {
      setTimeout(() => {
        editor.commands.focus('end')
      }, 0)
    }
  }, [isDisplay, isInitialFocus, editor])

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editor || !e.target.files) return

    const files = Array.from(e.target.files)
    files.forEach((file) => {
      handleUploadAndInsertFile(editor, file)
    })

    // Reset the input so the same file can be selected again
    e.target.value = ''
  }

  if (isDisplay && editor) {
    return (
      <div className='space-y-1'>
        <EditorContext.Provider value={{ editor }}>
          <div
            className={cn(
              'rounded-md border bg-background shadow-xs focus-within:ring-2',
              invalid ? 'border-destructive focus-within:ring-destructive' : 'border-border focus-within:ring-primary'
            )}
          >
            <div className='p-2 flex gap-2 border-b items-center flex-wrap'>
              {compact ? (
                // Compact toolbar for narrow spaces
                <>
                  <HeadingDropdownMenu
                    editor={editor}
                    levels={[1, 2, 3, 4, 5, 6]}
                    hideWhenUnavailable={true}
                    portal={false}
                  />

                  <div className='w-px h-6 bg-border' />

                  <div className='flex gap-0.5'>
                    <MarkButton type='bold' />
                    <MarkButton type='italic' />
                  </div>

                  <div className='w-px h-6 bg-border' />

                  <div className='flex gap-0.5'>
                    <LinkPopover editor={editor} hideWhenUnavailable={true} autoOpenOnLinkActive={true} />

                    <ImageUploadButton editor={editor} hideWhenUnavailable={true} />

                    <Button
                      type='button'
                      data-style='ghost'
                      className='size-8'
                      onClick={() => fileInputRef.current?.click()}
                      title={t('richTextEditor.attachFile')}
                    >
                      <PaperclipIcon className='size-4' />
                    </Button>
                    <input
                      ref={fileInputRef}
                      type='file'
                      multiple
                      className='hidden'
                      onChange={handleFileInputChange}
                    />
                  </div>

                  <div className='w-px h-6 bg-border' />

                  <ListDropdownMenu
                    editor={editor}
                    types={['bulletList', 'orderedList']}
                    hideWhenUnavailable={true}
                    portal={false}
                  />

                  <div className='w-px h-6 bg-border' />

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type='button' data-style='ghost' title={t('common.ui.more')}>
                        <MoreHorizontalIcon className='tiptap-button-icon' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end' sideOffset={8} className='min-w-0'>
                      <Card>
                        <CardBody className='flex flex-col gap-1'>
                          <MarkButton type='strike' text={t('richTextEditor.strikethrough')} />
                          <MarkButton type='code' text={t('richTextEditor.inlineCode')} />
                          <BlockquoteButton editor={editor} text={t('richTextEditor.blockquote.label')} />
                          <CodeBlockButton
                            editor={editor}
                            hideWhenUnavailable={true}
                            text={t('richTextEditor.codeBlock.label')}
                          />
                        </CardBody>
                      </Card>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                // Full toolbar
                <>
                  {/* Headings */}
                  <HeadingDropdownMenu
                    editor={editor}
                    levels={[1, 2, 3, 4, 5, 6]}
                    hideWhenUnavailable={true}
                    portal={false}
                    onOpenChange={(isOpen) => console.log('Dropdown', isOpen ? 'opened' : 'closed')}
                  />

                  <div className='w-px h-6 bg-border' />

                  {/* Marks */}
                  <div className='flex gap-0.5'>
                    <MarkButton type='bold' />
                    <MarkButton type='italic' />
                    <MarkButton type='strike' />
                    <MarkButton type='code' />
                  </div>

                  <div className='w-px h-6 bg-border' />

                  {/* Lists */}
                  <ListDropdownMenu
                    editor={editor}
                    types={['bulletList', 'orderedList']}
                    hideWhenUnavailable={true}
                    portal={false}
                    onOpenChange={(isOpen) => console.log('Dropdown opened:', isOpen)}
                  />

                  <div className='w-px h-6 bg-border' />

                  <div className='flex gap-0.5'>
                    {/* Links */}
                    <LinkPopover
                      editor={editor}
                      hideWhenUnavailable={true}
                      autoOpenOnLinkActive={true}
                      onSetLink={() => console.log('Link set!')}
                      onOpenChange={(isOpen) => console.log('Popover opened:', isOpen)}
                    />

                    {/* Images */}
                    <ImageUploadButton
                      editor={editor}
                      hideWhenUnavailable={true}
                      onInserted={() => console.log('Image inserted!')}
                    />

                    {/* File Attachments */}
                    <Button
                      type='button'
                      data-style='ghost'
                      className='size-8'
                      onClick={() => fileInputRef.current?.click()}
                      title={t('richTextEditor.attachFile')}
                    >
                      <PaperclipIcon className='size-4' />
                    </Button>
                    <input
                      ref={fileInputRef}
                      type='file'
                      multiple
                      className='hidden'
                      onChange={handleFileInputChange}
                    />
                  </div>

                  <div className='w-px h-6 bg-border' />

                  <div className='flex gap-0.5'>
                    {/* Blockquotes */}
                    <BlockquoteButton editor={editor} />

                    {/* Code blocks */}
                    <CodeBlockButton
                      editor={editor}
                      hideWhenUnavailable={true}
                      onToggled={() => console.log('Code block toggled!')}
                    />
                  </div>
                </>
              )}
            </div>
            <EditorContent editor={editor} />
          </div>
        </EditorContext.Provider>

        <div className='min-h-4'>{invalid && error && <FieldError className='text-xs' errors={[error]} />}</div>
      </div>
    )
  }
}
