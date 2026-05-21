import i18next from 'i18next'
import { create } from 'zustand'

interface ConfirmOptions {
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
}

interface ConfirmStore {
  isOpen: boolean
  options: ConfirmOptions
  resolver: ((value: boolean) => void) | null
  confirm: (options?: ConfirmOptions) => Promise<boolean>
  handleConfirm: () => void
  handleCancel: () => void
}

export const useConfirmStore = create<ConfirmStore>((set, get) => ({
  isOpen: false,
  options: {},
  resolver: null,
  confirm: (options = {}) => {
    return new Promise((resolve) => {
      set({
        isOpen: true,
        options: {
          title: options.title ?? i18next.t('common.confirm.title'),
          description: options.description ?? i18next.t('common.confirm.description'),
          confirmText: options.confirmText ?? i18next.t('common.confirm.confirmText'),
          cancelText: options.cancelText ?? i18next.t('common.confirm.cancelText'),
          variant: options.variant ?? 'default'
        },
        resolver: resolve
      })
    })
  },
  handleConfirm: () => {
    const { resolver } = get()
    if (resolver) {
      resolver(true)
    }
    set({ isOpen: false, resolver: null })
  },
  handleCancel: () => {
    const { resolver } = get()
    if (resolver) {
      resolver(false)
    }
    set({ isOpen: false, resolver: null })
  }
}))
