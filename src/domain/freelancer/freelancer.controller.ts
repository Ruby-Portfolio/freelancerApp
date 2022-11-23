import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { FreelancerService } from './freelancer.service';
import { JwtGuard } from '../../auth/jwt/jwt.guard';
import { CurrentUser } from '../../auth/auth.decorator';
import { FreelancerAdd } from './freelancer.request';

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

  @Get()
  async getFreelancer() {
    return 'hello';
  }
}
