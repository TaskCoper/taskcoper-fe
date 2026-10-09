import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import z from 'zod'
import type { VoucherDiscountType, VoucherVisibility } from './types'

const optionalAmount = z.union([z.string(), z.number(), z.null()])

const addDateRules = (t: TenantT) => (data: { startAt: string; endAt: string }, ctx: z.RefinementCtx) => {
  if (!data.startAt && !data.endAt) {
    ctx.addIssue({ code: 'custom', message: t('configsPage.vouchers.validityRequired'), path: ['startAt'] })
  }

  if (!data.startAt && data.endAt) {
    ctx.addIssue({ code: 'custom', message: t('configsPage.vouchers.startDateRequired'), path: ['startAt'] })
  }

  if (data.startAt && data.endAt && data.endAt <= data.startAt) {
    ctx.addIssue({ code: 'custom', message: t('configsPage.vouchers.endDateValidation'), path: ['endAt'] })
  }

  if (data.endAt && Date.parse(data.endAt) <= Date.now()) {
    ctx.addIssue({ code: 'custom', message: t('configsPage.vouchers.endDateValidation'), path: ['endAt'] })
  }
}

const addAmountRules =
  (t: TenantT) =>
  (data: { minOrderAmount: string | number | null; maxOrderAmount: string | number | null }, ctx: z.RefinementCtx) => {
    const min = data.minOrderAmount === '' || data.minOrderAmount === null ? undefined : Number(data.minOrderAmount)
    const max = data.maxOrderAmount === '' || data.maxOrderAmount === null ? undefined : Number(data.maxOrderAmount)

    if (min !== undefined && max !== undefined && min > max) {
      ctx.addIssue({
        code: 'custom',
        message: t('configsPage.vouchers.minOrderAmountValidation'),
        path: ['maxOrderAmount']
      })
    }

    if (min !== undefined && (!Number.isFinite(min) || min <= 0)) {
      ctx.addIssue({ code: 'custom', message: t('common.validation.number.positive'), path: ['minOrderAmount'] })
    }
    if (max !== undefined && (!Number.isFinite(max) || max <= 0)) {
      ctx.addIssue({ code: 'custom', message: t('common.validation.number.positive'), path: ['maxOrderAmount'] })
    }
  }

export const voucherSchema = (t: TenantT, usedCount = 0, codeMode: 'manual' | 'generated' | 'edit' = 'manual') =>
  z
    .object({
      code: z.string(),
      codePrefix: z.string(),
      codeLength: z.number(),
      codeSuffix: z.string(),
      description: z.string().max(500, t('common.validation.maxLength', { max: 500 })),
      visibility: z.enum(['public', 'private'] satisfies [VoucherVisibility, VoucherVisibility]),
      discountType: z.enum(['percent', 'cash'] satisfies [VoucherDiscountType, VoucherDiscountType]),
      discountValue: z.number({ error: t('configsPage.vouchers.discountValueValidation') }),
      maxDiscountAmount: optionalAmount,
      maxUsageCount: z.number({ error: t('configsPage.vouchers.maxUsageValidation') }),
      startAt: z.string(),
      endAt: z.string(),
      minOrderAmount: optionalAmount,
      maxOrderAmount: optionalAmount
    })
    .superRefine((data, ctx) => {
      if (codeMode === 'manual' && !data.code) {
        ctx.addIssue({ code: 'custom', message: t('configsPage.vouchers.codeFormatValidation'), path: ['code'] })
      }
      if (codeMode === 'manual' && data.code && !/^[A-Z0-9]{4,20}$/.test(data.code)) {
        ctx.addIssue({ code: 'custom', message: t('configsPage.vouchers.codeFormatValidation'), path: ['code'] })
      }

      if (codeMode === 'generated' && data.codePrefix && !/^[A-Z0-9]*$/.test(data.codePrefix)) {
        ctx.addIssue({
          code: 'custom',
          message: t('configsPage.vouchers.generatedCodeValidation'),
          path: ['codePrefix']
        })
      }
      if (codeMode === 'generated' && data.codeSuffix && !/^[A-Z0-9]*$/.test(data.codeSuffix)) {
        ctx.addIssue({
          code: 'custom',
          message: t('configsPage.vouchers.generatedCodeValidation'),
          path: ['codeSuffix']
        })
      }
      if (
        codeMode === 'generated' &&
        (data.codeLength < 5 ||
          data.codeLength > 10 ||
          data.codePrefix.length + data.codeLength + data.codeSuffix.length > 20)
      ) {
        ctx.addIssue({
          code: 'custom',
          message: t('configsPage.vouchers.generatedCodeValidation'),
          path: ['codeLength']
        })
      }
      if (data.discountValue <= 0 || (data.discountType === 'percent' && data.discountValue > 100)) {
        ctx.addIssue({
          code: 'custom',
          message: t('configsPage.vouchers.discountValueValidation'),
          path: ['discountValue']
        })
      }
      if (data.discountType === 'cash' && data.maxDiscountAmount !== '' && data.maxDiscountAmount !== null) {
        ctx.addIssue({
          code: 'custom',
          message: t('configsPage.vouchers.maxDiscountValidation'),
          path: ['maxDiscountAmount']
        })
      }
      if (data.discountType === 'percent' && data.maxDiscountAmount !== '' && data.maxDiscountAmount !== null) {
        if (Number(data.maxDiscountAmount) <= 0) {
          ctx.addIssue({
            code: 'custom',
            message: t('configsPage.vouchers.maxDiscountValidation'),
            path: ['maxDiscountAmount']
          })
        }
      }
      if (data.maxUsageCount <= 0) {
        ctx.addIssue({ code: 'custom', message: t('configsPage.vouchers.maxUsageValidation'), path: ['maxUsageCount'] })
      }
      if (data.maxUsageCount < usedCount) {
        ctx.addIssue({ code: 'custom', message: t('configsPage.vouchers.maxUsageValidation'), path: ['maxUsageCount'] })
      }
      addDateRules(t)(data, ctx)
      addAmountRules(t)(data, ctx)
    })

export const programSchema = (t: TenantT) =>
  z
    .object({
      name: z.string(),
      startAt: z.string(),
      endAt: z.string(),
      minOrderAmount: optionalAmount,
      maxOrderAmount: optionalAmount
    })
    .superRefine((data, ctx) => {
      if (!data.name.trim()) {
        ctx.addIssue({ code: 'custom', message: t('configsPage.vouchers.programNameValidation'), path: ['name'] })
      }
      addDateRules(t)(data, ctx)
      addAmountRules(t)(data, ctx)
    })

export const generateVoucherSchema = (t: TenantT, maxQuantity: number) =>
  z
    .object({
      codePrefix: z.string().optional(),
      codeLength: z.number(),
      codeSuffix: z.string().optional(),
      quantity: z.number({ error: t('configsPage.vouchers.quantityValidation', { max: maxQuantity }) }),
      maxUsageCount: z.number({ error: t('configsPage.vouchers.maxUsageValidation') }),
      discountType: z.enum(['percent', 'cash'] satisfies [VoucherDiscountType, VoucherDiscountType]),
      discountValue: z.number({ error: t('configsPage.vouchers.discountValueValidation') }),
      maxDiscountAmount: z.union([z.number(), z.null()]).optional(),
      description: z
        .string()
        .max(500, t('common.validation.maxLength', { max: 500 }))
        .optional()
    })
    .superRefine((data, ctx) => {
      const codePrefix = data.codePrefix ?? ''
      const codeSuffix = data.codeSuffix ?? ''

      if (codePrefix && !/^[A-Z0-9]*$/.test(codePrefix)) {
        ctx.addIssue({
          code: 'custom',
          message: t('configsPage.vouchers.generatedCodeValidation'),
          path: ['codePrefix']
        })
      }
      if (codeSuffix && !/^[A-Z0-9]*$/.test(codeSuffix)) {
        ctx.addIssue({
          code: 'custom',
          message: t('configsPage.vouchers.generatedCodeValidation'),
          path: ['codeSuffix']
        })
      }
      if (data.codeLength < 5 || data.codeLength > 10 || codePrefix.length + data.codeLength + codeSuffix.length > 20) {
        ctx.addIssue({
          code: 'custom',
          message: t('configsPage.vouchers.generatedCodeValidation'),
          path: ['codeLength']
        })
      }
      if (data.quantity < 1 || data.quantity > maxQuantity) {
        ctx.addIssue({
          code: 'custom',
          message: t('configsPage.vouchers.quantityValidation', { max: maxQuantity }),
          path: ['quantity']
        })
      }
      if (data.maxUsageCount <= 0) {
        ctx.addIssue({ code: 'custom', message: t('configsPage.vouchers.maxUsageValidation'), path: ['maxUsageCount'] })
      }
      if (data.discountValue <= 0 || (data.discountType === 'percent' && data.discountValue > 100)) {
        ctx.addIssue({
          code: 'custom',
          message: t('configsPage.vouchers.discountValueValidation'),
          path: ['discountValue']
        })
      }
      if (data.discountType === 'cash' && data.maxDiscountAmount !== undefined && data.maxDiscountAmount !== null) {
        ctx.addIssue({
          code: 'custom',
          message: t('configsPage.vouchers.maxDiscountValidation'),
          path: ['maxDiscountAmount']
        })
      }
      if (data.discountType === 'percent' && data.maxDiscountAmount !== undefined && data.maxDiscountAmount !== null) {
        if (Number(data.maxDiscountAmount) <= 0) {
          ctx.addIssue({
            code: 'custom',
            message: t('configsPage.vouchers.maxDiscountValidation'),
            path: ['maxDiscountAmount']
          })
        }
      }
    })
