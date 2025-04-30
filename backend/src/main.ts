import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors({
    origin: ['http://localhost:5000', 'http://127.0.0.1:5000'],
    credentials: true,
  })
  app.useGlobalPipes(new ValidationPipe())
  await app.listen(3001)
}
bootstrap()
