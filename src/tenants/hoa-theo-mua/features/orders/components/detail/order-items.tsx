import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import { cn } from '@/shared/utils'
import { ChevronDownIcon, ChevronRightIcon, PackageIcon } from 'lucide-react'
import { Fragment, useState } from 'react'
import { Link } from 'react-router'
import { HOA_THEO_MUA_ROUTE_PREFIX } from '../../../../config'
import type { SystemOrderItem, SystemOrderMaterialSnapshot } from '../../types'
import { numberFormatter, vndFormatter } from '../../utils'

const COLUMN_COUNT = 8

const formatCurrency = (value: number | null | undefined, empty: string) =>
  value == null ? empty : vndFormatter.format(value)

const formatNumber = (value: number | null | undefined, empty: string) =>
  value == null ? empty : numberFormatter.format(value)

/** Materials captured on the product snapshot when the order was placed. */
function MaterialTable({ materials, t }: { materials: SystemOrderMaterialSnapshot[]; t: TenantT }) {
  const empty = t('systemOrders.common.noDataShort')

  return (
    <div className='p-2'>
      <div className='overflow-hidden rounded-lg border bg-background'>
        <Table>
          <TableHeader>
            <TableRow className='hover:bg-transparent'>
              <TableHead className='h-9 text-xs'>{t('systemOrders.detail.materials')}</TableHead>
              <TableHead className='h-9 text-xs'>{t('systemOrders.detail.materialType')}</TableHead>
              <TableHead className='h-9 text-right text-xs'>{t('systemOrders.detail.itemQuantity')}</TableHead>
              <TableHead className='h-9 text-right text-xs'>{t('systemOrders.detail.itemPrice')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.map((material) => (
              <TableRow key={material.matId}>
                <TableCell className='py-2 text-sm'>
                  <Link
                    to={`/${HOA_THEO_MUA_ROUTE_PREFIX}/products/${material.matId}`}
                    className='hover:underline hover:text-primary'
                  >
                    {material.name?.trim() || empty}
                  </Link>
                </TableCell>
                <TableCell className='py-2 text-sm'>
                  <Badge variant={material.isCore ? 'default' : 'secondary'} className='font-normal'>
                    {t(
                      material.isCore
                        ? 'products.detail.comboSpecification.core'
                        : 'products.detail.comboSpecification.support'
                    )}
                  </Badge>
                </TableCell>
                <TableCell className='py-2 text-right text-sm tabular-nums'>
                  {formatNumber(material.quantity, empty)}
                </TableCell>
                <TableCell className='py-2 text-right text-sm tabular-nums'>
                  {formatCurrency(material.price, empty)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export function OrderItemsTable({ items, t }: { items: SystemOrderItem[]; t: TenantT }) {
  const [expandedIds, setExpandedIds] = useState<string[]>([])
  const empty = t('systemOrders.common.noDataShort')

  const toggleRow = (id: string) =>
    setExpandedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))

  if (items.length === 0) {
    return (
      <div className='rounded-lg border py-6 text-center text-sm text-muted-foreground'>
        {t('systemOrders.detail.noItems')}
      </div>
    )
  }

  return (
    <div className='overflow-x-auto rounded-lg border bg-card'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-10' />
            <TableHead className='w-16' />
            <TableHead>{t('systemOrders.detail.itemName')}</TableHead>
            <TableHead>{t('systemOrders.detail.itemParent')}</TableHead>
            <TableHead className='text-right'>{t('systemOrders.detail.itemWeight')}</TableHead>
            <TableHead className='text-right'>{t('systemOrders.detail.itemQuantity')}</TableHead>
            <TableHead className='text-right'>{t('systemOrders.detail.itemPrice')}</TableHead>
            <TableHead className='text-right'>{t('systemOrders.detail.itemTotal')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const name = item.name?.trim() || empty
            const lineTotal = item.price != null && item.number != null ? item.price * item.number : null
            const materials = item.snapshot?.materials ?? []
            const isExpanded = expandedIds.includes(item.orderDetailsId)

            return (
              <Fragment key={item.orderDetailsId}>
                <TableRow className='align-top'>
                  <TableCell className='w-10'>
                    {materials.length > 0 && (
                      <Button
                        variant='ghost'
                        size='icon'
                        className='size-6'
                        onClick={() => toggleRow(item.orderDetailsId)}
                        aria-expanded={isExpanded}
                        aria-label={t(
                          isExpanded ? 'systemOrders.detail.hideMaterials' : 'systemOrders.detail.showMaterials'
                        )}
                      >
                        {isExpanded ? <ChevronDownIcon className='size-4' /> : <ChevronRightIcon className='size-4' />}
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className='w-16'>
                    <span className='flex size-12 items-center justify-center overflow-hidden rounded-lg border bg-muted/30'>
                      {item.coverImage ? (
                        <img src={item.coverImage} alt={name} className='size-full object-cover' />
                      ) : (
                        <PackageIcon className='size-5 text-muted-foreground/50' />
                      )}
                    </span>
                  </TableCell>
                  <TableCell className='max-w-72'>
                    {item.productId ? (
                      <Link
                        to={`/${HOA_THEO_MUA_ROUTE_PREFIX}/products/${item.productId}`}
                        className='font-medium hover:underline hover:text-primary'
                      >
                        {name}
                      </Link>
                    ) : (
                      <span className='font-medium'>{name}</span>
                    )}
                    <div className='mt-0.5 flex flex-wrap items-center gap-2'>
                      {item.itemId != null && (
                        <span className='font-mono text-xs text-muted-foreground'>#{item.itemId}</span>
                      )}
                      {materials.length > 0 && (
                        <button
                          type='button'
                          onClick={() => toggleRow(item.orderDetailsId)}
                          className='text-xs text-primary hover:underline'
                        >
                          {t('systemOrders.detail.materials')} ({materials.length})
                        </button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className='max-w-56'>
                    {item.parentProductName?.trim() ? (
                      item.parentProductId ? (
                        <Link
                          to={`/${HOA_THEO_MUA_ROUTE_PREFIX}/products/${item.parentProductId}`}
                          className='hover:underline hover:text-primary'
                        >
                          <Badge variant='secondary' className='font-normal'>
                            {item.parentProductName.trim()}
                          </Badge>
                        </Link>
                      ) : (
                        <Badge variant='secondary' className='font-normal'>
                          {item.parentProductName.trim()}
                        </Badge>
                      )
                    ) : (
                      <span className='text-muted-foreground'>{empty}</span>
                    )}
                  </TableCell>
                  <TableCell className='whitespace-nowrap text-right tabular-nums text-muted-foreground'>
                    {formatNumber(item.weight, empty)}
                  </TableCell>
                  <TableCell className='whitespace-nowrap text-right tabular-nums'>
                    {formatNumber(item.number, empty)}
                  </TableCell>
                  <TableCell className='whitespace-nowrap text-right tabular-nums'>
                    {formatCurrency(item.price, empty)}
                  </TableCell>
                  <TableCell className='whitespace-nowrap text-right font-semibold tabular-nums'>
                    {formatCurrency(lineTotal, empty)}
                  </TableCell>
                </TableRow>

                {materials.length > 0 && (
                  <TableRow className={cn(!isExpanded && 'border-b-0')}>
                    <TableCell colSpan={COLUMN_COUNT} className='bg-muted/50 p-0'>
                      <div
                        className={cn(
                          'grid transition-[grid-template-rows] duration-200 ease-in-out',
                          isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                        )}
                      >
                        <div className='overflow-hidden'>
                          <MaterialTable materials={materials} t={t} />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
