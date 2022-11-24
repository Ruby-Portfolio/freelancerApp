import { HttpException, HttpStatus } from '@nestjs/common';
import { CommonErrorMessage } from './common.message';

export class InvalidIdException extends HttpException {
  constructor() {
    super(CommonErrorMessage.INVALID_ID, HttpStatus.BAD_REQUEST);
  }
}
