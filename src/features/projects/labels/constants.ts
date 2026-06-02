interface TaskLabelColor {
  baseColor: string
  shades: { value: string; isDefaultSelect: boolean; isDefaultDisplay: boolean; textColor: string }[]
}

const taskLabelColors: TaskLabelColor[] = [
  {
    baseColor: 'Emerald',
    shades: [
      { value: 'bg-emerald-200', isDefaultSelect: false, isDefaultDisplay: false, textColor: 'text-emerald-950' },
      { value: 'bg-emerald-400', isDefaultSelect: true, isDefaultDisplay: false, textColor: 'text-emerald-900' },
      { value: 'bg-emerald-600', isDefaultSelect: false, isDefaultDisplay: true, textColor: 'text-background' }
    ]
  },
  {
    baseColor: 'Yellow',
    shades: [
      { value: 'bg-yellow-200', isDefaultSelect: false, isDefaultDisplay: false, textColor: 'text-yellow-950' },
      { value: 'bg-yellow-400', isDefaultSelect: false, isDefaultDisplay: false, textColor: 'text-yellow-900' },
      { value: 'bg-yellow-600', isDefaultSelect: false, isDefaultDisplay: true, textColor: 'text-background' }
    ]
  },
  {
    baseColor: 'Orange',
    shades: [
      { value: 'bg-orange-200', isDefaultSelect: false, isDefaultDisplay: false, textColor: 'text-orange-950' },
      { value: 'bg-orange-400', isDefaultSelect: false, isDefaultDisplay: false, textColor: 'text-orange-900' },
      { value: 'bg-orange-600', isDefaultSelect: false, isDefaultDisplay: true, textColor: 'text-background' }
    ]
  },
  {
    baseColor: 'Rose',
    shades: [
      { value: 'bg-rose-200', isDefaultSelect: false, isDefaultDisplay: false, textColor: 'text-rose-950' },
      { value: 'bg-rose-400', isDefaultSelect: false, isDefaultDisplay: false, textColor: 'text-rose-900' },
      { value: 'bg-rose-600', isDefaultSelect: false, isDefaultDisplay: true, textColor: 'text-background' }
    ]
  },
  {
    baseColor: 'Fuchsia',
    shades: [
      { value: 'bg-fuchsia-200', isDefaultSelect: false, isDefaultDisplay: false, textColor: 'text-fuchsia-950' },
      { value: 'bg-fuchsia-400', isDefaultSelect: false, isDefaultDisplay: false, textColor: 'text-fuchsia-900' },
      { value: 'bg-fuchsia-600', isDefaultSelect: false, isDefaultDisplay: true, textColor: 'text-background' }
    ]
  },
  {
    baseColor: 'Indigo',
    shades: [
      { value: 'bg-indigo-200', isDefaultSelect: false, isDefaultDisplay: false, textColor: 'text-indigo-950' },
      { value: 'bg-indigo-400', isDefaultSelect: false, isDefaultDisplay: false, textColor: 'text-indigo-900' },
      { value: 'bg-indigo-600', isDefaultSelect: false, isDefaultDisplay: true, textColor: 'text-background' }
    ]
  },
  {
    baseColor: 'Sky',
    shades: [
      { value: 'bg-sky-200', isDefaultSelect: false, isDefaultDisplay: false, textColor: 'text-sky-950' },
      { value: 'bg-sky-400', isDefaultSelect: false, isDefaultDisplay: false, textColor: 'text-sky-900' },
      { value: 'bg-sky-600', isDefaultSelect: false, isDefaultDisplay: true, textColor: 'text-background' }
    ]
  },
  {
    baseColor: 'Lime',
    shades: [
      { value: 'bg-lime-200', isDefaultSelect: false, isDefaultDisplay: false, textColor: 'text-lime-950' },
      { value: 'bg-lime-400', isDefaultSelect: false, isDefaultDisplay: false, textColor: 'text-lime-900' },
      { value: 'bg-lime-600', isDefaultSelect: false, isDefaultDisplay: true, textColor: 'text-background' }
    ]
  },
  {
    baseColor: 'Pink',
    shades: [
      { value: 'bg-pink-200', isDefaultSelect: false, isDefaultDisplay: false, textColor: 'text-pink-950' },
      { value: 'bg-pink-400', isDefaultSelect: false, isDefaultDisplay: false, textColor: 'text-pink-900' },
      { value: 'bg-pink-600', isDefaultSelect: false, isDefaultDisplay: true, textColor: 'text-background' }
    ]
  },
  {
    baseColor: 'Gray',
    shades: [
      { value: 'bg-gray-200', isDefaultSelect: false, isDefaultDisplay: false, textColor: 'text-gray-950' },
      { value: 'bg-gray-400', isDefaultSelect: false, isDefaultDisplay: false, textColor: 'text-gray-700' },
      { value: 'bg-gray-600', isDefaultSelect: false, isDefaultDisplay: true, textColor: 'text-background' }
    ]
  }
]

export const sortedTaskLabelColors = taskLabelColors.sort((a, b) => a.baseColor.localeCompare(b.baseColor))
export const labelPreviewInsetShadowClasses =
  'shadow-[inset_2px_0_2px_-2px_rgba(0,0,0,0.15),inset_-2px_0_2px_-2px_rgba(0,0,0,0.15)]'
