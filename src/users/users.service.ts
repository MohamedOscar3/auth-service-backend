import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createUser(
    createUserDto: CreateUserDto,
  ): Promise<Omit<User, 'password'>> {
    try {
      this.logger.log(`Creating new user with email: ${createUserDto.email}`);

      // Check if user already exists
      const existingUser = await this.userModel
        .findOne({ email: createUserDto.email })
        .exec();
      if (existingUser) {
        this.logger.warn(
          `User with email ${createUserDto.email} already exists`,
        );
        throw new ConflictException('User with this email already exists');
      }

      // Create new user
      const newUser = new this.userModel(createUserDto);
      const savedUser = await newUser.save();

      this.logger.log(
        `User created successfully with ID: ${String(savedUser._id)}`,
      );

      // Return user without password
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = savedUser.toObject();
      return result as Omit<User, 'password'>;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      // Handle MongoDB duplicate key error
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        (error as { code: number }).code === 11000
      ) {
        this.logger.warn(
          `Duplicate key error: ${JSON.stringify((error as { keyValue: unknown }).keyValue)}`,
        );
        throw new ConflictException('User with this email already exists');
      }

      this.logger.error(
        `Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : '',
      );
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findByEmail(email: string): Promise<UserDocument> {
    try {
      this.logger.log(`Finding user by email: ${email}`);

      const user = await this.userModel.findOne({ email }).exec();

      if (!user) {
        this.logger.warn(`User with email ${email} not found`);
        throw new NotFoundException('User not found');
      }

      this.logger.log(`User found with ID: ${String(user._id)}`);
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(
        `Failed to find user by email: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : '',
      );
      throw new InternalServerErrorException('Failed to find user');
    }
  }
}
