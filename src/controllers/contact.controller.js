const { createContactService } = require('../services/contact.service'); // Gọi service

// Controller để xử lý việc tạo yêu cầu liên hệ
const createContactController = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, message } = req.body;

    // Gọi service để xử lý lưu dữ liệu và gửi email
    const newContact = await createContactService({
      fullName,
      email,
      phoneNumber,
      message,
    });

    // Trả về phản hồi thành công
    return res.status(201).json({
      message: 'Thông tin đã được gửi thành công!',
      contact: newContact,
    });
  } catch (error) {
    // ✅ Trả về status 400 nếu lỗi logic từ người dùng (ví dụ: spam)
    return res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createContactController
};
