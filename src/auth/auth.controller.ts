import { Controller, Post, Body, UseGuards, Request, Get, Req, HttpException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { LoginOtpDto } from './dto/login-otp.dto';

import { JwtAuthGuard } from './jwt-auth/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

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
    return this.authService.loginWithOtp(loginOtpDto.phoneNumber, loginOtpDto.otp);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Gets the user profile' })
  @ApiResponse({ status: 200, description: 'The user profile.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getProfile(@Request() req) {
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
