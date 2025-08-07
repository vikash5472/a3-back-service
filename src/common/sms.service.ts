import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Twilio from 'twilio';

@Injectable()
export class SmsService {
  private smsProvider: 'twilio';
  private twilioClient;

  constructor(private configService: ConfigService) {
    const provider = this.configService.get<string>('SMS_PROVIDER');
    if (provider === 'twilio') {
      this.smsProvider = provider;
    } else {
      this.smsProvider = 'twilio'; 
      console.warn('Invalid SMS_PROVIDER specified. Defaulting to Twilio.');
    }

    if (this.smsProvider === 'twilio') {
      this.twilioClient = Twilio(
        this.configService.get('TWILIO_ACCOUNT_SID'),
        this.configService.get('TWILIO_AUTH_TOKEN'),
      );
    }
  }

  async sendSms(to: string, message: string): Promise<boolean> {
    if (this.smsProvider === 'twilio') {
      try {
        await this.twilioClient.messages.create({
          body: message,
          from: this.configService.get('TWILIO_PHONE_NUMBER'),
          to,
        });
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    }
    return false;
  }
}
