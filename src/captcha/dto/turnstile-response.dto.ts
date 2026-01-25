export interface TurnstileResponse {
  success: boolean
  'error-codes': string[]
  challenge_ts?: string
  hostname?: string
  action?: string
  cdata?: string
}
