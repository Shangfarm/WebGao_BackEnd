// src/controllers/newsletter.controller.js
const Newsletter = require('../models/NewsletterModel');
const { sendEmail } = require('../utils/email.util');

exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
  return res.status(400).json({ message: 'Vui lòng nhập địa chỉ email.' });
    }

    // Kiểm tra trùng email
    const exists = await Newsletter.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email đã được đăng ký nhận tin.' });
    }

    const newSubscription = new Newsletter({ email });
    await newSubscription.save();

    
    await sendEmail(
    email, // người dùng vừa đăng ký
    '🎉 Cảm ơn bạn đã đăng ký nhận tin từ FamRice!',
    {
        html: `
        <div style="font-family: Arial; padding: 20px;">
            <h2 style="color: #fb811e;">✅ Bạn đã đăng ký nhận tin thành công!</h2>
            <p>Xin chào,</p>
            <p>Cảm ơn bạn đã đăng ký nhận bản tin từ <strong>FamRice</strong>.</p>
            <p>Chúng tôi sẽ gửi đến bạn những cập nhật mới nhất về sản phẩm, chương trình khuyến mãi và tin tức hấp dẫn.</p>
            <br>
            <p>👉 Nếu bạn cần hỗ trợ, hãy liên hệ chúng tôi qua email <a href="mailto:webgaoviet@gmail.com">webgaoviet@gmail.com</a>.</p>
            <p style="margin-top: 24px;">Thân ái,<br><strong>Đội ngũ FamRice 🌾</strong></p>
        </div>
        `
    }
    );

    res.status(201).json({ message: 'Đăng ký nhận tin thành công!' });
  } catch (error) {
    console.error('Đăng ký newsletter thất bại:', error.message);
    res.status(500).json({ message: 'Lỗi server. Vui lòng thử lại sau.' });
  }
};
