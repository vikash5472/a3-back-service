import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request as ReqDecorator,
  Get,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LinkEmailDto } from './dto/link-email.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: { userId: string; username: string };
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registers a new user' })
  @ApiBody({ type: RegisterUserDto })
  @ApiResponse({ status: 201, description: 'Successfully registered user.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Logs in a user' })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({ status: 201, description: 'Successfully logged in.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async login(@ReqDecorator() req: AuthenticatedRequest) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('link-email')
  @ApiOperation({
    summary:
      "Links an email to the authenticated user's account and sends verification email",
  })
  @ApiBody({ type: LinkEmailDto })
  @ApiResponse({
    status: 200,
    description: 'Verification email sent successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request or email already exists.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async linkEmail(
    @ReqDecorator() req: AuthenticatedRequest,
    @Body() linkEmailDto: LinkEmailDto,
  ): Promise<{ message: string }> {
    return this.authService.linkEmail(req.user.userId, linkEmailDto.email);
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Verifies the linked email address' })
  @ApiResponse({ status: 200, description: 'Email verified successfully.' })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired verification token.',
  })
  async verifyEmail(@Req() req): Promise<{ message: string }> {
    const token = (req.query as { token: string }).token;
    return this.authService.verifyEmail(token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Gets the user profile' })
  @ApiResponse({ status: 200, description: 'The user profile.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getProfile(@ReqDecorator() req: AuthenticatedRequest) {
    return req.user;
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiates Google OAuth2 login' })
  async googleAuth(@Req() req: Request): Promise<void> {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Handles Google OAuth2 callback' })
  googleAuthRedirect(@Req() req: any): Promise<{ access_token: string }> {
    return this.authService.googleLogin(req);
  }
}