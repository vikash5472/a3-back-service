import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request as ReqDecorator,
  Get,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { LoginOtpDto } from './dto/login-otp.dto';
import { LinkPhoneDto } from './dto/link-phone.dto';
import { LinkEmailDto } from './dto/link-email.dto';

import { JwtAuthGuard } from './jwt-auth/jwt-auth.guard';
import { User } from '../user/schemas/user.schema';

interface AuthenticatedRequest extends Request {
  user: { userId: string; username: string };
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('send-otp')
  @ApiOperation({ summary: 'Sends an OTP to a phone number' })
  @ApiBody({ type: SendOtpDto })
  @ApiResponse({ status: 201, description: 'Successfully sent OTP.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 429, description: 'Too many requests.' })
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    return this.authService.sendOtp(sendOtpDto.phoneNumber);
  }

  @Post('login-otp')
  @ApiOperation({ summary: 'Logs in a user with an OTP' })
  @ApiBody({ type: LoginOtpDto })
  @ApiResponse({ status: 201, description: 'Successfully logged in.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 429, description: 'Too many requests.' })
  async loginOtp(@Body() loginOtpDto: LoginOtpDto) {
    return this.authService.loginWithOtp(
      loginOtpDto.phoneNumber,
      loginOtpDto.otp,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('link-phone')
  @ApiOperation({
    summary: "Links a phone number to the authenticated user's account",
  })
  @ApiBody({ type: LinkPhoneDto })
  @ApiResponse({
    status: 200,
    description: 'Phone number linked successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request or phone number already exists.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async linkPhone(
    @ReqDecorator() req: AuthenticatedRequest,
    @Body() linkPhoneDto: LinkPhoneDto,
  ) {
    return this.authService.linkPhoneNumber(
      req.user.userId,
      linkPhoneDto.phoneNumber,
    );
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
  ) {
    return this.authService.linkEmail(req.user.userId, linkEmailDto.email);
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Verifies the linked email address' })
  @ApiResponse({ status: 200, description: 'Email verified successfully.' })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired verification token.',
  })
  async verifyEmail(@Req() req) {
    const token = req.query.token as string;
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
  async googleAuth(@Req() req) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Handles Google OAuth2 callback' })
  googleAuthRedirect(@Req() req) {
    return this.authService.googleLogin(req);
  }
}
