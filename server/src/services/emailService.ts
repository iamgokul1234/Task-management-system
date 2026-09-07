import nodemailer from 'nodemailer';

export const sendEmail = async (options: { email: string; subject: string; message: string; html?: string }): Promise<boolean> => {
  try {
    let transporter;
    let isEthereal = false;

    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;

    // Use Ethereal test account if SMTP is not configured or uses ethereal defaults
    if (!host || host === 'smtp.ethereal.email' || user === 'ethereal_user@ethereal.email') {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      isEthereal = true;
    } else {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });
    }

    const message = {
      from: process.env.EMAIL_FROM || '"Task Management System" <no-reply@taskmanagement.com>',
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };

    const info = await transporter.sendMail(message);
    console.log(`Email sent: ${info.messageId}`);

    if (isEthereal) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`\n=================================================`);
      console.log(`✉️ EMAIL SENT TO: ${options.email}`);
      console.log(`🔗 VIEW TEST EMAIL HERE: ${previewUrl}`);
      console.log(`=================================================\n`);
    }

    return true;
  } catch (error) {
    console.error(`Email could not be sent:`, error);
    return false;
  }
};
