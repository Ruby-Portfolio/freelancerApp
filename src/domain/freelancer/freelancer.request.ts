import { PickType } from '@nestjs/swagger';
import { Freelancer } from './freelancer.entity';

export class FreelancerAdd extends PickType(Freelancer, [
  'aboutMe',
  'career',
  'skills',
  'position',
] as const) {}

export class FreelancerSearch {
  keyword: string;
  page: number = 0;
}
