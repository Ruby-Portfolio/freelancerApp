import { PickType } from '@nestjs/swagger';
import { Freelancer } from './freelancer.entity';

export class FreelancerAdd extends PickType(Freelancer, [
  'aboutMe',
  'career',
  'skills',
] as const) {}
