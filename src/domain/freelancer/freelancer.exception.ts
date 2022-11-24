import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { HttpStatus } from '@nestjs/common';
import { FreelancerErrorMessage } from './freelancer.message';

export class FreelancerNotFoundException extends HttpException {
  constructor() {
    super(FreelancerErrorMessage.FREELANCER_NOTFOUND, HttpStatus.NOT_FOUND);
  }
}
