import z from 'zod'

const count = z.number().int().nonnegative()
const platform = z.enum(['zalo', 'facebook', 'instagram'])
const status = z.enum(['Processing', 'Scheduled', 'NeedsReview', 'CompletedWithErrors', 'Completed'])
const publicationStatus = z.enum([
  'Waiting',
  'Pending',
  'Queued',
  'Publishing',
  'Scheduled',
  'NeedsReview',
  'Succeeded',
  'Failed',
  'Cancelled',
  'Closed'
])
const date = z.string().datetime({ offset: true })
const publicUrl = z
  .string()
  .url()
  .refine((value) => /^https?:\/\//i.test(value))

export const importSettingsSchema = z.object({
  accounts: z.array(z.object({ platform, accountId: z.string().uuid() })).max(3)
})
export const importSummarySchema = z.object({
  id: z.string().uuid(),
  fileName: z.string(),
  createdAt: date,
  status,
  totalRows: count,
  processedRows: count,
  invalidRows: count,
  totalChannels: count,
  succeeded: count,
  failed: count,
  pending: count,
  scheduled: count,
  needsReview: count,
  existing: count,
  waiting: count.default(0)
})
const issue = z.object({ sheet: z.string(), rowNumber: count, code: z.string(), message: z.string() })
export const importDetailSchema = z.object({
  batch: importSummarySchema,
  issues: z.array(issue),
  rows: z.array(
    z.object({
      rowNumber: count,
      code: z.string(),
      title: z.string(),
      status: z.enum(['Waiting', 'Invalid', 'Queued', 'Publishing', 'Scheduled', 'NeedsReview', 'Failed', 'Succeeded']),
      basePostId: z.string().uuid().nullable(),
      issues: z.array(issue),
      channels: z.array(
        z.object({
          platform,
          status: publicationStatus,
          errorCode: z.string().nullable(),
          publicationId: z.string().uuid().nullable(),
          externalPostId: z.string().nullable(),
          externalPostUrl: publicUrl.nullable(),
          existing: z.boolean()
        })
      )
    })
  ),
  pageIndex: count,
  pageSize: count,
  totalRows: count
})

export type ImportSettings = z.infer<typeof importSettingsSchema>
export type ImportSummary = z.infer<typeof importSummarySchema>
export type ImportDetail = z.infer<typeof importDetailSchema>
export type ImportRow = ImportDetail['rows'][number]

export const importKeys = {
  all: ['post-imports'] as const,
  defaults: ['post-imports', 'defaults'] as const,
  list: ['post-imports', 'list'] as const,
  detail: (id: string, page: number) => ['post-imports', 'detail', id, page] as const
}
export const importPollInterval = (value?: ImportSummary) =>
  value?.status === 'Processing' ? 5000 : value?.status === 'Scheduled' ? 30000 : false
