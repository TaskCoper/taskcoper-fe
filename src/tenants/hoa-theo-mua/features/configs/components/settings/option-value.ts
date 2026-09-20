import type { InputOption } from '../../types'

export const toOriginalOptionValue = (options: readonly InputOption[], emitted: string): string | number =>
  options.find((option) => String(option.value) === emitted)?.value ?? emitted

/** Cùng phép ánh xạ đó cho mảng chuỗi mà multi-select phát ra. */
export const toOriginalOptionValues = (
  options: readonly InputOption[],
  emitted: readonly string[]
): (string | number)[] => {
  const byString = new Map(options.map((option) => [String(option.value), option.value]))
  return emitted.map((value) => byString.get(value) ?? value)
}
