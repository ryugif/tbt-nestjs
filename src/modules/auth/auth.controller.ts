import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dto/auth.dto';
import { AccessTokenGuard } from '../../guards/accessToken.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async signUp(@Body() payload: SignUpDto) {
    return await this.authService.signUp(payload);
  }

  @Post('login')
  async signIn(@Body() payload: SignInDto) {
    const findUser = await this.authService.findOneByEmail(payload.email);
    if (!findUser)
      throw new BadRequestException('Your account is not registered');

    return await this.authService.signIn(payload);
  }

  @Post('logout')
  @UseGuards(AccessTokenGuard)
  logout() {
    return this.authService.signOut();
  }
}
