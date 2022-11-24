import { Injectable } from '@nestjs/common';
import { FreelancerRepository } from './freelancer.repository';
import { User } from '../user/user.entity';
import { FreelancerAdd, FreelancerSearch } from './freelancer.request';
import {
  FreelancerDetail,
  FreelancerNameAndPosition,
} from './freelancer.response';
import { FreelancerNotFoundException } from './freelancer.exception';
import { FreelancerCacheService } from './freelancer.cache';
import { InsertResult } from 'typeorm';

@Injectable()
export class FreelancerService {
  constructor(
    private readonly freelancerRepository: FreelancerRepository,
    private readonly freelancerCacheService: FreelancerCacheService, // @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async addFreelancer(user: User, freelancerAdd: FreelancerAdd): Promise<void> {
    const insertResult: InsertResult = await this.freelancerRepository.insert({
      ...freelancerAdd,
      user,
    });

    if (insertResult.raw) {
      await this.freelancerCacheService.resetFreelancerCache();
    }
  }

  async getFreelancers(
    freelancerSearch: FreelancerSearch,
  ): Promise<FreelancerNameAndPosition[]> {
    const freelancersCacheKey =
      this.freelancerCacheService.getFreelancersCacheKey(freelancerSearch);

    let freelancers: FreelancerNameAndPosition[] =
      await this.freelancerCacheService.getFreelancersCache(
        freelancersCacheKey,
      );

    if (!freelancers) {
      freelancers = await this.freelancerRepository.searchFreelancer(
        freelancerSearch,
      );

      await this.freelancerCacheService.addFreelancerCache(
        freelancersCacheKey,
        freelancers,
      );
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
