import { Controller, Post, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common'
import { EmailService } from './email.service'
import { ThrottlerGuard } from '@nestjs/throttler'
import { UseGuards } from '@nestjs/common'
import { SendEmailDto } from '@/email/dto/send-email.dto'

@Controller({ path: 'email', version: '1' })
@UseGuards(ThrottlerGuard)
export class EmailController {
  private readonly logger = new Logger(EmailController.name)

  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  async sendEmail(@Body() sendEmailDto: SendEmailDto): Promise<{ message: string }> {
    this.logger.log(`Received a request to send: ${JSON.stringify(sendEmailDto)}`)

    try {
      await this.emailService.sendEmail(sendEmailDto)
      return { message: 'The letter was sent successfully' }
    } catch (error) {
      this.logger.error('Sending error', error)
      throw error
    }
  }
}
