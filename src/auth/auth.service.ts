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
      this.logger.error(`Sign up failed: ${error.message}`, error.stack);
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
      const { password: _, ...userWithoutPassword } = user.toObject();
      const accessToken = this.generateToken(userWithoutPassword);

      return {
        user: userWithoutPassword as Omit<User, 'password'>,
        accessToken,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`Sign in failed: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Authentication failed');
    }
  }

  private generateToken(user: any): string {
    const payload = { sub: user._id, email: user.email };
    return this.jwtService.sign(payload);
  }
}
