import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FreelancerService } from './freelancer.service';
import { JwtGuard } from '../../auth/jwt/jwt.guard';
import { CurrentUser } from '../../auth/auth.decorator';
import { FreelancerAdd, FreelancerSearch } from './freelancer.request';
import { IdPipe } from '../../common/pipe/validation.pipe';

@Controller('freelancers')
export class FreelancerController {
  constructor(private readonly freelancerService: FreelancerService) {}

  @UseGuards(JwtGuard)
  @Post()
  async postFreelancer(
    @CurrentUser() user,
    @Body() freelancerAdd: FreelancerAdd,
  ) {
    await this.freelancerService.addFreelancer(user, freelancerAdd);
  }

  @UseGuards(JwtGuard)
  @Get()
  async getFreelancers(@Query() freelancerSearch: FreelancerSearch) {
    return this.freelancerService.getFreelancers(freelancerSearch);
  }

  @UseGuards(JwtGuard)
  @Get(':freelancerId')
  async getFreelancerDetail(
    @Param('freelancerId', IdPipe) freelancerId: number,
  ) {
    return this.freelancerService.getFreelancerDetail(freelancerId);
  }
}
