import { Repository } from 'typeorm';
import { CustomRepository } from '../../typeorm/typeorm.decorator';
import { Freelancer } from './freelancer.entity';
import { FreelancerSearch } from './freelancer.request';
import { User } from '../user/user.entity';
import { FreelancerList } from './freelancer.response';

@CustomRepository(Freelancer)
export class FreelancerRepository extends Repository<Freelancer> {
  private readonly PAGE_SIZE = 10;

  async searchFreelancer({
    keyword,
    page = 0,
  }: FreelancerSearch): Promise<FreelancerList[]> {
    const skip = page * this.PAGE_SIZE;

    return this.createQueryBuilder('freelancer')
      .innerJoinAndSelect(User, 'user', 'user.id = freelancer.userId')
      .select(['user.name as username', 'freelancer.position as position'])
      .where('freelancer.position LIKE :keyword', { keyword: `%${keyword}%` })
      .orWhere('freelancer.skills LIKE :keyword', { keyword: `%${keyword}%` })
      .offset(skip)
      .limit(this.PAGE_SIZE)
      .orderBy('freelancer.id', 'DESC')
      .getRawMany();
  }
}
