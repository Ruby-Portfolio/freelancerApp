import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { OAuth2User } from './auth.request';
import { Payload } from './jwt/jwt.payload';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleLoginCallback(@Req() { user }, @Res() res) {
    const oAuthUser = await this.authService.authLogin(user as OAuth2User);

    const token = this.jwtService.sign({ ...oAuthUser } as Payload);

    res.cookie('Authentication', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 30,
    });

    res.redirect('/');
  }

  // 로그아웃은 프론트 쪽에서 토큰을 제거하는 것으로 처리함
}
