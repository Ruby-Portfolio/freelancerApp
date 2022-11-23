import { Injectable } from '@nestjs/common';
import { FreelancerRepository } from './freelancer.repository';
import { User } from '../user/user.entity';
import { FreelancerAdd, FreelancerSearch } from './freelancer.request';
import { Freelancer } from './freelancer.entity';

@Injectable()
export class FreelancerService {
  constructor(private readonly freelancerRepository: FreelancerRepository) {}

  async addFreelancer(user: User, freelancerAdd: FreelancerAdd): Promise<void> {
    await this.freelancerRepository.insert({
      ...freelancerAdd,
      user,
    });
  }

  async getFreelancers(freelancerSearch: FreelancerSearch) {}

  getFreelancerDetail() {}
  updateFreelancerState() {}
  deleteFreelancer() {}
  proposeFreelancer() {}
}
