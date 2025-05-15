const nodemailer = require('nodemailer');

console.log("✅ EMAIL_HOST:", process.env.EMAIL_HOST);
console.log("✅ EMAIL_PORT:", process.env.EMAIL_PORT);

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Gửi email cho người nhận
 * @param {string} to - Email người nhận
 * @param {string} subject - Tiêu đề email
 * @param {object} options - Nội dung email (có thể gồm text hoặc html)
 */
const sendEmail = async (to, subject, { text, html }) => {
  const mailOptions = {
    from: `"FamRice 🌾" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    ...(text && { text }),
    ...(html && { html })
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email đã được gửi tới: ${to}`);
  } catch (error) {
    console.error('❌ Gửi email thất bại:', error.message);
  }
};

module.exports = { sendEmail };
