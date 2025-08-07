import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { PhoneStrategy } from './phone.strategy';
import { SendgridService } from '../common/sendgrid.service';
import { User } from '../user/schemas/user.schema';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private phoneStrategy: PhoneStrategy,
    private sendgridService: SendgridService,
  ) {}

  async linkPhoneNumber(userId: string, phoneNumber: string): Promise<any> {
    const existingUser = await this.userService.findOne(phoneNumber);
    if (existingUser) {
      throw new BadRequestException(
        'Phone number already linked to another account',
      );
    }
    const user = await this.userService.updateUser(userId, { phoneNumber });
    return { message: 'Phone number linked successfully', user };
  }

  async linkEmail(userId: string, email: string): Promise<any> {
    const existingUser = await this.userService.findOne(email);
    if (existingUser) {
      throw new BadRequestException('Email already linked to another account');
    }

    const verificationToken = uuidv4();
    const verificationLink = `http://localhost:3000/auth/verify-email?token=${verificationToken}`;

    await this.userService.updateUser(userId, {
      emailVerificationToken: verificationToken,
      tempEmail: email,
    });

    const emailSent = await this.sendgridService.sendMail(
      email,
      'Verify your email address',
      `Please click on the following link to verify your email: ${verificationLink}`,
      `<p>Please click on the following link to verify your email: <a href="${verificationLink}">${verificationLink}</a></p>`,
    );

    if (!emailSent) {
      throw new BadRequestException('Failed to send verification email');
    }

    return { message: 'Verification email sent. Please check your inbox.' };
  }

  async verifyEmail(token: string): Promise<any> {
    const user = await this.userService.findByEmailVerificationToken(token);

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    // Update user's email and clear verification token
    user.email = user.tempEmail;
    user.tempEmail = undefined;
    user.emailVerificationToken = undefined;
    await user.save();

    return { message: 'Email verified successfully' };
  }

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
    const access_token = this.jwtService.sign(payload);
    // Save the access token to the user's schema
    await this.userService.updateAppJwtToken(user.userId, access_token);
    return {
      access_token,
    };
  }

  async googleLogin(req) {
    if (!req.user) {
      throw new UnauthorizedException('No user from Google');
    }

    const {
      emails,
      firstName,
      lastName,
      picture,
      accessToken: googleAccessToken,
    } = req.user;
    const email = emails[0].value;

    let user = await this.userService.findOne(email);

    if (!user) {
      user = await this.userService.create({
        email,
        firstName,
        lastName,
        picture,
        googleAccessToken,
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
