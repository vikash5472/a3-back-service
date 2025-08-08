import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class SendgridService {
  private readonly logger = new Logger(SendgridService.name);
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
      from: this.configService.get<string>('SENDGRID_SENDER_EMAIL')!,
      subject,
      text,
      html: html || text,
    };

    try {
      await sgMail.send(msg);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      throw new InternalServerErrorException('Failed to send email');
    }
  }
}
