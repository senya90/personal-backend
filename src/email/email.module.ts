import { Module } from '@nestjs/common'
import { EmailController } from './email.controller'
import { EmailService } from './email.service'
import { FileModule } from '@/file/file.module'
import { CaptchaModule } from '@/captcha/captcha.module'

@Module({
  imports: [FileModule, CaptchaModule],
  controllers: [EmailController],
  providers: [EmailService]
})
export class EmailModule {}
