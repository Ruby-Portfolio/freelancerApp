import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER, CacheModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as redisStore from 'cache-manager-ioredis';
import { Cache } from 'cache-manager';
import { FreelancerCacheService } from '../../../src/domain/freelancer/freelancer.cache';
import { FreelancerSearch } from '../../../src/domain/freelancer/freelancer.request';

describe('FreelancerCacheService', () => {
  let freelancerCacheService: FreelancerCacheService;
  let cacheManager: Cache;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        CacheModule.register({
          store: redisStore,
          host: process.env.REDIS_HOST,
          port: process.env.REDIS_PORT,
          ttl: +process.env.REDIS_TTL,
          isGlobal: true,
        }),
      ],
      providers: [FreelancerCacheService],
    }).compile();

    cacheManager = module.get(CACHE_MANAGER);
    freelancerCacheService = module.get<FreelancerCacheService>(
      FreelancerCacheService,
    );
  });

  describe('getFreelancersCache', () => {
    let testKey: string;
    let cacheData;
    beforeAll(async () => {
      await cacheManager.reset();

      testKey = 'testKey';
      cacheData = { test: 'test' };
      await cacheManager.set(testKey, cacheData);
    });

    test('키에 해당하는 프리랜서 캐시 데이터 조회', async () => {
      const data = await freelancerCacheService.getFreelancersCache(testKey);

      expect(data).toEqual(cacheData);
    });

    test('존재하지 않는 키로 캐시 데이터 조회', async () => {
      const data = await freelancerCacheService.getFreelancersCache(
        'randomKey',
      );

      expect(data).toBeNull();
    });
  });

  describe('getFreelancersCacheKey - 검색어와 페이지 번호를 조합한 캐시 키 생성', () => {
    test('검색어가 없을 경우 검색어를 all 로 설정하여 캐시 키 생성', () => {
      const freelancerSearch: FreelancerSearch = {
        page: 0,
      };

      const cacheKey =
        freelancerCacheService.getFreelancersCacheKey(freelancerSearch);

      expect(cacheKey).toEqual(`freelancers_all_${freelancerSearch.page}`);
    });

    test('검색어와 페이지 번호를 조합한 캐시 키 생성', () => {
      const freelancerSearch: FreelancerSearch = {
        keyword: 'search',
        page: 0,
      };

      const cacheKey =
        freelancerCacheService.getFreelancersCacheKey(freelancerSearch);

      expect(cacheKey).toEqual(
        `freelancers_${freelancerSearch.keyword}_${freelancerSearch.page}`,
      );
    });
  });

  describe('resetFreelancerCache - 프리랜서 관련 캐시 데이터 초기화', () => {
    let testKey: string;
    let cacheData;
    beforeAll(async () => {
      await cacheManager.reset();

      testKey = 'testKey';
      cacheData = { test: 'test' };
      await cacheManager.set(testKey, cacheData);

      for (let i = 0; i < 5; i++) {
        const freelancerKey = `freelancers_key${i}`;
        const freelancerData = { test: 'test' };
        await cacheManager.set(freelancerKey, freelancerData);
      }
    });

    test('키값으로 freelancer 를 접미사로 사용하는 캐시 데이터만 삭제', async () => {
      await freelancerCacheService.resetFreelancerCache();

      const keys = await cacheManager.store.keys('*');

      expect(keys.length).toEqual(1);
      expect(keys).toContain(testKey);
    });
  });
});
