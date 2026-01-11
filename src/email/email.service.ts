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

    const transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com',
      port: this.configService.get<number>('SMTP_PORT') || 587,
      secure: false, // true for port 465
      auth: {
        user: this.configService.get<string>('SMTP_USER') || 'your_gmail@gmail.com',
        pass: this.configService.get<string>('SMTP_PASS') || 'your_app_password'
      }
    })

    try {
      await transporter.sendMail({
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
