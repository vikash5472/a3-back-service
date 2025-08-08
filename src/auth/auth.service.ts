import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { PhoneStrategy } from './phone.strategy';
import { SendgridService } from '../common/sendgrid.service';
import { User } from '../user/schemas/user.schema';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private phoneStrategy: PhoneStrategy,
    private sendgridService: SendgridService,
  ) {}

  async linkPhoneNumber(userId: string, phoneNumber: string): Promise<any> {
    try {
      const existingUser = await this.userService.findOne(phoneNumber);
      if (existingUser) {
        throw new BadRequestException(
          'Phone number already linked to another account',
        );
      }
      const user = await this.userService.updateUser(userId, { phoneNumber });
      return { message: 'Phone number linked successfully', user };
    } catch (error) {
      this.logger.error(`Failed to link phone number: ${error.message}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to link phone number');
    }
  }

  async linkEmail(userId: string, email: string): Promise<any> {
    try {
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
        throw new InternalServerErrorException('Failed to send verification email');
      }

      return { message: 'Verification email sent. Please check your inbox.' };
    } catch (error) {
      this.logger.error(`Failed to link email: ${error.message}`);
      if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to link email');
    }
  }

  async verifyEmail(token: string): Promise<any> {
    try {
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
    } catch (error) {
      this.logger.error(`Failed to verify email: ${error.message}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to verify email');
    }
  }

  async sendOtp(phoneNumber: string): Promise<any> {
    try {
      const success = await this.phoneStrategy.sendOtp(phoneNumber);
      if (success) {
        return { message: 'OTP sent successfully' };
      }
      throw new InternalServerErrorException('Failed to send OTP');
    } catch (error) {
      this.logger.error(`Failed to send OTP: ${error.message}`);
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to send OTP');
    }
  }

  async loginWithOtp(phoneNumber: string, otp: string): Promise<any> {
    try {
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
    } catch (error) {
      this.logger.error(`Failed to login with OTP: ${error.message}`);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to login with OTP');
    }
  }

  async login(user: any): Promise<any> {
    try {
      const payload = { username: user.username, sub: user.userId };
      const access_token = this.jwtService.sign(payload);
      // Save the access token to the user's schema
      await this.userService.updateAppJwtToken(user.userId, access_token);
      return {
        access_token,
      };
    } catch (error) {
      this.logger.error(`Failed to login: ${error.message}`);
      throw new InternalServerErrorException('Failed to login');
    }
  }

  async googleLogin(req): Promise<any> {
    try {
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
    } catch (error) {
      this.logger.error(`Failed to login with Google: ${error.message}`);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to login with Google');
    }
  }
}
