import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { RefreshTokensService } from '../auth/refresh-tokens.service';
import { UserSchema, RefreshTokenSchema } from '../../common/schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'RefreshToken', schema: RefreshTokenSchema },
    ]),
  ],
  providers: [UsersService, RefreshTokensService],
  exports: [UsersService, RefreshTokensService],
})
export class UsersModule {}
