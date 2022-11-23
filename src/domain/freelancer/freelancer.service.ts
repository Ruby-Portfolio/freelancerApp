import { Injectable } from '@nestjs/common';
import { FreelancerRepository } from './freelancer.repository';
import { User } from '../user/user.entity';
import { FreelancerAdd, FreelancerSearch } from './freelancer.request';
import { FreelancerList } from './freelancer.response';

@Injectable()
export class FreelancerService {
  constructor(private readonly freelancerRepository: FreelancerRepository) {}

  async addFreelancer(user: User, freelancerAdd: FreelancerAdd): Promise<void> {
    await this.freelancerRepository.insert({
      ...freelancerAdd,
      user,
    });
  }

  async getFreelancers(
    freelancerSearch: FreelancerSearch,
  ): Promise<FreelancerList[]> {
    return this.freelancerRepository.searchFreelancer(freelancerSearch);
  }

  getFreelancerDetail() {}
  updateFreelancerState() {}
  deleteFreelancer() {}
  proposeFreelancer() {}
}
