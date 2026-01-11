import { Module } from '@nestjs/common'
import { EmailModule } from './email/email.module'
import { ThrottlerModule } from '@nestjs/throttler'
import { ConfigModule } from '@nestjs/config'
import { HealthController } from '@/health.controller'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    EmailModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 5
        }
      ]
    })
  ],
  controllers: [HealthController],
  providers: []
})
export class AppModule {}
