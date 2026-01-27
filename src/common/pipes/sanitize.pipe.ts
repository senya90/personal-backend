import { PipeTransform, Injectable, Scope } from '@nestjs/common'
import sanitizeHtml from 'sanitize-html'

interface SanitizeConfig {
  allowedTags?: string[]
  allowedAttributes?: Record<string, string[]>
  disallowedTagsMode?: 'discard' | 'escape' | 'recursiveEscape'
  headerFields?: string[]
}

type Sanitizable =
  | string
  | number
  | boolean
  | null
  | undefined
  | Sanitizable[]
  | { [key: string]: Sanitizable }

@Injectable({ scope: Scope.REQUEST })
export class SanitizePipe implements PipeTransform<Sanitizable, Sanitizable> {
  private static readonly MULTIPLE_SPACES_REGEX = /\s{2,}/g
  private static readonly HEADER_BREAKS_REGEX = /[\r\n\t]+/g
  private static readonly DEFAULT_HEADER_FIELDS = new Set([
    'email',
    'theme',
    'subject',
    'title',
    'from',
    'to',
    'cc',
    'bcc',
    'username',
    'recipient',
    'sender',
    'name',
    'firstname',
    'lastname',
    'phone',
    'address'
  ])

  private readonly config: SanitizeConfig

  constructor(config?: Partial<SanitizeConfig>) {
    this.config = {
      allowedTags: [],
      allowedAttributes: {},
      disallowedTagsMode: 'escape',
      headerFields: [...SanitizePipe.DEFAULT_HEADER_FIELDS],
      ...config
    }
  }

  transform(value: Sanitizable): Sanitizable {
    if (value === null || value === undefined || typeof value !== 'object') {
      return this.sanitizePrimitive(value)
    }

    if (Array.isArray(value)) return this.sanitizeArray(value)
    return this.sanitizeObject(value)
  }

  private sanitizePrimitive(value: Sanitizable): Sanitizable {
    if (typeof value === 'string') return this.sanitizeString(value, '')
    return value
  }

  private sanitizeArray(arr: Sanitizable[]): Sanitizable[] {
    return arr.map(item => {
      if (item === null || item === undefined) return item
      if (typeof item !== 'object') return this.sanitizePrimitive(item)

      return Array.isArray(item) ? this.sanitizeArray(item) : this.sanitizeObject(item)
    })
  }

  private sanitizeObject(obj: Record<string, Sanitizable>): Record<string, Sanitizable> {
    const result: Record<string, Sanitizable> = {}

    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) {
        result[key] = value
        continue
      }

      if (typeof value === 'object') {
        result[key] = Array.isArray(value) ? this.sanitizeArray(value) : this.sanitizeObject(value)
        continue
      }

      if (typeof value !== 'object') {
        result[key] = this.sanitizePrimitive(value)
      }
    }

    return result
  }

  private sanitizeString(str: string, fieldName: string): string {
    if (typeof str !== 'string') return ''

    let cleaned = sanitizeHtml(str, {
      allowedTags: this.config.allowedTags,
      allowedAttributes: this.config.allowedAttributes,
      disallowedTagsMode: this.config.disallowedTagsMode
    })

    // удаление управляющих символов
    cleaned = cleaned.replace(/[\s\S]/g, char => {
      const code = char.charCodeAt(0)
      // ASCII-коды управляющих символов:
      // 0x00-0x08, 0x0B-0x0C, 0x0E-0x1F, 0x7F
      if (
        (code >= 0x00 && code <= 0x08) || // \x00-\x08
        (code >= 0x0b && code <= 0x0c) || // \x0B-\x0C
        (code >= 0x0e && code <= 0x1f) || // \x0E-\x1F
        code === 0x7f // \x7F
      ) {
        return ''
      }
      return char
    })

    const isHeaderField = this.isHeaderField(fieldName)

    if (isHeaderField) {
      cleaned = cleaned
        .replace(SanitizePipe.HEADER_BREAKS_REGEX, ' ')
        .replace(SanitizePipe.MULTIPLE_SPACES_REGEX, ' ')
        .trim()
    } else {
      cleaned = cleaned.replace(/\r\n/g, '\n')
    }

    return cleaned
  }

  private isHeaderField(fieldName: string): boolean {
    if (!fieldName) return false

    const lowerField = fieldName.toLowerCase()

    return (
      this.config.headerFields?.some(header => {
        const fullMatch = lowerField === header.toLowerCase()
        const partMatch = lowerField.includes(header.toLowerCase())
        return fullMatch || partMatch
      }) ?? false
    )
  }
}

@Injectable()
export class SanitizePipeFactory {
  create(config?: Partial<SanitizeConfig>): SanitizePipe {
    return new SanitizePipe(config)
  }
}
