import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth } from '../../databases/auth/auth.entity';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenStrategy } from '../../guards/accessToken.strategy';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-require-imports
require('dotenv').config();

@Module({
  controllers: [AuthController],
  providers: [AuthService, AccessTokenStrategy],
  imports: [
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET as unknown as string,
      signOptions: {
        expiresIn: '2Hrs',
      },
    }),
    TypeOrmModule.forFeature([Auth]),
  ],
  exports: [AuthService],
})
export class AuthModule {}
