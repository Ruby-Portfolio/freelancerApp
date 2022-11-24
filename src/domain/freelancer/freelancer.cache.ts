import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { FreelancerSearch } from './freelancer.request';
import { FreelancerNameAndPosition } from './freelancer.response';

@Injectable()
export class FreelancerCacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  /**
   * 키에 해당하는 프리랜서 캐시 데이터 조회
   * @param freelancersCacheKey
   */
  async getFreelancersCache(
    freelancersCacheKey: string,
  ): Promise<FreelancerNameAndPosition[]> {
    return await this.cacheManager.get(freelancersCacheKey);
  }

  /**
   * 검색어와 페이지 번호를 조핮한 캐시 키 생성
   * @param keyword
   * @param page
   */
  getFreelancersCacheKey({ keyword, page }: FreelancerSearch) {
    return `freelancers_${keyword || 'all'}_${page}`;
  }

  /**
   * 프리랜서 캐시 데이터 저장
   * @param freelancersCacheKey
   * @param freelancersCache
   */
  async addFreelancerCache(
    freelancersCacheKey: string,
    freelancersCache: FreelancerNameAndPosition[],
  ) {
    await this.cacheManager.set(freelancersCacheKey, freelancersCache);
  }

  /**
   * 프리랜서 관련 캐시데이터 초기화
   */
  async resetFreelancerCache() {
    const freelancerCacheKeys = await this.cacheManager.store.keys(
      'freelancer*',
    );

    for (const key of freelancerCacheKeys) {
      await this.cacheManager.del(key);
    }
  }
}
