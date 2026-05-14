import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Generates a professional HTML Email Template wrapper
 */
export const getEmailTemplate = (title, content) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f4f6f9;
                margin: 0;
                padding: 0;
                color: #333333;
                -webkit-font-smoothing: antialiased;
            }
            .wrapper {
                width: 100%;
                background-color: #f4f6f9;
                padding: 30px 0;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
            }
            .header {
                background-color: #1D4ED8;
                padding: 25px 20px;
                text-align: center;
            }
            .header img {
                max-height: 60px;
                width: auto;
            }
            .content {
                padding: 40px 30px;
                line-height: 1.6;
            }
            h1 {
                color: #1D4ED8;
                font-size: 22px;
                margin-top: 0;
                margin-bottom: 20px;
                font-weight: 700;
            }
            p {
                font-size: 15px;
                color: #555555;
                margin-bottom: 20px;
            }
            .otp-box {
                background: #f0f4ff;
                border: 2px dashed #1D4ED8;
                border-radius: 12px;
                padding: 20px;
                text-align: center;
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 8px;
                color: #1D4ED8;
                margin: 25px 0;
            }
            .btn {
                display: inline-block;
                background-color: #FFC107;
                color: #1D4ED8 !important;
                font-weight: bold;
                text-decoration: none;
                padding: 12px 30px;
                border-radius: 30px;
                font-size: 15px;
                margin: 15px 0;
                transition: opacity 0.2s ease;
            }
            .footer {
                background-color: #f8fafc;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #edf2f7;
            }
            .footer p {
                font-size: 12px;
                color: #8898aa;
                margin-bottom: 8px;
            }
            .social-links {
                margin: 15px 0;
            }
            .social-links a {
                color: #1D4ED8;
                text-decoration: none;
                font-weight: 600;
                font-size: 13px;
                margin: 0 10px;
            }
            .signature {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                font-size: 14px;
                color: #666;
            }
        </style>
    </head>
    <body>
        <div class="wrapper">
            <div class="container">
                <div class="header">
                    <!-- First Smile Logo via CID Attachment -->
                    <img src="cid:firstsmile_logo" alt="First Smile" />
                </div>
                <div class="content">
                    ${content}
                    
                    <div class="signature">
                        Best Regards,<br>
                        <strong>Team First Smile</strong>
                    </div>
                </div>
                <div class="footer">
                    <p>© ${new Date().getFullYear()} First Smile. All Rights Reserved.</p>
                    <p>Bringing smiles, one toy at a time.</p>
                    <div class="social-links">
                        <a href="mailto:firstsmile19@gmail.com">Email Us</a> | 
                        <a href="https://instagram.com/Firstsmile19">Instagram</a>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};

export const sendEmail = async (to, subject, text, html) => {
    try {
        const logoPath = path.join(__dirname, '../../src/assets/firstsmile_logo.png');
        
        await transporter.sendMail({
            from: `"First Smile" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html,
            attachments: [
                {
                    filename: 'firstsmile_logo.png',
                    path: logoPath,
                    cid: 'firstsmile_logo'
                }
            ]
        });
        return true;
    } catch (error) {
        console.error('Email send failed:', error);
        return false;
    }
};
