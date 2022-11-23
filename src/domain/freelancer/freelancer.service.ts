import { Injectable } from '@nestjs/common';
import { FreelancerRepository } from './freelancer.repository';
import { User } from '../user/user.entity';
import { FreelancerAdd } from './freelancer.request';

@Injectable()
export class FreelancerService {
  constructor(private readonly freelancerRepository: FreelancerRepository) {}

  async addFreelancer(user: User, freelancerAdd: FreelancerAdd): Promise<void> {
    await this.freelancerRepository.insert({
      ...freelancerAdd,
      user,
    });
  }
  getFreelancers() {}
  getFreelancerDetail() {}
  updateFreelancerState() {}
  deleteFreelancer() {}
  proposeFreelancer() {}
}
