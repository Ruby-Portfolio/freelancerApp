import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt/jwt.strategy';
import { UserRepository } from '../domain/user/user.repository';
import { CustomTypeOrmModule } from '../typeorm/typeorm.module';
import { GoogleStrategy } from './auth.strategy';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    CustomTypeOrmModule.forCustomRepository([UserRepository]),
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),
    JwtModule.register({
      secret: 'secretKey',
      signOptions: { expiresIn: '1y' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, JwtStrategy],
})
export class AuthModule {}
