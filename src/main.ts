import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { RequestMethod, ValidationPipe, VersioningType } from '@nestjs/common'
import helmet from 'helmet'

async function bootstrap() {
  const port = process.env.PORT || 4000
  const frontend = process.env.CORS_FRONTEND || 'http://localhost:3000'
  const app = await NestFactory.create(AppModule)

  app.setGlobalPrefix('api', { exclude: [{ path: 'health', method: RequestMethod.GET }] })
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'v'
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
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
