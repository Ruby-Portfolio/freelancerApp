import { Test, TestingModule } from '@nestjs/testing';
import {
  CACHE_MANAGER,
  CacheModule,
  HttpStatus,
  INestApplication,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../../src/domain/user/user.entity';
import { Freelancer } from '../../../src/domain/freelancer/freelancer.entity';
import { JobPosting } from '../../../src/domain/jobPosting/jobPosting.entity';
import { SupportHistory } from '../../../src/domain/supportHistory/supportHistory.entity';
import { AuthModule } from '../../../src/auth/auth.module';
import { FreelancerModule } from '../../../src/domain/freelancer/freelancer.module';
import { UserRepository } from '../../../src/domain/user/user.repository';
import { FreelancerRepository } from '../../../src/domain/freelancer/freelancer.repository';
import { CustomTypeOrmModule } from '../../../src/typeorm/typeorm.module';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { Payload } from '../../../src/auth/jwt/jwt.payload';
import * as cookieParser from 'cookie-parser';
import {
  FreelancerAdd,
  FreelancerSearch,
} from '../../../src/domain/freelancer/freelancer.request';
import { pipeConfig } from '../../../src/config/pipeConfig';
import { interceptorConfig } from '../../../src/config/interceptorConfig';
import { FreelancerErrorMessage } from '../../../src/domain/freelancer/freelancer.message';
import { Position } from '../../../src/domain/freelancer/freelancer.enum';
import { CommonErrorMessage } from '../../../src/common/error/common.message';
import {
  FreelancerDetail,
  FreelancerNameAndPosition,
} from '../../../src/domain/freelancer/freelancer.response';
import * as redisStore from 'cache-manager-ioredis';
import { Cache } from 'cache-manager';
import { FreelancerService } from '../../../src/domain/freelancer/freelancer.service';

describe('FreelancerController', () => {
  let app: INestApplication;
  let userRepository: UserRepository;
  let freelancerRepository: FreelancerRepository;
  let freelancerService: FreelancerService;
  let jwtService: JwtService;
  let user: User;
  let token: string;
  let cacheManager: Cache;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        TypeOrmModule.forRoot({
          type: 'mysql',
          host: process.env.DB_HOST,
          port: +process.env.DB_PORT,
          username: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_DATABASE,
          entities: [User, Freelancer, JobPosting, SupportHistory],
          charset: 'utf8mb4',
          synchronize: true,
          logging: true,
        }),
        CacheModule.register({
          store: redisStore,
          host: process.env.REDIS_HOST,
          port: process.env.REDIS_PORT,
          ttl: +process.env.REDIS_TTL,
          isGlobal: true,
        }),
        AuthModule,
        FreelancerModule,
        CustomTypeOrmModule.forCustomRepository([
          UserRepository,
          FreelancerRepository,
        ]),
      ],
    }).compile();

    app = module.createNestApplication();
    app.use(cookieParser());
    app.setGlobalPrefix('api', { exclude: ['auth'] });
    pipeConfig(app);
    interceptorConfig(app);
    await app.init();

    userRepository = module.get<UserRepository>(UserRepository);
    freelancerRepository =
      module.get<FreelancerRepository>(FreelancerRepository);
    freelancerService = module.get<FreelancerService>(FreelancerService);
    jwtService = module.get<JwtService>(JwtService);
    cacheManager = module.get(CACHE_MANAGER);

    await freelancerRepository.delete({});
    await userRepository.delete({});
    user = await userRepository.save({
      provider: 'google',
      providerId: '109809304291112359201',
      name: 'Ruby',
      email: 'rubykim0723@gmail.com',
    });
    token = jwtService.sign({ ...user } as Payload);
  });

  describe('/POST /api/freelancers', () => {
    describe('인증이 되지 않은 사용자의 요청', () => {
      test('인증이 되지 않은 사용자의 요청시 401 응답', async () => {
        await request(app.getHttpServer())
          .post('/api/freelancers')
          .send({
            aboutMe: '개발자 Ruby 입니다.',
            career: '엠브이소프텍 1년 7개월',
            skills: 'Java',
            position: Position.BACK_END,
          })
          .expect(HttpStatus.UNAUTHORIZED);
      });
    });

    describe('인증된 사용자의 요청', () => {
      describe('요청 실패', () => {
        test('요청에 필요한 값이 잘못된 경우 400 응답', async () => {
          const res = await request(app.getHttpServer())
            .post('/api/freelancers')
            .send({
              aboutMe: '',
              career: '',
              skills: '',
              position: '이상한포지션',
            })
            .set('Cookie', [`Authentication=${token}`])
            .expect(HttpStatus.BAD_REQUEST);

          const errorMessages = res.body.message;
          expect(errorMessages).toContain(
            FreelancerErrorMessage.ABOUT_ME_EMPTY,
          );
          expect(errorMessages).toContain(FreelancerErrorMessage.CAREER_EMPTY);
          expect(errorMessages).toContain(FreelancerErrorMessage.SKILLS_EMPTY);
          expect(errorMessages).toContain(
            FreelancerErrorMessage.POSITION_INVALID,
          );
        });
      });

      describe('요청 성공', () => {
        const cacheTestKey = 'cacheTestKey';
        beforeAll(() => {
          cacheManager.reset();
          cacheManager.set(cacheTestKey, 'cacheTest');
        });

        test('요청 성공', async () => {
          const freelancerAdd: FreelancerAdd = {
            aboutMe: '개발자 Ruby 입니다.',
            career: '엠브이소프텍 1년 7개월',
            skills: 'Java',
            position: Position.BACK_END,
          };

          await request(app.getHttpServer())
            .post('/api/freelancers')
            .send(freelancerAdd)
            .set('Cookie', [`Authentication=${token}`])
            .expect(201);

          const freelancers = await freelancerRepository.findBy({});
          expect(freelancers.length).toEqual(1);
          expect(freelancers[0].aboutMe).toEqual(freelancerAdd.aboutMe);
          expect(freelancers[0].career).toEqual(freelancerAdd.career);
          expect(freelancers[0].skills).toEqual(freelancerAdd.skills);
          expect(freelancers[0].position).toEqual(freelancerAdd.position);
          expect(freelancers[0].userId).toEqual(user.id);

          const cacheData = await cacheManager.get('cacheTestKey');
          expect(cacheData).toBeNull();
        });
      });
    });
  });

  describe('/GET /api/freelancers', () => {
    describe('인증이 되지 않은 사용자의 요청', () => {
      test('인증이 되지 않은 사용자의 요청시 401 응답', async () => {
        await request(app.getHttpServer())
          .get('/api/freelancers')
          .send({
            search: '백엔드',
            page: 0,
          })
          .expect(HttpStatus.UNAUTHORIZED);
      });
    });

    describe('인증된 사용자의 요청', () => {
      describe('요청 실패', () => {
        test('페이지 번호가 0 이하일 경우 400 응답', async () => {
          const res = await request(app.getHttpServer())
            .get('/api/freelancers')
            .query({
              page: -1,
            })
            .set('Cookie', [`Authentication=${token}`])
            .expect(HttpStatus.BAD_REQUEST);

          expect(res.body.message).toContain(CommonErrorMessage.INVALID_PAGE);
        });

        test('페이지 번호가 숫자가 아닐 경우 400 응답', async () => {
          const res = await request(app.getHttpServer())
            .get('/api/freelancers')
            .query({
              page: '페이지 번호',
            })
            .set('Cookie', [`Authentication=${token}`])
            .expect(HttpStatus.BAD_REQUEST);

          expect(res.body.message).toContain(CommonErrorMessage.INVALID_PAGE);
        });
      });
      describe('요청 성공', () => {
        beforeAll(() => {
          for (let i = 0; i < 12; i++) {
            freelancerRepository.insert({
              aboutMe: `개발자 ${i}입니다.`,
              career: `개발 경력 ${i}개월`,
              skills: 'javaScript',
              position: Position.FRONT_END,
              user,
            });
          }

          for (let i = 0; i < 12; i++) {
            freelancerRepository.insert({
              aboutMe: `개발자 ${i}입니다.`,
              career: `개발 경력 ${i}개월`,
              skills: 'C#',
              position: Position.BACK_END,
              user,
            });
          }
        });

        test('검색어를 입력하지 않을 경우 전체 목록을 대상으로 검색', async () => {
          const freelancerSearch: FreelancerSearch = {
            page: 0,
          };

          const res = await request(app.getHttpServer())
            .get('/api/freelancers')
            .query(freelancerSearch)
            .set('Cookie', [`Authentication=${token}`])
            .expect(HttpStatus.OK);

          const freelancers = res.body;

          expect(freelancers.length).toEqual(10);
          expect(freelancers[0].username).toEqual(user.name);
          expect(freelancers[0].position).toEqual(Position.BACK_END);
        });

        test('페이지 번호를 입력하지 않을 경우 첫 페이지를 조회', async () => {
          const freelancerSearch: FreelancerSearch = {
            keyword: '프론트',
          };

          const res = await request(app.getHttpServer())
            .get('/api/freelancers')
            .query(freelancerSearch)
            .set('Cookie', [`Authentication=${token}`])
            .expect(HttpStatus.OK);

          const freelancers = res.body;

          expect(freelancers.length).toEqual(10);
          expect(freelancers[0].username).toEqual(user.name);
          expect(freelancers[0].position).toEqual(Position.FRONT_END);
        });

        test('검색어와 페이지 번호에 해당하는 목록 조회', async () => {
          const freelancerSearch: FreelancerSearch = {
            keyword: '프론트',
            page: 1,
          };

          const res = await request(app.getHttpServer())
            .get('/api/freelancers')
            .query(freelancerSearch)
            .set('Cookie', [`Authentication=${token}`])
            .expect(HttpStatus.OK);

          const freelancers = res.body;

          expect(freelancers.length).toEqual(2);
          expect(freelancers[0].username).toEqual(user.name);
          expect(freelancers[0].position).toEqual(Position.FRONT_END);
        });

        describe('캐시 조회', () => {
          let agent;
          let freelancerSearch: FreelancerSearch;
          let freelancers: FreelancerNameAndPosition[];

          beforeAll(async () => {
            freelancerSearch = {
              keyword: '프론트',
              page: 1,
            };

            await cacheManager.reset();
            agent = await request.agent(app.getHttpServer());
            const res = await agent
              .get('/api/freelancers')
              .query(freelancerSearch)
              .set('Cookie', [`Authentication=${token}`])
              .expect(HttpStatus.OK);
            freelancers = res.body;
          });

          test('캐시에 저장된 데이터가 있을 경우 캐시에서 조회', async () => {
            jest
              .spyOn(freelancerRepository, 'searchFreelancer')
              .mockResolvedValue(Promise.resolve([]));

            const res = await agent
              .get('/api/freelancers')
              .query(freelancerSearch)
              .set('Cookie', [`Authentication=${token}`])
              .expect(HttpStatus.OK);

            expect(JSON.stringify(res.body)).toEqual(
              JSON.stringify(freelancers),
            );
          });
        });
      });
    });
  });

  describe('/GET /api/freelancers/:userId', () => {
    describe('인증이 되지 않은 사용자의 요청', () => {
      test('인증이 되지 않은 사용자의 요청시 401 응답', async () => {
        await request(app.getHttpServer())
          .get(`/api/freelancers/3`)
          .expect(HttpStatus.UNAUTHORIZED);
      });
    });
    describe('인증된 사용자의 요청', () => {
      let freelancer: Freelancer;
      beforeAll(async () => {
        freelancer = await freelancerRepository.save({
          aboutMe: `개발자 Ruby 입니다.`,
          career: `개발 경력 1년 7개월`,
          skills: 'javaScript',
          position: Position.BACK_END,
          user,
        });
      });

      describe('요청 실패', () => {
        test('id 값이 숫자가 아닐 경우 400 응답', async () => {
          const res = await request(app.getHttpServer())
            .get(`/api/freelancers/userId`)
            .set('Cookie', [`Authentication=${token}`])
            .expect(HttpStatus.BAD_REQUEST);

          expect(res.body.message).toContain(CommonErrorMessage.INVALID_ID);
        });

        test('id 값이 0 이하의 숫자일 경우 400 응답', async () => {
          const res = await request(app.getHttpServer())
            .get(`/api/freelancers/0`)
            .set('Cookie', [`Authentication=${token}`])
            .expect(HttpStatus.BAD_REQUEST);

          expect(res.body.message).toContain(CommonErrorMessage.INVALID_ID);
        });

        test('존재하지 않는 프리랜서 id 로 요청시 404 응답', async () => {
          const res = await request(app.getHttpServer())
            .get(`/api/freelancers/${freelancer.id + 999}`)
            .set('Cookie', [`Authentication=${token}`])
            .expect(HttpStatus.NOT_FOUND);

          expect(res.body.message).toEqual(
            FreelancerErrorMessage.FREELANCER_NOTFOUND,
          );
        });
      });

      describe('요청 성공', () => {
        test('프리랜서 정보 상세 조회', async () => {
          const res = await request(app.getHttpServer())
            .get(`/api/freelancers/${freelancer.id}`)
            .set('Cookie', [`Authentication=${token}`])
            .expect(HttpStatus.OK);

          const freelancerDetail: FreelancerDetail = res.body;

          expect(freelancerDetail.username).toEqual(user.name);
          expect(freelancerDetail.email).toEqual(user.email);
          expect(freelancerDetail.position).toEqual(freelancer.position);
          expect(freelancerDetail.aboutMe).toEqual(freelancer.aboutMe);
          expect(freelancerDetail.career).toEqual(freelancer.career);
          expect(freelancerDetail.skills).toEqual(freelancer.skills);
        });
      });
    });
  });
});
