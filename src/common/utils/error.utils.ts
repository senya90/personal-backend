export const ErrorUtils = {
  getErrorMessage: function (error: unknown, fallback = 'Unknown error'): string {
    if (error instanceof Error) return error.message

    if (typeof error === 'string') return error

    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as any).message)
    }

    return fallback
  }
}
