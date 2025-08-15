const sgMail = require('@sendgrid/mail');

class SendgridService {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async sendMail(to, subject, text, html) {
    const msg = {
      to,
      from: process.env.SENDGRID_SENDER_EMAIL,
      subject,
      text,
      html: html || text,
    };

    try {
      await sgMail.send(msg);
      return true;
    } catch (error) {
      console.error(`Failed to send email: ${error.message}`);
      return false;
    }
  }
}

module.exports = new SendgridService();
