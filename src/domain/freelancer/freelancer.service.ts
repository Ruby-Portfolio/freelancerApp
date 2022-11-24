import { Injectable } from '@nestjs/common';
import { FreelancerRepository } from './freelancer.repository';
import { User } from '../user/user.entity';
import { FreelancerAdd, FreelancerSearch } from './freelancer.request';
import {
  FreelancerDetail,
  FreelancerNameAndPosition,
} from './freelancer.response';
import { FreelancerNotFoundException } from './freelancer.exception';

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
  ): Promise<FreelancerNameAndPosition[]> {
    return this.freelancerRepository.searchFreelancer(freelancerSearch);
  }

  async getFreelancerDetail(freelancerId: number): Promise<FreelancerDetail> {
    const freelancerDetail = await this.freelancerRepository.findDetailById(
      freelancerId,
    );

    if (freelancerDetail) {
      return freelancerDetail;
    }

    throw new FreelancerNotFoundException();
  }

  proposeFreelancer() {}
}
