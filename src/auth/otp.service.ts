import { Injectable } from '@nestjs/common';
import * as NodeCache from 'node-cache';
import { SmsService } from './sms.service';

@Injectable()
export class OtpService {
  private cache = new NodeCache();

  constructor(private smsService: SmsService) {}

  async sendOtp(phoneNumber: string): Promise<boolean> {
    const otpRequestCount = this.cache.get<number>(`${phoneNumber}:requests`) ?? 0;
    if (otpRequestCount >= 2) {
      return false; // Max 2 OTP requests per hour
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    this.cache.set(phoneNumber, otp, 600); // 10 minute TTL

    const success = await this.smsService.sendSms(phoneNumber, `Your OTP is ${otp}`);
    if (success) {
      this.cache.set(`${phoneNumber}:requests`, otpRequestCount + 1, 3600); // 1 hour TTL
      return true;
    }
    return false;
  }

  async verifyOtp(phoneNumber: string, otp: string): Promise<boolean> {
    const failedAttempts = this.cache.get<number>(`${phoneNumber}:failedAttempts`) ?? 0;
    if (failedAttempts >= 2) {
      return false; // Blocked for 2 hours
    }

    const cachedOtp = this.cache.get<string>(phoneNumber);
    const isValid = cachedOtp === otp;
    if (!isValid) {
      this.cache.set(`${phoneNumber}:failedAttempts`, failedAttempts + 1, 7200); // 2 hour TTL
    }
    return isValid;
  }
}
