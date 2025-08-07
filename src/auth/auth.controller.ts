import { Controller, Post, Body, UseGuards, Request, Get, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('login')
  @ApiOperation({ summary: 'Logs in a user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 201, description: 'Successfully logged in.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async login(@Body() loginDto: LoginDto) {
    const username = loginDto.email ?? loginDto.phoneNumber;
    if (!username) {
      return { message: 'Email or phone number is required' };
    }
    const user = await this.authService.validateUser(username, loginDto.password);
    if (!user) {
      // In a real app, you'd throw an UnauthorizedException
      return { message: 'Invalid credentials' };
    }
    return this.authService.login(user);
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
