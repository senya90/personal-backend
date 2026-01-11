import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import helmet from 'helmet'

async function bootstrap() {
  const port = process.env.PORT || 4000
  const frontend = process.env.CORS_FRONTEND || 'http://localhost:3000'
  const app = await NestFactory.create(AppModule)

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true
    })
  )

  app.use(helmet())

  app.enableCors({
    origin: frontend,
    methods: 'POST',
    credentials: true
  })

  await app.listen(port)
  console.log(`Application is running on: http://localhost:${port}`)
}

bootstrap()
  .then()
  .catch(e => console.error(e))
