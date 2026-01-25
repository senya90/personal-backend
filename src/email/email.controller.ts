import { Controller, Post, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common'
import { EmailService } from './email.service'
import { ThrottlerGuard } from '@nestjs/throttler'
import { UseGuards } from '@nestjs/common'
import { SendEmailDto } from '@/email/dto/send-email.dto'
import { StringUtils } from '@/common/utils/string/string.utils'

@Controller({ path: 'email', version: '1' })
@UseGuards(ThrottlerGuard)
export class EmailController {
  private readonly logger = new Logger(EmailController.name)

  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  @HttpCode(HttpStatus.NO_CONTENT)
  async sendEmail(@Body() sendEmailDto: SendEmailDto): Promise<void> {
    this.logger.log(
      `Email send request from: ${sendEmailDto.email}, subject: "${StringUtils.truncate(sendEmailDto.theme)}"`
    )
    await this.emailService.sendEmail(sendEmailDto)
  }
}
