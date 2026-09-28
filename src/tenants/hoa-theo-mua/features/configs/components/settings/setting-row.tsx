import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useTenantTranslation } from '@/lib/i18n/use-tenant-translation'
import { EyeIcon, PencilIcon, RotateCcwIcon, SaveIcon } from 'lucide-react'
import type { Config, ConfigDefinition } from '../../types'
import ConfigValueControl from './config-value-control'
import type { ConfigRowState } from './use-config-row'

/** Tóm tắt dễ đọc các luật validate của một record, hiện ngay dưới control. */
const getValidationHints = (
  def: ConfigDefinition,
  t: (key: string, opts?: Record<string, unknown>) => string
): { key: string; label: string }[] =>
  def.validations.flatMap((rule) => {
    if ('minLength' in rule)
      return [{ key: 'minLength', label: t('configsPage.card.hints.minLength', { n: rule.minLength }) }]
    if ('maxLength' in rule)
      return [{ key: 'maxLength', label: t('configsPage.card.hints.maxLength', { n: rule.maxLength }) }]
    if ('min' in rule) return [{ key: 'min', label: t('configsPage.card.hints.min', { n: rule.min }) }]
    if ('max' in rule) return [{ key: 'max', label: t('configsPage.card.hints.max', { n: rule.max }) }]
    if ('email' in rule) return [{ key: 'email', label: t('configsPage.card.hints.email') }]
    if ('url' in rule) return [{ key: 'url', label: t('configsPage.card.hints.url') }]
    if ('integer' in rule) return [{ key: 'integer', label: t('configsPage.card.hints.integer') }]
    if ('pattern' in rule) return [{ key: 'pattern', label: t('configsPage.card.hints.pattern') }]
    return []
  })

interface Props {
  config: Config
  row: ConfigRowState
  onEdit: () => void
}

/**
 * Một setting đơn, trình bày dạng hàng phẳng có đường kẻ chứ không phải card. Card dành cho
 * document entry (`DocumentEntryRow`), nơi mỗi mục thật sự là một đối tượng riêng.
 *
 * Màn hẹp xếp label trên control, từ `sm` trở lên chia hai cột, để control không bị bóp thành một
 * dải mỏng cạnh label dài.
 */
export default function SettingRow({ config, row, onEdit }: Props) {
  const { t } = useTenantTranslation()
  const { rowRef, isDirty, isSavingValue, isTogglingPublic, errorMessage, errorId, isAutosaved, isValueHidden } = row

  const hints = getValidationHints(config.value, t)
  const description = config.value.description?.trim()

  return (
    <div
      ref={rowRef}
      tabIndex={-1}
      data-config-id={config.id}
      className='group grid gap-x-6 gap-y-2 py-4 outline-none transition-colors focus-visible:bg-muted/40 sm:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] sm:items-start'
    >
      <div className='min-w-0 space-y-1'>
        <div className='flex items-center gap-1.5'>
          <span className='text-sm font-medium'>{config.value.label || config.key}</span>
          {config.value.required && (
            <span className='text-xs font-semibold text-destructive' title={t('configsPage.card.required')}>
              *
            </span>
          )}
        </div>

        <p className='truncate font-mono text-xs text-muted-foreground' title={config.key}>
          {config.key}
        </p>

        {description && <p className='text-xs text-muted-foreground'>{description}</p>}
      </div>

      <div className='min-w-0 space-y-1.5'>
        {/*
          Toast ở góc màn hình và spinner biến mất không đến được trình đọc màn hình, nên kết quả
          ghi được đọc ngay tại field tương ứng. Dùng `polite` để không cắt ngang lúc đang gõ.
        */}
        <span aria-live='polite' className='sr-only'>
          {row.saveStatus === 'saving'
            ? t('configsPage.card.saving')
            : row.saveStatus === 'saved'
              ? t('configsPage.card.savedAnnouncement', { label: config.value.label || config.key })
              : row.saveStatus === 'failed'
                ? t('configsPage.card.saveFailedAnnouncement', { label: config.value.label || config.key })
                : ''}
        </span>
        <div className='flex items-start gap-2'>
          <div data-dirty-focus className='min-w-0 flex-1'>
            {isValueHidden ? (
              <div className='flex h-9 items-center gap-2 rounded-md border border-dashed bg-muted/30 px-2.5 text-xs text-muted-foreground'>
                <span className='flex-1 truncate font-mono tracking-widest'>••••••••</span>
              </div>
            ) : (
              <ConfigValueControl config={config} row={row} />
            )}
          </div>

          {isValueHidden && (
            <Button
              type='button'
              size='sm'
              variant='outline'
              className='shrink-0'
              disabled={row.isRevealingConfig}
              onClick={row.reveal}
            >
              {row.isRevealingConfig ? <Spinner data-icon='inline-start' /> : <EyeIcon data-icon='inline-start' />}
              {row.isRevealingConfig ? t('configsPage.card.revealing') : t('configsPage.card.reveal')}
            </Button>
          )}
        </div>

        {/* Lỗi THAY THẾ phần gợi ý chứ không xếp chồng: gợi ý chính là những luật mà lỗi đang báo
            vi phạm, vùi một dòng đỏ dưới ba dòng xám là cách chắc chắn để nó bị bỏ qua. Cả dải
            biến mất khi không có gì để nói, nên row không có luật vẫn giữ chiều cao gọn. */}
        {(hints.length > 0 || config.value.required || errorMessage || isAutosaved) && (
          <div className='flex flex-wrap items-center gap-x-3 gap-y-0.5'>
            {errorMessage ? (
              <span id={errorId} role='alert' className='text-xs text-destructive'>
                {errorMessage}
              </span>
            ) : (
              <>
                {isAutosaved && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className='text-xs text-muted-foreground underline decoration-dotted underline-offset-2'>
                        {t('configsPage.card.autosaved')}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>{t('configsPage.card.autosavedHint')}</TooltipContent>
                  </Tooltip>
                )}
                {config.value.required && (
                  <span className='text-xs text-muted-foreground'>{t('configsPage.card.required')}</span>
                )}
                {hints.map((hint) => (
                  <span key={hint.key} className='text-xs text-muted-foreground'>
                    {hint.label}
                  </span>
                ))}
              </>
            )}
          </div>
        )}

        {/* Lưu/Hoàn tác chỉ có ở row thực sự đang giữ bản nháp chưa lưu. Row autosave đã ghi ngay
            lúc đổi nên không giữ nháp; secret đang che thì chỉ giữ chuỗi mặt nạ, không phải giá
            trị. `revert` chỉ chạy ở local - đúng thao tác mà dirty registry gọi. */}
        {!isAutosaved && !isValueHidden && isDirty && (
          <div className='flex items-center gap-2 pt-0.5'>
            <Button type='button' size='sm' disabled={isSavingValue} onClick={row.save}>
              {isSavingValue ? <Spinner data-icon='inline-start' /> : <SaveIcon data-icon='inline-start' />}
              {isSavingValue ? t('configsPage.card.saving') : t('configsPage.card.save')}
            </Button>
            <Button type='button' size='sm' variant='ghost' disabled={isSavingValue} onClick={row.revert}>
              <RotateCcwIcon data-icon='inline-start' />
              {t('configsPage.card.revert')}
            </Button>
          </div>
        )}

        {/* Luôn hiện, vì cả hai thao tác đều không phụ thuộc bản nháp: switch công khai ghi lại
            giá trị ĐÃ LƯU với mức hiển thị mới, còn Sửa mở phần định nghĩa (label, kiểu, luật)
            chứ không phải giá trị. Không cho công khai secret chưa mở khoá - làm vậy là phơi ra
            một giá trị mà chính người gạt switch còn chưa thấy. */}
        <div className='flex items-center gap-3 pt-0.5'>
          <Label
            htmlFor={`pub-${config.id}`}
            className='flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground'
            title={isValueHidden ? t('configsPage.card.secretLockedTooltip') : t('configsPage.card.publicTooltip')}
          >
            <Switch
              id={`pub-${config.id}`}
              checked={config.isPublic}
              onCheckedChange={(checked) => row.togglePublic(checked)}
              disabled={isTogglingPublic || isValueHidden}
            />
            {t('configsPage.card.public')}
          </Label>

          <Button
            type='button'
            variant='ghost'
            size='sm'
            className='h-7 px-2 text-xs text-muted-foreground'
            title={t('configsPage.card.editDefinition')}
            onClick={onEdit}
          >
            <PencilIcon data-icon='inline-start' />
            {t('configsPage.card.editDefinition')}
          </Button>
        </div>
      </div>
    </div>
  )
}
