import { Module } from '@nestjs/common'
import { EmailController } from './email.controller'
import { EmailService } from './email.service'
import { FileReaderService } from '@/file-reader/file-reader.service'

@Module({
  controllers: [EmailController],
  providers: [EmailService, FileReaderService]
})
export class EmailModule {}
