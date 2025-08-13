import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    // Define a type for the ExtractJwt to avoid ESLint errors
    type JwtExtractor = {
      fromAuthHeaderAsBearerToken(): (request: Request) => string | null;
    };

    // Cast ExtractJwt to the defined type
    const extractJwt = ExtractJwt as unknown as JwtExtractor;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({
      jwtFromRequest: extractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; email: string }) {
    try {
      this.logger.log(`Validating JWT for user ID: ${payload.sub}`);
      const user = await this.usersService.findByEmail(payload.email);

      if (!user) {
        this.logger.warn(`User not found for JWT validation: ${payload.email}`);
        throw new UnauthorizedException('User not found');
      }

      return { userId: payload.sub, email: payload.email };
    } catch (error) {
      this.logger.error(
        `JWT validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : '',
      );
      throw new UnauthorizedException('Invalid token');
    }
  }
}
