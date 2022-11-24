import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  ValidationPipe,
} from '@nestjs/common';
import { InvalidIdException } from '../error/common.exception';

/**
 * 요청시 검증을 위한 ValidationPipe 의 Global 적용
 * @param app
 */
export const validationPipe = (app): void => {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
};

@Injectable()
export class IdPipe implements PipeTransform {
  isId(id: number) {
    return id > 0;
  }

  transform(id: number, metadata: ArgumentMetadata): number {
    if (this.isId(id)) {
      return id;
    }

    throw new InvalidIdException();
  }
}
