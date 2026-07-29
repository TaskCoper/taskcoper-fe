import { Checkbox } from '@/components/ui/checkbox'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { ChevronRightIcon, FolderIcon, FolderOpenIcon, TagIcon } from 'lucide-react'
import { useState } from 'react'
import { CategoryProductType } from '../types'
import { CategoryTypeBadge, CategoryWindow } from './category-product-badges'
import type { CategoryTreeLikeNode } from './category-tree-picker'

interface CategoryTreeMultiPickerProps {
  categories: CategoryTreeLikeNode[]
  selectedIds: Set<string>
  onToggle: (categoryId: string) => void
  t: TenantT
  emptyLabel: string
  isLoading?: boolean
}

/** Same tree visuals as `CategoryTreePicker` (connector lines, folder/tag icons, campaign window + badge), but
 * multi-select via checkboxes instead of a single active selection. Meant to sit inside a `PopoverContent`. */
export default function CategoryTreeMultiPicker({
  categories,
  selectedIds,
  onToggle,
  t,
  emptyLabel,
  isLoading
}: CategoryTreeMultiPickerProps) {
  // Nodes start collapsed; the set holds only the IDs the user has explicitly expanded.
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const effectiveExpandedIds = expandedIds

  const toggleExpanded = (categoryId: string) =>
    setExpandedIds((previous) => {
      const next = new Set(previous)
      if (next.has(categoryId)) next.delete(categoryId)
      else next.add(categoryId)
      return next
    })

  return (
    <div className='max-h-[calc(var(--radix-popover-content-available-height)-8px)] overflow-y-auto'>
      <div className='space-y-1 p-1'>
        {categories.length === 0 && !isLoading ? (
          <p className='px-2 py-3 text-center text-xs text-muted-foreground'>{emptyLabel}</p>
        ) : (
          categories.map((category, index) => (
            <CategoryTreeMultiNode
              key={category.categoryId}
              category={category}
              isLast={index === categories.length - 1}
              ancestorLines={[]}
              depth={0}
              selectedIds={selectedIds}
              expandedIds={effectiveExpandedIds}
              onToggleExpand={toggleExpanded}
              onToggle={onToggle}
              t={t}
            />
          ))
        )}
      </div>
    </div>
  )
}

interface CategoryTreeMultiNodeProps {
  category: CategoryTreeLikeNode
  /** Whether this node is the last child among its siblings - decides the connector's shape (└ vs ├). */
  isLast: boolean
  /** For each ancestor depth, whether that ancestor's guide column still has a line running through it. */
  ancestorLines: boolean[]
  /** 0 for top-level nodes - they render no guide column of their own (the outermost line is omitted entirely). */
  depth: number
  selectedIds: Set<string>
  expandedIds: Set<string>
  onToggleExpand: (categoryId: string) => void
  onToggle: (categoryId: string) => void
  t: TenantT
}

/** One row of the category tree plus its (recursively rendered) children, when expanded. */
function CategoryTreeMultiNode({
  category,
  isLast,
  ancestorLines,
  depth,
  selectedIds,
  expandedIds,
  onToggleExpand,
  onToggle,
  t
}: CategoryTreeMultiNodeProps) {
  const children = category.children ?? []
  const hasChildren = children.length > 0
  const isExpanded = expandedIds.has(category.categoryId)
  const name = category.name?.trim()
  const isSelected = selectedIds.has(category.categoryId)

  // The node's own guide column doubles as its expand/collapse toggle (when it has children), instead of
  // reserving a separate column for each - that extra column per expandable ancestor is what made deep
  // trees run out of horizontal room fastest.
  const ownColumn = hasChildren ? (
    <button
      type='button'
      onClick={() => onToggleExpand(category.categoryId)}
      aria-label={t(isExpanded ? 'productCategories.tree.collapse' : 'productCategories.tree.expand')}
      className='relative flex w-4 shrink-0 items-center justify-center rounded text-muted-foreground cursor-pointer'
    >
      {depth > 0 && (
        <span
          className={cn('absolute left-1/2 top-0 w-px -translate-x-1/2 bg-border', isLast ? 'h-1/2' : '-bottom-1')}
        />
      )}
      <ChevronRightIcon
        className={cn('relative size-4 rounded bg-popover transition-transform', isExpanded && 'rotate-90')}
      />
    </button>
  ) : depth > 0 ? (
    <div className='relative w-4 shrink-0'>
      <span className={cn('absolute left-1/2 top-0 w-px -translate-x-1/2 bg-border', isLast ? 'h-1/2' : '-bottom-1')} />
      <span className='absolute left-1/2 top-1/2 h-px w-1/2 -translate-y-1/2 bg-border' />
    </div>
  ) : null

  const guides = (
    <>
      {ancestorLines.map((showLine, index) => (
        <div key={index} className='relative w-4 shrink-0'>
          {showLine && <span className='absolute -bottom-1 left-1/2 top-0 w-px -translate-x-1/2 bg-border' />}
        </div>
      ))}
      {ownColumn}
    </>
  )

  const icon = hasChildren ? (
    isExpanded ? (
      <FolderOpenIcon className='size-4 shrink-0 text-muted-foreground' />
    ) : (
      <FolderIcon className='size-4 shrink-0 text-muted-foreground' />
    )
  ) : (
    <TagIcon className='size-4 shrink-0 text-muted-foreground' />
  )

  return (
    <div className='space-y-1'>
      <div className='flex h-8 items-stretch'>
        {guides}
        <button
          type='button'
          onClick={() => onToggle(category.categoryId)}
          className={cn(
            'cursor-pointer flex min-w-0 flex-1 items-center gap-1.5 rounded-xl px-1.5 text-sm hover:bg-accent',
            isSelected && 'bg-accent font-medium'
          )}
        >
          <Checkbox checked={isSelected} className='pointer-events-none shrink-0' />
          {icon}
          <span className='min-w-0 truncate'>{name || t('productCategories.column.noName')}</span>
          {category.type === CategoryProductType.Campaign && (
            <span className='ml-auto flex shrink-0 items-center gap-1.5 pl-1.5'>
              <CategoryWindow category={category} t={t} />
              <CategoryTypeBadge type={category.type} t={t} />
            </span>
          )}
        </button>
      </div>

      {hasChildren && isExpanded && (
        <div className='space-y-1'>
          {children.map((child, index) => (
            <CategoryTreeMultiNode
              key={child.categoryId}
              category={child}
              isLast={index === children.length - 1}
              ancestorLines={depth === 0 ? ancestorLines : [...ancestorLines, !isLast]}
              depth={depth + 1}
              selectedIds={selectedIds}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              onToggle={onToggle}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  )
}
