import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
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
    throw new BadRequestException('Failed to send OTP');
  }

  async loginWithOtp(phoneNumber: string, otp: string): Promise<any> {
    const isValid = await this.phoneStrategy.verifyOtp(phoneNumber, otp);
    if (isValid) {
      const user = await this.userService.findOne(phoneNumber);
      if (user) {
        return this.login(user);
      }
      // Create new user if not found
      const newUser = await this.userService.create({ phoneNumber });
      return this.login(newUser);
    }
    throw new UnauthorizedException('Invalid OTP');
  }

  

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async googleLogin(req) {
    if (!req.user) {
      throw new UnauthorizedException('No user from Google');
    }

    const { emails, firstName, lastName, picture, accessToken } = req.user;
    const email = emails[0].value;

    let user = await this.userService.findOne(email);

    if (!user) {
      user = await this.userService.create({
        email,
        firstName,
        lastName,
        picture,
        accessToken,
      });
    } else {
      // Update user information if needed
      // For example, update accessToken or profile picture
      // user.accessToken = accessToken;
      // await user.save(); // Assuming user is a Mongoose document
    }

    return this.login(user);
  }
}