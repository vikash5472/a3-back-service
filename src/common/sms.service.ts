import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Twilio from 'twilio';
import axios from 'axios';

@Injectable()
export class SmsService {
  private smsProvider: 'twilio' | 'msg91';
  private twilioClient: Twilio.Twilio;

  constructor(private configService: ConfigService) {
    const provider = this.configService.get<string>('SMS_PROVIDER');
    if (provider === 'twilio' || provider === 'msg91') {
      this.smsProvider = provider;
    } else {
      this.smsProvider = 'twilio';
      Logger.warn('Invalid SMS_PROVIDER specified. Defaulting to msg91.');
      this.smsProvider = 'msg91';
    }

    if (this.smsProvider === 'twilio') {
      this.twilioClient = Twilio(
        this.configService.get<string>('TWILIO_ACCOUNT_SID') as string,
        this.configService.get<string>('TWILIO_AUTH_TOKEN') as string,
      );
    }
  }

  async sendSms(to: string, message: string): Promise<boolean> {
    if (this.smsProvider === 'twilio') {
      try {
        await this.twilioClient.messages.create({
          body: message,
          from: this.configService.get<string>('TWILIO_PHONE_NUMBER'),
          to,
        });
        return true;
      } catch (error: any) {
        Logger.error(error.message);
        throw new InternalServerErrorException('Failed to send SMS');
      }
    } else if (this.smsProvider === 'msg91') {
      try {
        const otpMatch = message.match(/\d+/);
        const otp = otpMatch ? otpMatch[0] : '';

        if (!otp) {
          Logger.error(
            '[SMS Service] MSG91: Could not extract OTP from message',
            { message },
          );
          throw new Error('Could not extract OTP from message for MSG91.');
        }

        const url = 'https://control.msg91.com/api/v5/flow';
        const authKey = this.configService.get<string>('MSG91_AUTH_KEY');
        const templateId = this.configService.get<string>('MSG91_TEMPLATE_ID');

        const body: {
          template_id: string;
          recipients: { mobiles: string; number: number }[];
        } = {
          template_id: templateId as string,
          recipients: [
            {
              mobiles: to.replace('+', ''),
              number: parseInt(otp),
            },
          ],
        };

        const config: {
          headers: { accept: string; authkey: string; 'content-type': string };
        } = {
          headers: {
            accept: 'application/json',
            authkey: authKey as string,
            'content-type': 'application/json',
          },
        };

        const { data }: { data: any } = await axios.post(url, body, config);
        Logger.log('[SMS Service] MSG91: OTP sent via SMS', {
          data: data,
        });
        return true;
      } catch (error: any) {
        Logger.error('[SMS Service] MSG91: Error sending OTP', {
          error: error.message,
          response: (error as any).response?.data,
        });
        throw new InternalServerErrorException('Failed to send SMS');
      }
    }
    return false;
  }
}
