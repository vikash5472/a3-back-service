import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class SendgridService {
  constructor(private configService: ConfigService) {
    sgMail.setApiKey(this.configService.get<string>('SENDGRID_API_KEY')!);
  }

  async sendMail(
    to: string,
    subject: string,
    text: string,
    html?: string,
  ): Promise<boolean> {
    const msg = {
      to,
      from: this.configService.get<string>('SENDGRID_SENDER_EMAIL')!, // Use your verified sender email
      subject,
      text,
      html: html || text,
    };

    try {
      await sgMail.send(msg);
      return true;
    } catch (error) {
      console.error('SendGrid Email Error:', error.response?.body || error);
      return false;
    }
  }
}
