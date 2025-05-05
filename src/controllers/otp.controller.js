const otpService = require("../services/otp.service");

// Tạo mã OTP
const createOtp = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "Thiếu userId" });
    }

    const otp = await otpService.createOtp(userId);
    res.status(201).json({ message: "OTP đã được tạo", data: otp });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Kiểm tra mã OTP
const checkOtp = async (req, res) => {
  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return res.status(400).json({ message: "Thiếu userId hoặc mã OTP" });
    }

    await otpService.checkOtp(userId, code);
    res.status(200).json({ message: "Mã OTP hợp lệ" });
  } catch (error) {
    res.status(400).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

module.exports = {
  createOtp,
  checkOtp,
};