import { TurnstileResponse } from '@/captcha/dto/turnstile-response.dto'
import { VerifyCaptchaDto } from '@/captcha/dto/verify-captcha.dto'
import { ErrorUtils } from '@/common/utils/error.utils'
import { StringUtils } from '@/common/utils/string/string.utils'
import { FileReaderService } from '@/file/file-reader.service'
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class CaptchaService {
  private readonly logger = new Logger(CaptchaService.name)

  constructor(
    private configService: ConfigService,
    private fileReader: FileReaderService
  ) {}

  async verify(dto: VerifyCaptchaDto): Promise<boolean> {
    try {
      const { secretKey, verificatorUrl } = await this.getSecretKey()

      if (!secretKey) {
        this.logger.error('Turnstile secret key is missing')
        return false
      }

      if (!dto.token) {
        this.logger.warn('Captcha token is missing in verification request')
        return false
      }

      const payload = {
        secret: secretKey,
        response: dto.token,
        ...(dto.remoteIp && { remoteip: dto.remoteIp })
      }

      const tokenLogView = StringUtils.truncate(dto.token, { maxLength: 20 })
      this.logger.debug(`Verifying captcha token: ${tokenLogView}`)

      const response = await fetch(verificatorUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result: TurnstileResponse = await response.json()

      if (!result.success) {
        this.logger.warn('Captcha verification failed', {
          errors: result['error-codes'],
          token: tokenLogView
        })
        return false
      }

      this.logger.log('Captcha verification successful', {
        hostname: result.hostname,
        action: result.action,
        timestamp: result.challenge_ts
      })
      return true
    } catch (error) {
      this.logger.error('Failed to verify captcha with Cloudflare', {
        error: ErrorUtils.getErrorMessage(error),
        token: StringUtils.truncate(dto.token, { maxLength: 20 })
      })
      return false
    }
  }

  async verifyToken(token: string): Promise<boolean> {
    return this.verify({ token })
  }

  private async getSecretKey(): Promise<{
    secretKey: string | null
    verificatorUrl: string
  }> {
    try {
      const turnstileSecretKeyFile = this.configService.get<string>(
        'CLOUDFLARE_TURNSTILE_SECRET_KEY_FILE'
      )

      const verificatorUrl = this.configService.get<string>(
        'CLOUDFLARE_TURNSTILE_VERIFY_URL',
        'https://challenges.cloudflare.com/turnstile/v0/siteverify'
      )

      if (!turnstileSecretKeyFile) {
        const message =
          'CLOUDFLARE_TURNSTILE_SECRET_KEY_FILE is not configured in environment variables'
        this.logger.warn(message)
        throw new InternalServerErrorException(message)
      }

      const secretKey = await this.fileReader.readFile(turnstileSecretKeyFile)

      return {
        secretKey,
        verificatorUrl
      }
    } catch (error) {
      this.logger.debug(error)
      throw new InternalServerErrorException(error)
    }
  }
}
