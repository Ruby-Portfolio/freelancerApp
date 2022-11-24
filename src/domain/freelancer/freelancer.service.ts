import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { FreelancerRepository } from './freelancer.repository';
import { User } from '../user/user.entity';
import { FreelancerAdd, FreelancerSearch } from './freelancer.request';
import {
  FreelancerDetail,
  FreelancerNameAndPosition,
} from './freelancer.response';
import { FreelancerNotFoundException } from './freelancer.exception';
import { getFreelancerCacheKey } from './freelancer.cache';
import { Cache } from 'cache-manager';
import { InsertResult } from 'typeorm';

@Injectable()
export class FreelancerService {
  constructor(
    private readonly freelancerRepository: FreelancerRepository,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async addFreelancer(user: User, freelancerAdd: FreelancerAdd): Promise<void> {
    const insertResult: InsertResult = await this.freelancerRepository.insert({
      ...freelancerAdd,
      user,
    });

    if (insertResult.raw) {
      await this.cacheManager.reset();
    }
  }

  async getFreelancers(
    freelancerSearch: FreelancerSearch,
  ): Promise<FreelancerNameAndPosition[]> {
    const freelancersCacheKey = getFreelancerCacheKey({
      keyword: freelancerSearch.keyword,
      page: freelancerSearch.page,
    });

    let freelancers: FreelancerNameAndPosition[] = await this.cacheManager.get(
      freelancersCacheKey,
    );

    if (!freelancers) {
      freelancers = await this.freelancerRepository.searchFreelancer(
        freelancerSearch,
      );

      await this.cacheManager.set(freelancersCacheKey, freelancers);
    }

    return freelancers;
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
