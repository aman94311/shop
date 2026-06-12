// ============================================================
//  config/email.js — Email Configuration & Helper
//  Abhi Sanitary and Hardware
// ============================================================

const nodemailer = require("nodemailer");

let transporter;

const getTransporter = async () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port: parseInt(port, 10),
      secure: parseInt(port, 10) === 465, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });
    console.log("📧 Email SMTP Transporter configured successfully.");
  } else {
    console.log("⚠️ Email SMTP configuration missing in .env. Creating Ethereal test account...");
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log("✅ Created Ethereal SMTP test account.");
      console.log(`   User: ${testAccount.user}`);
      console.log(`   Pass: ${testAccount.pass}`);
      console.log("   Test emails will be generated dynamically and printable preview links will be logged.");
    } catch (err) {
      console.error("❌ Failed to create Ethereal SMTP test account:", err.message);
      // Fallback dummy transporter to prevent server crash
      transporter = {
        sendMail: async (mailOptions) => {
          console.log("❌ Email send skipped (SMTP not configured & Ethereal failed). Content:", mailOptions);
          return { messageId: "dummy-id" };
        }
      };
    }
  }
  return transporter;
};

const sendEmail = async ({ to, subject, text, html }) => {
  const tx = await getTransporter();
  
  let from = process.env.SMTP_FROM;
  // If SMTP_FROM is not specified or does not look like a valid email, fallback to SMTP_USER or default
  if (!from || !from.includes("@")) {
    from = process.env.SMTP_USER || "no-reply@abhisanitary.com";
  }
  
  const mailOptions = {
    from: `"Abhi Sanitary & Hardware" <${from}>`,
    to,
    subject,
    text,
    html,
  };

  const info = await tx.sendMail(mailOptions);
  
  // If Ethereal test account is being used, log the preview URL
  if (nodemailer.getTestMessageUrl && info) {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`📬  Ethereal Test Email sent! Preview URL: ${previewUrl}`);
    }
  }

  return info;
};

module.exports = { sendEmail };
