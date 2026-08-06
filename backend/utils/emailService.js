import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logoPath = path.join(__dirname, '../../frontend/src/assets/logo.png');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const generateEmailHtml = (subject, content) => {
  // If content is plain text (doesn't have HTML tags), convert newlines to <br/>
  const formattedContent = (content && !content.includes('<')) 
    ? content.replace(/\n/g, '<br/>') 
    : content;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light">
      <meta name="supported-color-schemes" content="light">
      <style>
        :root {
          color-scheme: light;
          supported-color-schemes: light;
        }
        body, table, td, div {
          font-family: 'Segoe UI', Arial, sans-serif;
        }
        @media (prefers-color-scheme: dark) {
          .email-bg, .email-container, .email-header, .email-content, .email-footer {
            background-color: #ffffff !important;
            color: #334155 !important;
          }
          .email-heading {
            color: #062F26 !important;
          }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #ffffff;">
      <div class="email-bg" style="background-color: #ffffff; width: 100%; padding: 20px 0;">
        <div class="email-container" style="max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div class="email-header" style="background-color: #ffffff; padding: 24px; text-align: center; border-bottom: 4px solid #062F26;">
            <img src="cid:housynestlogo" alt="Housynest Logo" style="height: 48px; width: auto; display: block; margin: 0 auto;" />
          </div>
          <div class="email-content" style="padding: 40px 32px; color: #334155; line-height: 1.7; font-size: 16px; background-color: #ffffff;">
            <h2 class="email-heading" style="color: #062F26; margin-top: 0; margin-bottom: 24px; font-size: 22px; font-weight: 700; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;">
              ${subject}
            </h2>
            <div style="color: #475569;">
              ${formattedContent}
            </div>
          </div>
          <div class="email-footer" style="background-color: #ffffff; padding: 24px; text-align: center; color: #64748b; font-size: 13px; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; font-weight: 500;">© ${new Date().getFullYear()} Housynest. All rights reserved.</p>
            <p style="margin: 8px 0 0 0;">This is an automated notification. Please do not reply directly to this email.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const sendGenericEmail = async (to, subject, text, html, attachments = []) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject,
      text, // Keep plain text as a fallback for email clients that don't support HTML
      html: generateEmailHtml(subject, html || text),
      attachments: [
        ...attachments,
        {
          filename: 'logo.png',
          path: logoPath,
          cid: 'housynestlogo' // same cid value as in the html img src
        }
      ]
    };

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail(mailOptions);
    } else {
      console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
      console.log(`Text: ${text}`);
    }
  } catch (error) {
    console.error("Error sending email", error);
  }
};
