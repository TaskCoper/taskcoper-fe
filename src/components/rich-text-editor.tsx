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
import type { ProjectMember } from '@/features/projects/core/types'
import projectMemberService from '@/features/projects/members/services'
import type { MentionUser } from '@/features/users/types'
import { useUploadFileWithToast } from '@/hooks/use-upload-file-with-toast'
import type { I18nKey } from '@/lib/i18n/types'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { queryKeys } from '@/lib/query-keys'
import { DEFAULT_PAGE_INDEX, MAX_UPLOAD_IMAGE_SIZE } from '@/shared/constants'
import { cn } from '@/shared/utils'
import { computePosition, flip, shift } from '@floating-ui/dom'
import { useQueryClient } from '@tanstack/react-query'
import FileHandler from '@tiptap/extension-file-handler'
import { Image } from '@tiptap/extension-image'
import Mention from '@tiptap/extension-mention'
import { Placeholder } from '@tiptap/extensions'
import {
  type Editor,
  EditorContent,
  EditorContext,
  type JSONContent,
  posToDOMRect,
  ReactRenderer,
  useEditor
} from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { MoreHorizontalIcon, PaperclipIcon } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { toast } from 'sonner'
import { useDebouncedCallback } from 'use-debounce'
import { softInsetSurfaceClasses } from '../shared/effects'
import MentionList, { type MentionListRef } from './mention-list'
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
  placeholder?: I18nKey
  onChange: (html: string) => void
  onMentionIdsChange?: (mentionIds: string[]) => void
  invalid?: boolean
  error?: { message?: string }
  projectIdentifier?: string
  mentionedUsers?: MentionUser[]
  className?: string
}

// Helper function to extract user IDs from Tiptap's JSON structure.
// Keep duplicates to preserve repeated mentions in the payload.
const extractMentionIds = (jsonNode: JSONContent): string[] => {
  const ids: string[] = []

  const traverse = (node: JSONContent) => {
    if (node.type === 'mention' && node.attrs?.id) {
      ids.push(node.attrs.id)
    }
    if (node.content && Array.isArray(node.content)) {
      node.content.forEach(traverse)
    }
  }

  traverse(jsonNode)
  return ids
}

export default function RichTextEditor({
  content,
  isDisplay = true,
  isInitialFocus = false,
  compact = false,
  onChange,
  onMentionIdsChange,
  placeholder = 'richTextEditor.placeholder',
  invalid = false,
  error,
  projectIdentifier,
  mentionedUsers = [],
  className
}: RichTextEditorProps) {
  const queryClient = useQueryClient()
  const { t, i18n } = useTenantTranslation()
  const { uploadFileWithToast } = useUploadFileWithToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const placeholderText: string = t(placeholder)

  const finalContent = useMemo(() => {
    if (!mentionedUsers.length || !content) return content

    let shouldUpdate = false
    const parser = new DOMParser()
    const doc = parser.parseFromString(content, 'text/html')
    const mentions = doc.querySelectorAll('.mention')

    mentions.forEach((mentionNode) => {
      const userId = mentionNode.getAttribute('data-id')
      const activeUser = mentionedUsers.find((u) => u.userId === userId)

      if (activeUser) {
        const newLabel = `${activeUser.firstName} ${activeUser.lastName}`
        const newText = `@${newLabel}`

        if (mentionNode.getAttribute('data-label') !== newLabel || mentionNode.textContent !== newText) {
          mentionNode.setAttribute('data-label', newLabel)
          mentionNode.textContent = newText
          shouldUpdate = true
        }
      }
    })

    return shouldUpdate ? doc.body.innerHTML : content
  }, [content, mentionedUsers])

  const debouncedMembers = useDebouncedCallback(async (query: string, resolve: (items: ProjectMember[]) => void) => {
    try {
      const parsedQuery = query || undefined
      const result = await queryClient.fetchQuery({
        queryKey: queryKeys.projects.members.list({
          identifier: projectIdentifier,
          searchTerm: parsedQuery,
          pageIndex: 1,
          pageSize: 5
        }),
        queryFn: () =>
          projectMemberService.getProjectMembers({
            identifier: projectIdentifier,
            searchTerm: parsedQuery,
            pageIndex: DEFAULT_PAGE_INDEX,
            pageSize: 5
          })
      })
      resolve(result.value.items)
    } catch {
      resolve([])
    }
  }, 300)

  const getMentionItems = useCallback(
    ({ query }: { query: string }) => {
      return new Promise<ProjectMember[]>((resolve) => {
        debouncedMembers(query, resolve)
      })
    },
    [debouncedMembers]
  )

  const updatePosition = (editor: Editor, element: HTMLElement) => {
    const virtualElement = {
      getBoundingClientRect: () => posToDOMRect(editor.view, editor.state.selection.from, editor.state.selection.to)
    }

    computePosition(virtualElement, element, {
      placement: 'bottom-start',
      strategy: 'absolute',
      middleware: [shift(), flip()]
    }).then(({ x, y, strategy }) => {
      element.style.width = 'max-content'
      element.style.position = strategy
      element.style.left = `${x}px`
      element.style.top = `${y}px`
    })
  }

  const handleUploadAndInsertFile = useCallback(
    async (editor: Editor, file: File, pos?: number) => {
      await uploadFileWithToast({
        file,
        renderProgress: (progress) => (
          <div className='w-72 space-y-1'>
            <Progress value={progress} className='w-full' />
            <p className='text-xs text-muted-foreground'>{progress}%</p>
          </div>
        ),
        onUploaded: (url) => {
          const insertPos = pos ?? editor.state.selection.anchor
          const isImage = file.type.startsWith('image/')

          if (isImage) {
            editor
              .chain()
              .insertContentAt(insertPos, {
                type: 'image',
                attrs: { src: url }
              })
              .focus()
              .run()
            return
          }

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
      })
    },
    [uploadFileWithToast]
  )

  const extensions = useMemo(
    () => [
      StarterKit,
      Image,
      Mention.extend({
        parseHTML() {
          return [
            {
              tag: 'span[data-type="user"]'
            },
            {
              tag: `span[data-type="${this.name}"]`
            }
          ]
        }
      }).configure({
        HTMLAttributes: {
          class: 'mention',
          'data-type': 'user',
          contenteditable: 'false'
        },
        suggestion: {
          items: getMentionItems,
          render: () => {
            let component: ReactRenderer | null = null

            return {
              onStart: (props) => {
                if (component) {
                  component.element.remove()
                  component.destroy()
                }

                component = new ReactRenderer(MentionList, {
                  props,
                  editor: props.editor
                })

                if (!props.clientRect) {
                  return
                }

                component.element.style.position = 'absolute'
                component.element.style.zIndex = '9999'
                component.element.style.pointerEvents = 'auto'

                document.body.appendChild(component.element)

                updatePosition(props.editor, component.element)
              },

              onUpdate(props) {
                if (!component) return
                // Restore display in case it was hidden by Escape
                component.element.style.display = ''
                component.updateProps(props)

                if (!props.clientRect) {
                  return
                }

                updatePosition(props.editor, component.element)
              },

              onKeyDown(props) {
                if (props.event.key === 'Escape') {
                  if (component) {
                    component.element.style.display = 'none'
                  }
                  return true
                }

                return (component?.ref as MentionListRef)?.onKeyDown(props) || false
              },

              onExit() {
                if (component) {
                  component.element.remove()
                  component.destroy()
                  component = null
                }
              }
            }
          }
        }
      }),
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
          const url = await uploadFileWithToast({
            file,
            renderProgress: (progress) => (
              <div className='w-72 space-y-1'>
                <Progress value={progress} className='w-full' />
                <p className='text-xs text-muted-foreground'>{progress}%</p>
              </div>
            )
          })

          return url ?? ''
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
    [getMentionItems, handleUploadAndInsertFile, placeholderText, uploadFileWithToast]
  )

  const editor = useEditor(
    {
      extensions: extensions,
      editorProps: {
        attributes: {
          class: cn(
            'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl p-4 min-h-48 max-h-96 overflow-auto',
            className
          )
        }
      },
      content: finalContent,
      onUpdate: ({ editor }) => {
        // Extract the current HTML string
        const currentHtml = editor.isEmpty || editor.getHTML() === '<p></p>' ? '' : editor.getHTML()

        // Extract unique user IDs from the underlying JSON structure
        const mentionIds = extractMentionIds(editor.getJSON())

        // Pass both back to the parent component
        onChange(currentHtml)
        onMentionIdsChange?.(mentionIds)
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
    if (editor && finalContent !== editor.getHTML()) {
      editor.commands.setContent(finalContent)
    }
  }, [finalContent, editor])

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
              'border bg-background focus-within:ring-2',
              invalid ? 'border-destructive focus-within:ring-destructive' : 'border-border focus-within:ring-primary',
              softInsetSurfaceClasses
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
                  />

                  <div className='w-px h-6 bg-border' />

                  <div className='flex gap-0.5'>
                    {/* Links */}
                    <LinkPopover editor={editor} hideWhenUnavailable={true} autoOpenOnLinkActive={true} />

                    {/* Images */}
                    <ImageUploadButton editor={editor} hideWhenUnavailable={true} />

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
                    <CodeBlockButton editor={editor} hideWhenUnavailable={true} />
                  </div>
                </>
              )}
            </div>
            <EditorContent editor={editor} />
          </div>
        </EditorContext.Provider>

        {invalid && error && <div className='min-h-4'>{<FieldError className='text-xs' errors={[error]} />}</div>}
      </div>
    )
  }
}
