const Contact = require('../models/ContactModel');
const { sendEmail } = require('../utils/email.util');

const createContactService = async (data) => {
  try {
    // 1. Kiểm tra nếu đã gửi trong 10 phút gần nhất
    const LIMIT_MINUTES = parseInt(process.env.CONTACT_LIMIT_MINUTES || '10');
    const MAX_CONTACT_PER_WINDOW = parseInt(process.env.CONTACT_MAX_PER_WINDOW || '3');

        const limitAgo = new Date(Date.now() - LIMIT_MINUTES * 60 * 1000);
    // ✅ Đếm số lượt gửi trong khoảng thời gian giới hạn
    const contactCount = await Contact.countDocuments({
      email: data.email,
      createdAt: { $gte: limitAgo }
    });

    if (contactCount >= MAX_CONTACT_PER_WINDOW) {
      throw new Error(`Bạn chỉ được gửi tối đa ${MAX_CONTACT_PER_WINDOW} lần trong vòng ${LIMIT_MINUTES} phút. Vui lòng thử lại sau.`);
    }
    // 2. Lưu liên hệ mới
    const newContact = new Contact(data);
    await newContact.save();

    // Gửi email cho admin
    await sendEmail(
      'webgaoviet@gmail.com',
      'Thông báo yêu cầu liên hệ mới',
      {
        text: `Yêu cầu từ ${data.fullName} - SĐT: ${data.phoneNumber} - Nội dung: ${data.message}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #fb811e;">📩 Yêu cầu liên hệ mới từ người dùng</h2>
            <p><strong>👤 Họ tên:</strong> ${data.fullName}</p>
            <p><strong>📧 Email:</strong> ${data.email}</p>
            <p><strong>📞 Số điện thoại:</strong> ${data.phoneNumber}</p>
            <p><strong>📝 Nội dung:</strong></p>
              <div style="margin-left: 12px; margin-bottom: 8px; white-space: pre-line;">
                ${data.message}
              </div>
            <p><strong>⏰ Thời gian gửi:</strong> ${new Date().toLocaleString('vi-VN')}</p>
            <hr/>
            <p style="font-size: 12px; color: #999;">Email này được gửi tự động từ hệ thống FamRice.</p>
          </div>
        `
      }
    );

    // Gửi email phản hồi cho người dùng (HTML format)
    await sendEmail(
      data.email,
      'Cảm ơn bạn đã liên hệ với FamRice! 🌾',
      {
        html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #fb811e;">Cảm ơn bạn đã liên hệ với FamRice! 🌾</h2>
          <p>Chào bạn <strong>${data.fullName}</strong>,</p>
          <p>FamRice rất cảm ơn bạn đã gửi phản hồi đến chúng tôi.</p>
          <p>Chúng tôi đã nhận được yêu cầu của bạn và sẽ phản hồi trong thời gian sớm nhất.</p>
          <p>Nếu bạn cần hỗ trợ gấp, vui lòng liên hệ qua hotline: <strong>0904 522 077</strong><br />
          <p style="margin-top: 24px;">Trân trọng,<br />
          <strong>Đội ngũ FamRice 🌾</strong></p>
        </div>
        `
      }
    );

    return newContact;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  createContactService
};
