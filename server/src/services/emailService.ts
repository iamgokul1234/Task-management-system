import nodemailer from 'nodemailer';

export const sendEmail = async (options: { email: string; subject: string; message: string; html?: string }): Promise<boolean> => {
  try {
    let transporter;
    let isEthereal = false;

    if (process.env.SMTP_HOST === 'smtp.ethereal.email' && process.env.SMTP_USER === 'ethereal_user@ethereal.email') {
      // Automatically generate a test account if using the dummy placeholder credentials
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
        port: Number(process.env.SMTP_PORT),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });
    }

    const message = {
      from: `${process.env.EMAIL_FROM}`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };

    const info = await transporter.sendMail(message);
    console.log(`Email sent: ${info.messageId}`);

    if (isEthereal) {
      console.log(`\n================= EMAIL PREVIEW =================`);
      console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      console.log(`=================================================\n`);
    }

    return true;
  } catch (error) {
    console.error(`Email could not be sent:`, error);
    return false;
  }
};
