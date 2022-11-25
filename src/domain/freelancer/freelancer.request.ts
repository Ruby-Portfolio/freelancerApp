import { PickType } from '@nestjs/swagger';
import { Freelancer } from './freelancer.entity';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { IsPage } from '../../common/validation/validation.decorator';
import { CommonErrorMessage } from '../../common/error/common.message';

export class FreelancerAdd extends PickType(Freelancer, [
  'aboutMe',
  'career',
  'skills',
  'position',
] as const) {}

export class FreelancerSearch {
  @IsOptional()
  keyword?: string = '';

  @IsPage({ message: CommonErrorMessage.INVALID_PAGE, nullable: true })
  @Type(() => Number)
  page?: number = 0;
}
