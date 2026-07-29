import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { CheckIcon, ChevronRightIcon, ChevronsUpDownIcon, FolderIcon, FolderOpenIcon, TagIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { CategoryProductType } from '../types'
import { CategoryTypeBadge, CategoryWindow } from './category-product-badges'

/** The minimal shape a tree needs to render in the picker — satisfied by both `Category` and `SortableCategory`. */
export interface CategoryTreeLikeNode {
  categoryId: string
  name: string
  type: CategoryProductType
  startTime: string | null
  endTime: string | null
  children?: CategoryTreeLikeNode[] | null
}

export interface CategoryTreeRootOption {
  icon: ReactNode
  label: string
}

const findCategoryName = (categories: CategoryTreeLikeNode[], categoryId: string): string | null => {
  for (const category of categories) {
    if (category.categoryId === categoryId) return category.name
    const found = findCategoryName(category.children ?? [], categoryId)
    if (found) return found
  }
  return null
}

/** Drops excluded nodes — and their whole subtree — from the tree, e.g. a category can't parent itself or a descendant. */
const pruneExcluded = (categories: CategoryTreeLikeNode[], excludeIds: Set<string>): CategoryTreeLikeNode[] =>
  categories
    .filter((category) => !excludeIds.has(category.categoryId))
    .map((category) =>
      category.children?.length ? { ...category, children: pruneExcluded(category.children, excludeIds) } : category
    )

interface CategoryTreePickerProps {
  categories: CategoryTreeLikeNode[]
  value: string | null
  onChange: (categoryId: string | null) => void
  t: TenantT
  emptyLabel: string
  disabled?: boolean
  isLoading?: boolean
  /** Ids to hide entirely (with their descendants) — e.g. a category being edited can't become its own parent. */
  excludeIds?: Set<string>
  /** A pinned first row selecting `null` — e.g. "All (global)" or "No parent". */
  rootOption?: CategoryTreeRootOption
  triggerId?: string
  invalid?: boolean
}

/** A popover combobox over the category tree: connector lines, folder/tag icons, expand/collapse, campaign window + badge. */
export default function CategoryTreePicker({
  categories,
  value,
  onChange,
  t,
  emptyLabel,
  disabled,
  isLoading,
  excludeIds,
  rootOption,
  triggerId,
  invalid
}: CategoryTreePickerProps) {
  const [open, setOpen] = useState(false)
  // Nodes start collapsed; the set holds only the IDs the user has explicitly expanded.
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const visibleCategories = excludeIds ? pruneExcluded(categories, excludeIds) : categories
  const effectiveExpandedIds = expandedIds

  const toggleExpanded = (categoryId: string) =>
    setExpandedIds((previous) => {
      const next = new Set(previous)
      if (next.has(categoryId)) next.delete(categoryId)
      else next.add(categoryId)
      return next
    })

  const handleSelect = (categoryId: string | null) => {
    onChange(categoryId)
    setOpen(false)
  }

  const selectedLabel = value ? (findCategoryName(visibleCategories, value) ?? value) : (rootOption?.label ?? '')

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          id={triggerId}
          type='button'
          variant='outline'
          role='combobox'
          aria-expanded={open}
          aria-invalid={invalid}
          disabled={disabled || isLoading}
          className='h-9 w-full justify-between px-2 py-2 font-normal'
        >
          <span className='truncate'>{selectedLabel}</span>
          <ChevronsUpDownIcon className='size-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>

      <PopoverContent align='start' sideOffset={8} className='w-96 min-w-(--radix-popover-trigger-width) p-1'>
        <div className='max-h-[calc(var(--radix-popover-content-available-height)-8px)] overflow-y-auto'>
          <div className='space-y-1'>
            {rootOption && (
              <TreeRow
                icon={rootOption.icon}
                label={rootOption.label}
                isSelected={value === null}
                onSelect={() => handleSelect(null)}
              />
            )}

            {visibleCategories.length === 0 && !isLoading ? (
              <p className='px-2 py-3 text-center text-xs text-muted-foreground'>{emptyLabel}</p>
            ) : (
              visibleCategories.map((category, index) => (
                <CategoryTreeNode
                  key={category.categoryId}
                  category={category}
                  isLast={index === visibleCategories.length - 1}
                  ancestorLines={[]}
                  depth={0}
                  selectedValue={value}
                  expandedIds={effectiveExpandedIds}
                  onToggleExpand={toggleExpanded}
                  onSelect={handleSelect}
                  t={t}
                />
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

interface TreeRowProps {
  icon: ReactNode
  label: string
  isSelected: boolean
  onSelect: () => void
  guides?: ReactNode
  meta?: ReactNode
}

/** A single selectable row: optional tree guides/toggle up front, then icon + label + meta + check. */
function TreeRow({ icon, label, isSelected, onSelect, guides, meta }: TreeRowProps) {
  return (
    <div className='flex h-8 items-stretch'>
      {guides}
      <button
        type='button'
        onClick={onSelect}
        className={cn(
          'cursor-pointer flex min-w-0 flex-1 items-center gap-1.5 rounded-xl px-1.5 text-sm hover:bg-accent',
          isSelected && 'bg-accent font-medium'
        )}
      >
        {icon}
        <span className='min-w-0 truncate'>{label}</span>
        {meta && <span className='ml-auto flex shrink-0 items-center gap-1.5 pl-1.5'>{meta}</span>}
        <CheckIcon
          className={cn(
            'size-4 shrink-0 text-primary',
            meta ? '' : 'ml-auto',
            isSelected ? 'opacity-100' : 'opacity-0'
          )}
        />
      </button>
    </div>
  )
}

interface CategoryTreeNodeProps {
  category: CategoryTreeLikeNode
  /** Whether this node is the last child among its siblings - decides the connector's shape (└ vs ├). */
  isLast: boolean
  /** For each ancestor depth, whether that ancestor's guide column still has a line running through it. */
  ancestorLines: boolean[]
  /** 0 for top-level nodes - they render no guide column of their own (the outermost line is omitted entirely). */
  depth: number
  selectedValue: string | null
  expandedIds: Set<string>
  onToggleExpand: (categoryId: string) => void
  onSelect: (categoryId: string) => void
  t: TenantT
}

/** One row of the category tree plus its (recursively rendered) children, when expanded. */
function CategoryTreeNode({
  category,
  isLast,
  ancestorLines,
  depth,
  selectedValue,
  expandedIds,
  onToggleExpand,
  onSelect,
  t
}: CategoryTreeNodeProps) {
  const children = category.children ?? []
  const hasChildren = children.length > 0
  const isExpanded = expandedIds.has(category.categoryId)
  const name = category.name?.trim()

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
      <TreeRow
        guides={guides}
        icon={icon}
        label={name || t('productCategories.column.noName')}
        isSelected={selectedValue === category.categoryId}
        onSelect={() => onSelect(category.categoryId)}
        meta={
          category.type === CategoryProductType.Campaign ? (
            <>
              <CategoryWindow category={category} t={t} />
              <CategoryTypeBadge type={category.type} t={t} />
            </>
          ) : undefined
        }
      />

      {hasChildren && isExpanded && (
        <div className='space-y-1'>
          {children.map((child, index) => (
            <CategoryTreeNode
              key={child.categoryId}
              category={child}
              isLast={index === children.length - 1}
              ancestorLines={depth === 0 ? ancestorLines : [...ancestorLines, !isLast]}
              depth={depth + 1}
              selectedValue={selectedValue}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  )
}
