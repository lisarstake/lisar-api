import nodemailer from 'nodemailer';

const {
  MAILER_EMAIL,
  MAILER_PASSWORD,
  MAILER_HOST,
  MAILER_PORT,
  MAILER_SECURE
} = process.env;

if (!MAILER_EMAIL || !MAILER_PASSWORD || !MAILER_HOST || !MAILER_PORT) {
  throw new Error('Missing email configuration in environment variables');
}

const getMailerConfig = () => {
  const {
    MAILER_EMAIL,
    MAILER_PASSWORD,
    MAILER_HOST,
    MAILER_PORT,
    MAILER_SECURE
  } = process.env;
  if (!MAILER_EMAIL || !MAILER_PASSWORD || !MAILER_HOST || !MAILER_PORT) {
    throw new Error('Missing email configuration in environment variables');
  }
  return {
    host: MAILER_HOST,
    port: Number(MAILER_PORT),
    secure: MAILER_SECURE === 'true' || MAILER_SECURE === '1',
    auth: {
      user: MAILER_EMAIL,
      pass: MAILER_PASSWORD,
    },
    defaultFrom: { name: 'Lisar', address: MAILER_EMAIL },
  };
};

const mailerConfig = getMailerConfig();
const transporter = nodemailer.createTransport({
  host: mailerConfig.host,
  port: mailerConfig.port,
  secure: mailerConfig.secure,
  auth: mailerConfig.auth,
});

export interface SendMailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string | { name: string; address: string };
}

export async function sendMail(options: SendMailOptions) {
  let from = options.from || mailerConfig.defaultFrom;
  // If from is a string, convert to { name, address }
  if (typeof from === 'string') {
    from = { name: 'Lisar', address: from };
  }
  const mailOptions = {
    from,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };
  return transporter.sendMail(mailOptions);
}

export default {
  sendMail,
};
