import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { PhoneStrategy } from './phone.strategy';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private phoneStrategy: PhoneStrategy,
  ) {}

  async sendOtp(phoneNumber: string): Promise<any> {
    const success = await this.phoneStrategy.sendOtp(phoneNumber);
    if (success) {
      return { message: 'OTP sent successfully' };
    }
    return { message: 'Failed to send OTP' };
  }

  async loginWithOtp(phoneNumber: string, otp: string): Promise<any> {
    const isValid = await this.phoneStrategy.verifyOtp(phoneNumber, otp);
    if (isValid) {
      const user = await this.userService.findOne(phoneNumber);
      if (user) {
        return this.login(user);
      }
      // In a real app, you might want to create a new user here
      return { message: 'User not found' };
    }
    return { message: 'Invalid OTP' };
  }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findOne(username);
    if (user && user.password === pass) { // In a real app, you'd hash and compare passwords
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  googleLogin(req) {
    if (!req.user) {
      return 'No user from google';
    }

    return {
      message: 'User information from google',
      user: req.user,
    };
  }
}