import { CacheModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './domain/user/user.entity';
import { Freelancer } from './domain/freelancer/freelancer.entity';
import { JobPosting } from './domain/jobPosting/jobPosting.entity';
import { SupportHistory } from './domain/supportHistory/supportHistory.entity';
import { AuthModule } from './auth/auth.module';
import * as redisStore from 'cache-manager-ioredis';

@Module({
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
