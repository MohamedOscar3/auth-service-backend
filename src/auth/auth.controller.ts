import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from '../users/dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully created' })
  @ApiResponse({ status: 409, description: 'User with this email already exists' })
  async signUp(@Body() createUserDto: CreateUserDto) {
    this.logger.log('Processing signup request');
    return this.authService.signUp(createUserDto);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user and get token' })
  @ApiResponse({ status: 200, description: 'User successfully authenticated' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async signIn(@Body() loginDto: LoginDto) {
    this.logger.log('Processing signin request');
    return this.authService.signIn(loginDto.email, loginDto.password);
  }

  @Get('welcome')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get welcome message (protected route)' })
  @ApiResponse({ status: 200, description: 'Welcome message returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getWelcome(@Req() req) {
    this.logger.log(`User ${req.user.email} accessed welcome endpoint`);
    return {
      message: `Welcome ${req.user.email}! You have successfully authenticated.`,
      user: req.user,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user (client-side)' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  logout(@Req() req) {
    this.logger.log(`User ${req.user.email} logged out`);
    return { message: 'Logout successful' };
  }
}
