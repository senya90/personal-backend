import { TruncateOptions } from '@/common/utils/string/types'

export const StringUtils = {
  truncate: (value: string | null | undefined, options?: TruncateOptions): string => {
    if (!value) return ''

    const { maxLength = 50, suffix = '...' } = options || {}
    if (value.length <= maxLength) return value

    return StringUtils.safeSubstring(value.trim(), 0, maxLength).concat(suffix)
  },

  safeSubstring: (value: string | null | undefined, start: number, end?: number): string => {
    if (!value) return ''

    const safeStart = Math.max(0, start)
    const safeEnd = end !== undefined ? Math.min(value.length, end) : value.length

    if (safeStart >= safeEnd) return ''

    return value.substring(safeStart, safeEnd)
  }
}
