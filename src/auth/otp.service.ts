import { Injectable } from '@nestjs/common';
import * as NodeCache from 'node-cache';

@Injectable()
export class OtpService {
  private cache = new NodeCache();

  async sendOtp(phoneNumber: string): Promise<boolean> {
    const otpRequestCount = this.cache.get<number>(`${phoneNumber}:requests`) ?? 0;
    if (otpRequestCount >= 2) {
      return false; // Max 2 OTP requests per hour
    }

    // In a real app, you'd use a service like Twilio or Msg91 to send an OTP
    console.log(`Sending OTP to ${phoneNumber}`);
    this.cache.set(`${phoneNumber}:requests`, otpRequestCount + 1, 3600); // 1 hour TTL
    return true;
  }

  async verifyOtp(phoneNumber: string, otp: string): Promise<boolean> {
    const failedAttempts = this.cache.get<number>(`${phoneNumber}:failedAttempts`) ?? 0;
    if (failedAttempts >= 2) {
      return false; // Blocked for 2 hours
    }

    // In a real app, you'd verify the OTP that was sent
    const isValid = otp === '1234'; // Placeholder for OTP verification
    if (!isValid) {
      this.cache.set(`${phoneNumber}:failedAttempts`, failedAttempts + 1, 7200); // 2 hour TTL
    }
    return isValid;
  }
}
