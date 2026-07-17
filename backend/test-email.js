/**
 * Quick email test — run this after updating EMAIL_PASS in .env
 * Usage: node test-email.js your@email.com
 */
require("dotenv").config();
const nodemailer = require("nodemailer");

const recipient = process.argv[2];
if (!recipient) {
  console.error("Usage: node test-email.js your@email.com");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

console.log("Testing SMTP connection...");
transporter.verify(async (err) => {
  if (err) {
    console.error("❌ SMTP verify FAILED:", err.message);
    console.error("   → Check EMAIL_USER and EMAIL_PASS in .env");
    process.exit(1);
  }

  console.log("✅ SMTP connection OK — sending test email...");
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: recipient,
      subject: "IAMverse — Email Test",
      html: `
        <div style="font-family:Arial,sans-serif;padding:24px;color:#111;">
          <h2>✅ Email is working!</h2>
          <p>Your OTP emails will now be delivered correctly.</p>
          <div style="font-size:28px;font-weight:bold;letter-spacing:8px;
               background:#f3f4f6;padding:16px 24px;border-radius:8px;
               display:inline-block;">
            123456
          </div>
          <p style="margin-top:16px;color:#666;">
            This is a sample OTP format. Real codes are generated per request.
          </p>
        </div>
      `,
    });
    console.log("✅ Test email sent! Message ID:", info.messageId);
    console.log("   Check your inbox at:", recipient);
  } catch (sendErr) {
    console.error("❌ Send failed:", sendErr.message);
  }
  process.exit(0);
});
