import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as nodemailer from 'nodemailer'
import { SendEmailDto } from './dto/send-email.dto'
import { FileReaderService } from '@/file-reader/file-reader.service'

@Injectable()
export class EmailService {
  private readonly logger = new Logger(FileReaderService.name)

  constructor(
    private readonly configService: ConfigService,
    private readonly fileReader: FileReaderService
  ) {}

  async sendEmail(dto: SendEmailDto): Promise<void> {
    try {
      const { host, port, secure, user, password, targetEmail } = await this.getSmtpCredential()

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass: password
        }
      })

      await transporter.sendMail({
        from: user,
        to: targetEmail,
        subject: dto.theme,
        text: `От: ${dto.email}\n\nТема: ${dto.theme}\n\n${dto.description}`
      })
    } catch (error) {
      if (error instanceof Error) {
        throw new InternalServerErrorException('Send email error: ' + error.message)
      }

      if (typeof error === 'string') {
        throw new InternalServerErrorException('Send email errorl: ' + error)
      }

      throw new InternalServerErrorException('Send email error')
    }
  }

  private async getSmtpCredential(): Promise<{
    port: number
    secure: boolean
    host: string
    user: string
    password: string
    targetEmail: string
  }> {
    const secure = this.configService.get<string>('SMTP_SECURE') // true for port 465
    const port = Number(this.configService.get<number>('SMTP_PORT', 587))
    const host = this.configService.get<string>('SMTP_HOST')

    if (!host) {
      throw new InternalServerErrorException('SMTP host not found')
    }

    const targetEmailFile = this.configService.get<string>('TARGET_EMAIL_FILE')
    const smtpUserFile = this.configService.get<string>('SMTP_USER_FILE')
    const smtpPasswordFile = this.configService.get<string>('SMTP_PASS_FILE')
    if (!targetEmailFile || !smtpUserFile || !smtpPasswordFile) {
      throw new InternalServerErrorException('Credentials files not found')
    }

    try {
      const [user, password, targetEmail] = await Promise.all([
        this.fileReader.readFile(smtpUserFile),
        this.fileReader.readFile(smtpPasswordFile),
        this.fileReader.readFile(targetEmailFile)
      ])

      if (!user || !password || !targetEmail) {
        throw new InternalServerErrorException('Credential data is lost')
      }

      return {
        port,
        secure: secure === 'true',
        host,
        user,
        password,
        targetEmail
      }
    } catch (error) {
      const message = 'Credentials error'
      this.logger.error(message, error)
      throw new InternalServerErrorException(
        error instanceof Error ? `${message}: ${error.message}` : message
      )
    }
  }
}
