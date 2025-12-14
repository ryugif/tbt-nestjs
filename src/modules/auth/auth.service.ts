import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import dayjs from 'dayjs';

// import { FilterOperator, PaginateQuery, paginate } from 'nestjs-paginate';
import { Auth } from 'src/databases/auth/auth.entity';
import { Repository } from 'typeorm';
import { SignInDto, SignUpDto } from './dto/auth.dto';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-require-imports
require('dotenv').config();

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(Auth)
    private authRepository: Repository<Auth>,
    private jwtService: JwtService,
  ) {}

  async findOneByEmail(email: string) {
    return await this.authRepository.findOne({
      where: {
        email,
      },
    });
  }

  async findOneById(id: number) {
    return await this.authRepository.findOne({
      where: {
        id,
      },
    });
  }

  async createAuth(registerData: SignUpDto) {
    try {
      // Check if user exists
      const userExists = await this.findOneByEmail(registerData.email);
      if (userExists)
        return {
          status: HttpStatus.CONFLICT,
          message: 'User already exists',
          data: null,
        };

      // Hash password
      const hash = await this.hashData(registerData.password);
      const auth = await this.authRepository.save({
        ...registerData,
        password: hash,
      });

      const tokens = await this.getTokens(auth.id, registerData.email);
      const findAuth = await this.findOneById(auth.id);
      return {
        ...tokens,
        auth: findAuth,
      };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(
        error instanceof Error ? error.message : 'An unexpected error occurred',
      );
    }
  }

  async signUp(data: SignUpDto): Promise<{
    token: string;
    expires_at: Date;
    auth: Auth;
  }> {
    try {
      // Check if user exists
      const userExists = await this.findOneByEmail(data.email);
      if (userExists) throw new BadRequestException('User already exists');

      // Hash password
      const hash = await this.hashData(data.password);
      const auth = await this.authRepository.save({
        ...data,
        password: hash,
      });

      const tokens = await this.getTokens(auth.id, data.email);
      const findAuth = await this.findOneById(auth.id);

      return {
        ...tokens,
        auth: findAuth!,
      };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(
        error instanceof Error ? error.message : 'An unexpected error occurred',
      );
    }
  }

  async signIn(data: SignInDto) {
    // Check if user exists
    const auth = await this.findOneByEmail(data.email);
    if (!auth) throw new BadRequestException('Your email is not registered');

    const passwordMatches = await argon2.verify(auth.password, data.password);
    if (!passwordMatches) throw new BadRequestException('Invalid credentials');

    const token = await this.generateAccessToken(auth.id, auth.email);
    const tokens = {
      token: token.token,
      expires_at: token.expire_at,
    };

    return {
      token: tokens.token,
      expires_at: tokens.expires_at,
      user: auth,
    };
  }

  async hashData(data: string) {
    return await argon2.hash(data);
  }

  signOut() {
    return {
      message: 'Logout successful',
    };
  }

  async generateAccessToken(authId: number, email: string) {
    const expire_at = dayjs()
      .add(
        process.env.JWT_ACCESS_EXPIRATION_IN_SECOND as unknown as number,
        'seconds',
      )
      .toDate();

    console.log({
      expire_at,
      env: process.env.JWT_ACCESS_EXPIRATION_IN_SECOND,
    });

    const token = await this.jwtService.signAsync(
      {
        sub: authId,
        email,
        expireIn:
          (process.env.JWT_ACCESS_EXPIRATION_IN_SECOND as unknown as number) +
          's',
      },
      {
        secret: process.env.JWT_ACCESS_SECRET as unknown as string,
        // expiresIn:
        //   (process.env.JWT_ACCESS_EXPIRATION_IN_SECOND as unknown as number) +
        //   's',
      },
    );

    return {
      token,
      expire_at,
    };
  }

  async getTokens(authId: number, email: string) {
    const token = await this.generateAccessToken(authId, email);
    return {
      token: token.token,
      expires_at: token.expire_at,
    };
  }
}
