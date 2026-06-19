import { FieldDescription, FieldTitle } from '@/components/ui/field'
import { Separator } from '@/components/ui/separator'
import type { ConfigSystemItem } from '../types'
import { ConfigRenderer } from './config-render'

type Props = {
  config: ConfigSystemItem
}

export function ConfigItem({ config }: Props) {
  const meta = config.value
  const isWide = meta.inputType === 'switch-group' || meta.inputType === 'address'

  return (
    <div className='group'>
      <div className='-mx-2 rounded-lg px-3 py-3.5 transition-colors group-hover:bg-muted/40'>
        {isWide ? (
          <div className='space-y-3'>
            <div>
              <FieldTitle>{meta.label}</FieldTitle>
              {'description' in meta && meta.description && (
                <FieldDescription className='mt-0.5'>{meta.description as string}</FieldDescription>
              )}
            </div>
            <ConfigRenderer config={config} />
          </div>
        ) : (
          <div className='flex items-center gap-4'>
            <div className='min-w-0 flex-1'>
              <FieldTitle>{meta.label}</FieldTitle>
              {'description' in meta && meta.description && (
                <FieldDescription className='mt-0.5'>{meta.description as string}</FieldDescription>
              )}
            </div>
            <div className='shrink-0'>
              <ConfigRenderer config={config} />
            </div>
          </div>
        )}
      </div>
      <Separator className='last:hidden' />
    </div>
  )
}
