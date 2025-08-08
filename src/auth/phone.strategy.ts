import { Injectable } from '@nestjs/common';
import { OtpService } from './otp.service';

@Injectable()
export class PhoneStrategy {
  constructor(private otpService: OtpService) {}

  async sendOtp(phoneNumber: string): Promise<boolean> {
    return this.otpService.sendOtp(phoneNumber);
  }

  verifyOtp(phoneNumber: string, otp: string): boolean {
    return this.otpService.verifyOtp(phoneNumber, otp);
  }
}
