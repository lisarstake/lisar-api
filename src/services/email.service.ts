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
  maxRetries?: number;
}

/**
 * Send email with automatic retry logic
 * @param options - Email options including recipient, subject, content
 * @param options.maxRetries - Maximum number of retry attempts (default: 3)
 * @returns Promise with email result
 */
export async function sendMail(options: SendMailOptions) {
  const maxRetries = options.maxRetries ?? 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
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

      const result = await transporter.sendMail(mailOptions);
      
      // Log success
      if (attempt > 0) {
        console.log(`Email sent successfully to ${options.to} on retry attempt ${attempt}`);
      } else {
        console.log(`Email sent successfully to ${options.to}`);
      }

      return result;
    } catch (error) {
      lastError = error as Error;
      
      // If this is not the last attempt, wait before retrying
      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        const delayMs = Math.pow(2, attempt) * 1000;
        console.warn(
          `Failed to send email to ${options.to} (attempt ${attempt + 1}/${maxRetries + 1}). ` +
          `Retrying in ${delayMs}ms...`,
          error
        );
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        // Final attempt failed
        console.error(
          `Failed to send email to ${options.to} after ${maxRetries + 1} attempts:`,
          error
        );
      }
    }
  }

  // All retries exhausted
  throw new Error(
    `Failed to send email to ${options.to} after ${maxRetries + 1} attempts. Last error: ${lastError?.message}`
  );
}

export default {
  sendMail,
};
