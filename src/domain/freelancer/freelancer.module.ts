import { Module } from '@nestjs/common';
import { FreelancerController } from './freelancer.controller';
import { FreelancerRepository } from './freelancer.repository';
import { CustomTypeOrmModule } from '../../typeorm/typeorm.module';
import { FreelancerService } from './freelancer.service';
import { FreelancerCacheService } from './freelancer.cache';

@Module({
  imports: [CustomTypeOrmModule.forCustomRepository([FreelancerRepository])],
  providers: [FreelancerService, FreelancerCacheService],
  controllers: [FreelancerController],
})
export class FreelancerModule {}
