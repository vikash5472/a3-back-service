import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('login')
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
  getProfile(@Request() req) {
    return req.user;
  }
}