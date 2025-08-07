import { Injectable } from '@nestjs/common';
import { OtpService } from './otp.service';

@Injectable()
export class PhoneStrategy {
  constructor(private otpService: OtpService) {}

  async sendOtp(phoneNumber: string): Promise<boolean> {
    return this.otpService.sendOtp(phoneNumber);
  }

  async verifyOtp(phoneNumber: string, otp: string): Promise<boolean> {
    return this.otpService.verifyOtp(phoneNumber, otp);
  }
}
