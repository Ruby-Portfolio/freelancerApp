import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../../src/domain/user/user.entity';
import { Freelancer } from '../../../src/domain/freelancer/freelancer.entity';
import { JobPosting } from '../../../src/domain/jobPosting/jobPosting.entity';
import { SupportHistory } from '../../../src/domain/supportHistory/supportHistory.entity';
import { UserRepository } from '../../../src/domain/user/user.repository';
import { FreelancerRepository } from '../../../src/domain/freelancer/freelancer.repository';
import { CustomTypeOrmModule } from '../../../src/typeorm/typeorm.module';
import { Position } from '../../../src/domain/freelancer/freelancer.enum';
import { FreelancerSearch } from '../../../src/domain/freelancer/freelancer.request';
import { FreelancerDetail } from '../../../src/domain/freelancer/freelancer.response';

describe('FreelancerRepository', () => {
  let app: INestApplication;
  let userRepository: UserRepository;
  let freelancerRepository: FreelancerRepository;

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
        CustomTypeOrmModule.forCustomRepository([
          UserRepository,
          FreelancerRepository,
        ]),
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    userRepository = module.get<UserRepository>(UserRepository);
    freelancerRepository =
      module.get<FreelancerRepository>(FreelancerRepository);

    await freelancerRepository.delete({});
    await userRepository.delete({});
  });

  describe('searchFreelancer - 프리랜서 목록 조회', () => {
    beforeAll(async () => {
      const user = await userRepository.save({
        provider: 'google',
        providerId: '109809304291112359201',
        name: 'Ruby',
        email: 'rubykim0723@gmail.com',
      });

      for (let i = 0; i < 12; i++) {
        await freelancerRepository.insert({
          aboutMe: `개발자 ${i}입니다.`,
          career: `개발 경력 ${i}개월`,
          skills: 'javaScript',
          position: Position.FRONT_END,
          user,
        });
      }

      for (let i = 0; i < 12; i++) {
        await freelancerRepository.insert({
          aboutMe: `개발자 ${i}입니다.`,
          career: `개발 경력 ${i}개월`,
          skills: 'C#',
          position: Position.BACK_END,
          user,
        });
      }
    });

    test('검색어가 기술에 포함되는 프리랜서 목록을 조회', async () => {
      const freelancerSearch: FreelancerSearch = {
        keyword: '#',
        page: 1,
      };

      const freelancers = await freelancerRepository.searchFreelancer(
        freelancerSearch,
      );

      expect(freelancers.length).toEqual(2);
      expect(
        freelancers.every(
          (freelancer) => freelancer.position === Position.BACK_END,
        ),
      ).toBeTruthy();
    });

    test('검색어가 직무에 포함되는 프리랜서 목록을 조회', async () => {
      const freelancerSearch: FreelancerSearch = {
        keyword: '프론트',
        page: 1,
      };

      const freelancers = await freelancerRepository.searchFreelancer(
        freelancerSearch,
      );

      expect(freelancers.length).toEqual(2);
      expect(
        freelancers.every(
          (freelancer) => freelancer.position === Position.FRONT_END,
        ),
      ).toBeTruthy();
    });
  });

  describe('findDetailById - 프리랜서 상세 조회', () => {
    let user: User;
    let freelancer: Freelancer;
    beforeAll(async () => {
      user = await userRepository.save({
        provider: 'google',
        providerId: '109809304291112359201',
        name: 'Ruby',
        email: 'rubykim0723@gmail.com',
      });

      freelancer = await freelancerRepository.save({
        aboutMe: `개발자 루비 입니다.`,
        career: `개발 경력 17개월`,
        skills: 'javaScript',
        position: Position.BACK_END,
        user,
      });
    });

    test('id에 해당하는 프리랜서 상세 정보 조회', async () => {
      const freelancerId = freelancer.id;
      const freelancerDetail: FreelancerDetail =
        await freelancerRepository.findDetailById(freelancerId);

      expect(freelancerDetail.username).toEqual(user.name);
      expect(freelancerDetail.email).toEqual(user.email);
      expect(freelancerDetail.aboutMe).toEqual(freelancer.aboutMe);
      expect(freelancerDetail.career).toEqual(freelancer.career);
      expect(freelancerDetail.skills).toEqual(freelancer.skills);
      expect(freelancerDetail.position).toEqual(freelancer.position);
    });

    test('존재하지 않는 id 로 프리랜서 상세 정보 조회', async () => {
      const freelancerId = freelancer.id + 999;
      const freelancerDetail: FreelancerDetail =
        await freelancerRepository.findDetailById(freelancerId);

      expect(freelancerDetail).toBeUndefined();
    });
  });
});
