import { Repository } from 'typeorm';
import { CustomRepository } from '../../typeorm/typeorm.decorator';
import { Freelancer } from './freelancer.entity';

@CustomRepository(Freelancer)
export class FreelancerRepository extends Repository<Freelancer> {}
