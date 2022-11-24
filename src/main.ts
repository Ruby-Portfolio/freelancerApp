import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { pipeConfig } from './config/pipeConfig';
import { interceptorConfig } from './config/interceptorConfig';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  pipeConfig(app);
  interceptorConfig(app);

  const port = process.env.PORT;
  await app.listen(port);

  app.setGlobalPrefix('api', { exclude: ['auth'] });
}
bootstrap();
