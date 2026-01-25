import { CaptchaService } from '@/captcha/captcha.service'
import { FileModule } from '@/file/file.module'
import { Module, Global } from '@nestjs/common'

@Global()
@Module({
  imports: [FileModule],
  providers: [CaptchaService],
  exports: [CaptchaService]
})
export class CaptchaModule {}
