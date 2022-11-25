import { PickType } from '@nestjs/swagger';
import { User } from '../domain/user/user.entity';

export class OAuth2User extends PickType(User, [
  'provider',
  'providerId',
  'email',
  'name',
] as const) {}
