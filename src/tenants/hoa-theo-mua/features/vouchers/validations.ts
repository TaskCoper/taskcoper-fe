import type { TenantT } from '@/lib/i18n/use-tenant-translation'
import z from 'zod'
import { composeDateTime } from './components/voucher-date-utils'
import type { VoucherDiscountType, VoucherVisibility } from './types'

const optionalAmount = z.number().nullable()

type ValidityValues = {
  startDate: string | null
  startTime: string
  endDate: string | null
  endTime: string
}

const addDateRules = (t: TenantT, isProgram: boolean) => (data: ValidityValues, ctx: z.RefinementCtx) => {
  const startAt = composeDateTime(data.startDate, data.startTime, false)
  const endAt = composeDateTime(data.endDate, data.endTime, true)

  if (!startAt && !endAt) {
    ctx.addIssue({ code: 'custom', message: t('configsPage.vouchers.validityRequired'), path: ['startDate'] })
  }

  if (!startAt && endAt) {
    ctx.addIssue({ code: 'custom', message: t('configsPage.vouchers.startDateRequired'), path: ['startDate'] })
  }

  if (startAt && endAt && Date.parse(endAt) <= Date.parse(startAt)) {
    ctx.addIssue({ code: 'custom', message: t('configsPage.vouchers.endDateValidation'), path: ['endDate'] })
  }

  if (!isProgram && endAt && Date.parse(endAt) <= Date.now()) {
    ctx.addIssue({ code: 'custom', message: t('configsPage.vouchers.endDateValidation'), path: ['endDate'] })
  }
}

const addAmountRules =
  (t: TenantT) => (data: { minOrderAmount: number | null; maxOrderAmount: number | null }, ctx: z.RefinementCtx) => {
    const min = data.minOrderAmount ?? undefined
    const max = data.maxOrderAmount ?? undefined
    const isInvalidAmount = (value: number) => !Number.isFinite(value) || value <= 0
    const invalidAmountMessage = t('common.validation.number.positive')

    if (min !== undefined && max !== undefined && min > max) {
      ctx.addIssue({
        code: 'custom',
        message: t('configsPage.vouchers.minOrderAmountValidation'),
        path: ['maxOrderAmount']
      })
    }

    if (min !== undefined && isInvalidAmount(min)) {
      ctx.addIssue({ code: 'custom', message: invalidAmountMessage, path: ['minOrderAmount'] })
    }
    if (max !== undefined && isInvalidAmount(max)) {
      ctx.addIssue({ code: 'custom', message: invalidAmountMessage, path: ['maxOrderAmount'] })
    }
  }

export const voucherSchema = (t: TenantT, usedCount = 0, isEdit = false) =>
  z
    .object({
      codeMode: z.enum(['manual', 'generated']),
      code: z.string(),
      codePrefix: z.string(),
      codeLength: z.number({ error: t('configsPage.vouchers.generatedCodeValidation') }),
      codeSuffix: z.string(),
      description: z.string().max(500, t('common.validation.maxLength', { max: 500 })),
      visibility: z.enum(['public', 'private'] satisfies [VoucherVisibility, VoucherVisibility]),
      discountType: z.enum(['percent', 'cash'] satisfies [VoucherDiscountType, VoucherDiscountType]),
      discountValue: z.number({ error: t('configsPage.vouchers.discountValueValidation') }),
      maxDiscountAmount: optionalAmount,
      maxUsageCount: z.number({ error: t('configsPage.vouchers.maxUsageValidation') }),
      startDate: z.string().nullable(),
      startTime: z.string(),
      endDate: z.string().nullable(),
      endTime: z.string(),
      minOrderAmount: optionalAmount,
      maxOrderAmount: optionalAmount
    })
    .superRefine((data, ctx) => {
      const codeMode = isEdit ? 'edit' : data.codeMode

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
      if (data.discountValue < 0 || (data.discountType === 'percent' && data.discountValue > 100)) {
        ctx.addIssue({
          code: 'custom',
          message: t('configsPage.vouchers.discountValueValidation'),
          path: ['discountValue']
        })
      }
      if (data.discountType === 'cash' && data.maxDiscountAmount !== null) {
        ctx.addIssue({
          code: 'custom',
          message: t('configsPage.vouchers.maxDiscountValidation'),
          path: ['maxDiscountAmount']
        })
      }
      if (data.discountType === 'percent' && data.maxDiscountAmount !== null) {
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
      if (data.maxUsageCount > 0 && data.maxUsageCount < usedCount) {
        ctx.addIssue({
          code: 'custom',
          message: t('configsPage.vouchers.maxUsageBelowUsed', { used: usedCount }),
          path: ['maxUsageCount']
        })
      }
      addDateRules(t, false)(data, ctx)
      addAmountRules(t)(data, ctx)
    })

export const programSchema = (t: TenantT) =>
  z
    .object({
      name: z.string(),
      startDate: z.string().nullable(),
      startTime: z.string(),
      endDate: z.string().nullable(),
      endTime: z.string(),
      minOrderAmount: optionalAmount,
      maxOrderAmount: optionalAmount
    })
    .superRefine((data, ctx) => {
      if (!data.name.trim()) {
        ctx.addIssue({ code: 'custom', message: t('configsPage.vouchers.programNameValidation'), path: ['name'] })
      }
      addDateRules(t, true)(data, ctx)
      addAmountRules(t)(data, ctx)
    })

export const generateVoucherSchema = (t: TenantT, maxQuantity: number) =>
  z
    .object({
      codePrefix: z.string().optional(),
      codeLength: z.number({ error: t('configsPage.vouchers.generatedCodeValidation') }),
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
      if (data.discountValue < 0 || (data.discountType === 'percent' && data.discountValue > 100)) {
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
