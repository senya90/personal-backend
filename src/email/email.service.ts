import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as nodemailer from 'nodemailer'
import { SendEmailDto } from './dto/send-email.dto'

@Injectable()
export class EmailService {
  constructor(private readonly configService: ConfigService) {}

  async sendEmail(dto: SendEmailDto): Promise<void> {
    const targetEmail = this.configService.get<string>('TARGET_EMAIL')
    if (!targetEmail) {
      throw new InternalServerErrorException('Target Email not found')
    }

    const _secure = this.configService.get<string>('SMTP_SECURE')
    const user = this.configService.get<string>('SMTP_USER', 'your_gmail@gmail.com')

    const transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: Number(this.configService.get<number>('SMTP_PORT', 587)),
      secure: _secure === 'true', // true for port 465
      auth: {
        user,
        pass: this.configService.get<string>('SMTP_PASS', 'your_app_password')
      }
    })

    try {
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
}
