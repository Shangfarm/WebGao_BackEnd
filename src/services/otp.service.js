const OtpModel = require("../models/OtpModel");

// Tạo mã OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Tạo mã OTP 6 chữ số
};

// Lưu OTP vào cơ sở dữ liệu
const createOtp = async (userId) => {
  const otpCode = generateOtp();
  const expirationTime = new Date(Date.now() + 1 * 60 * 1000); // OTP hết hạn sau 1 phút

  const otp = new OtpModel({
    userId,
    code: otpCode,
    expirationTime,
  });

  await otp.save();
  return otp;
};

// Kiểm tra mã OTP
const checkOtp = async (userId, code) => {
  const otp = await OtpModel.findOne({ userId, code });

  if (!otp) {
    throw new Error("Mã OTP không hợp lệ");
  }
  if (otp.isUsed) {
    throw new Error("Mã OTP đã được sử dụng");
  }
  if (otp.expirationTime < new Date()) {
    throw new Error("Mã OTP đã hết hạn");
  }

  // Đánh dấu OTP là đã sử dụng
  otp.isUsed = true;
  await otp.save();

  return true;
};

module.exports = {
  createOtp,
  checkOtp,
};