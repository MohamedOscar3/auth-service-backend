import {
  Injectable,
  UnauthorizedException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signUp(
    createUserDto: CreateUserDto,
  ): Promise<{ user: Omit<User, 'password'>; accessToken: string }> {
    try {
      this.logger.log(`Signing up new user with email: ${createUserDto.email}`);
      const user = await this.usersService.createUser(createUserDto);
      const accessToken = this.generateToken(user);

      return { user, accessToken };
    } catch (error) {
      this.logger.error(
        `Sign up failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : '',
      );
      throw error;
    }
  }

  async signIn(
    email: string,
    password: string,
  ): Promise<{ user: Omit<User, 'password'>; accessToken: string }> {
    try {
      this.logger.log(`Attempting sign in for user: ${email}`);
      const user = await this.usersService.findByEmail(email);

      // Use the comparePassword method from the UserDocument
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        this.logger.warn(`Invalid password attempt for user: ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      this.logger.log(`User ${email} signed in successfully`);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { ...userWithoutPassword }: Omit<User, 'password'> =
        user.toObject();

      const accessToken = this.generateToken(
        userWithoutPassword as Record<string, unknown>,
      );

      return {
        user: userWithoutPassword as Omit<User, 'password'>,
        accessToken,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(
        `Sign in failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : '',
      );
      throw new InternalServerErrorException('Authentication failed');
    }
  }

  private generateToken(user: Record<string, unknown>): string {
    // Define a properly typed payload to avoid unsafe assignment
    interface JwtPayload {
      sub: string;
      email: string;
    }

    const payload: JwtPayload = {
      sub: user._id as string,
      email: user.email as string,
    };
    return this.jwtService.sign(payload);
  }
}
