const Twilio = require('twilio');
const axios = require('axios');

class SmsService {
  constructor() {
    const provider = process.env.SMS_PROVIDER;
    if (provider === 'twilio' || provider === 'msg91') {
      this.smsProvider = provider;
    } else {
      console.warn('Invalid SMS_PROVIDER specified. Defaulting to msg91.');
      this.smsProvider = 'msg91';
    }

    if (this.smsProvider === 'twilio') {
      this.twilioClient = Twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN,
      );
    }
  }

  async sendSms(to, message) {
    if (this.smsProvider === 'twilio') {
      try {
        await this.twilioClient.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to,
        });
        return true;
      } catch (error) {
        console.error(`Failed to send SMS via Twilio: ${error.message}`);
        throw new Error('Failed to send SMS');
      }
    } else if (this.smsProvider === 'msg91') {
      try {
        const otpMatch = message.match(/\d+/);
        const otp = otpMatch ? otpMatch[0] : '';

        if (!otp) {
          console.error(
            '[SMS Service] MSG91: Could not extract OTP from message',
            { message },
          );
          throw new Error('Could not extract OTP from message for MSG91.');
        }

        const url = 'https://control.msg91.com/api/v5/flow';
        const authKey = process.env.MSG91_AUTH_KEY;
        const templateId = process.env.MSG91_TEMPLATE_ID;

        const body = {
          template_id: templateId,
          recipients: [
            {
              mobiles: to.replace('+', ''),
              number: parseInt(otp),
            },
          ],
        };

        const config = {
          headers: {
            accept: 'application/json',
            authkey: authKey,
            'content-type': 'application/json',
          },
        };

        const { data } = await axios.post(url, body, config);
        console.log('[SMS Service] MSG91: OTP sent via SMS', {
          data: data,
        });
        return true;
      } catch (error) {
        console.error('[SMS Service] MSG91: Error sending OTP', {
          error: error.message,
          response: error.response?.data,
        });
        throw new Error('Failed to send SMS');
      }
    }
    return false;
  }
}

module.exports = new SmsService();
