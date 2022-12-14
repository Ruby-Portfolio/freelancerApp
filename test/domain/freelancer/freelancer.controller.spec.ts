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
    describe('????????? ?????? ?????? ???????????? ??????', () => {
      test('????????? ?????? ?????? ???????????? ????????? 401 ??????', async () => {
        return request(app.getHttpServer())
          .post('/api/freelancers')
          .send({
            aboutMe: '????????? Ruby ?????????.',
            career: '?????????????????? 1??? 7??????',
            skills: 'Java',
            position: Position.BACK_END,
          })
          .expect(HttpStatus.UNAUTHORIZED);
      });
    });

    describe('????????? ???????????? ??????', () => {
      describe('?????? ??????', () => {
        test('????????? ????????? ?????? ????????? ?????? 400 ??????', async () => {
          const res = await request(app.getHttpServer())
            .post('/api/freelancers')
            .send({
              aboutMe: '',
              career: '',
              skills: '',
              position: '??????????????????',
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

      describe('?????? ??????', () => {
        beforeAll(async () => {
          await cacheManager.reset();
          await cacheManager.set('freelancer1', { test: 'test' });
          await cacheManager.set('freelancer2', { test: 'test' });
        });

        test('?????? ??????', async () => {
          const freelancerAdd: FreelancerAdd = {
            aboutMe: '????????? Ruby ?????????.',
            career: '?????????????????? 1??? 7??????',
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

          const cacheData = await cacheManager.get('freelancer1');
          expect(cacheData).toBeNull();
        });
      });
    });
  });

  describe('/GET /api/freelancers', () => {
    describe('????????? ?????? ?????? ???????????? ??????', () => {
      test('????????? ?????? ?????? ???????????? ????????? 401 ??????', async () => {
        return request(app.getHttpServer())
          .get('/api/freelancers')
          .send({
            search: '?????????',
            page: 0,
          })
          .expect(HttpStatus.UNAUTHORIZED);
      });
    });

    describe('????????? ???????????? ??????', () => {
      describe('?????? ??????', () => {
        test('????????? ????????? 0 ????????? ?????? 400 ??????', async () => {
          const res = await request(app.getHttpServer())
            .get('/api/freelancers')
            .query({
              page: -1,
            })
            .set('Cookie', [`Authentication=${token}`])
            .expect(HttpStatus.BAD_REQUEST);

          expect(res.body.message).toContain(CommonErrorMessage.INVALID_PAGE);
        });

        test('????????? ????????? ????????? ?????? ?????? 400 ??????', async () => {
          const res = await request(app.getHttpServer())
            .get('/api/freelancers')
            .query({
              page: '????????? ??????',
            })
            .set('Cookie', [`Authentication=${token}`])
            .expect(HttpStatus.BAD_REQUEST);

          expect(res.body.message).toContain(CommonErrorMessage.INVALID_PAGE);
        });
      });
      describe('?????? ??????', () => {
        beforeAll(async () => {
          for (let i = 0; i < 12; i++) {
            await freelancerRepository.insert({
              aboutMe: `????????? ${i}?????????.`,
              career: `?????? ?????? ${i}??????`,
              skills: 'javaScript',
              position: Position.FRONT_END,
              user,
            });
          }

          for (let i = 0; i < 12; i++) {
            await freelancerRepository.insert({
              aboutMe: `????????? ${i}?????????.`,
              career: `?????? ?????? ${i}??????`,
              skills: 'C#',
              position: Position.BACK_END,
              user,
            });
          }
        });

        test('???????????? ???????????? ?????? ?????? ?????? ????????? ???????????? ??????', async () => {
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

        test('????????? ????????? ???????????? ?????? ?????? ??? ???????????? ??????', async () => {
          const freelancerSearch: FreelancerSearch = {
            keyword: '?????????',
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

        test('???????????? ????????? ????????? ???????????? ?????? ??????', async () => {
          const freelancerSearch: FreelancerSearch = {
            keyword: '?????????',
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

        describe('?????? ??????', () => {
          let agent;
          let freelancerSearch: FreelancerSearch;
          let freelancers: FreelancerNameAndPosition[];

          beforeAll(async () => {
            freelancerSearch = {
              keyword: '?????????',
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

          test('????????? ????????? ???????????? ?????? ?????? ???????????? ??????', async () => {
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
    describe('????????? ?????? ?????? ???????????? ??????', () => {
      test('????????? ?????? ?????? ???????????? ????????? 401 ??????', async () => {
        return request(app.getHttpServer())
          .get(`/api/freelancers/3`)
          .expect(HttpStatus.UNAUTHORIZED);
      });
    });
    describe('????????? ???????????? ??????', () => {
      let freelancer: Freelancer;
      beforeAll(async () => {
        freelancer = await freelancerRepository.save({
          aboutMe: `????????? Ruby ?????????.`,
          career: `?????? ?????? 1??? 7??????`,
          skills: 'javaScript',
          position: Position.BACK_END,
          user,
        });
      });

      describe('?????? ??????', () => {
        test('id ?????? ????????? ?????? ?????? 400 ??????', async () => {
          const res = await request(app.getHttpServer())
            .get(`/api/freelancers/userId`)
            .set('Cookie', [`Authentication=${token}`])
            .expect(HttpStatus.BAD_REQUEST);

          expect(res.body.message).toContain(CommonErrorMessage.INVALID_ID);
        });

        test('id ?????? 0 ????????? ????????? ?????? 400 ??????', async () => {
          const res = await request(app.getHttpServer())
            .get(`/api/freelancers/0`)
            .set('Cookie', [`Authentication=${token}`])
            .expect(HttpStatus.BAD_REQUEST);

          expect(res.body.message).toContain(CommonErrorMessage.INVALID_ID);
        });

        test('???????????? ?????? ???????????? id ??? ????????? 404 ??????', async () => {
          const res = await request(app.getHttpServer())
            .get(`/api/freelancers/${freelancer.id + 999}`)
            .set('Cookie', [`Authentication=${token}`])
            .expect(HttpStatus.NOT_FOUND);

          expect(res.body.message).toEqual(
            FreelancerErrorMessage.FREELANCER_NOTFOUND,
          );
        });
      });

      describe('?????? ??????', () => {
        test('???????????? ?????? ?????? ??????', async () => {
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
