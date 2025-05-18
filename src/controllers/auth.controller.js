const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('../utils/email.util');


const JWT_SECRET = process.env.JWT_SECRET || 'secret123';


// Đăng ký
const register = async (req, res) => {
  try {
    const { username, email, password, fullName, phoneNumber, role } = req.body;

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username hoặc email đã tồn tại' });
    }

    const newUser = new User({ username, email, password, fullName, phoneNumber, role });
    await newUser.save();

    const token = jwt.sign({ userId: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

    const userObj = newUser.toObject();
    delete userObj.password;

    res.status(201).json({ message: 'Đăng ký thành công', token, user: userObj });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ errors: err.errors });
    }
    res.status(500).json({ message: 'Đã xảy ra lỗi', error: err.message });
  }
};



// Đăng nhập
const login = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email && !username) {
      return res.status(400).json({ message: 'Vui lòng nhập email hoặc username' });
    }
    if (!password) {
      return res.status(400).json({ message: 'Vui lòng nhập mật khẩu' });
    }

    const user = await User.findOne({ $or: [{ email }, { username }] });
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Sai mật khẩu' });

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    const userObj = user.toObject();
    delete userObj.password;

    res.json({ message: 'Đăng nhập thành công', token, user: userObj });
  } catch (err) {
    res.status(500).json({ message: 'Đã xảy ra lỗi', error: err.message });
  }
};

// Hàm quên mật khẩu
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy email người dùng' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 15; // 15 phút
    await user.save();

    const resetLink = `http://127.0.0.1:5501/pages/DangNhap/DatLaiMatKhau.html?token=${resetToken}&email=${email}`;

    const htmlContent = `
      <h3>Xin chào ${user.fullName},</h3>
      <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản FamRice.</p>
      <p>Vui lòng nhấn vào liên kết sau để đặt lại mật khẩu:</p>
      <a href="${resetLink}" target="_blank">${resetLink}</a>
      <p><i>Lưu ý: Liên kết có hiệu lực trong 15 phút.</i></p>
    `;

    await sendEmail(email, '🔐 Yêu cầu đặt lại mật khẩu', { html: htmlContent });

    res.json({ message: 'Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi gửi email đặt lại mật khẩu', error: error.message });
  }
};

// Hàm đặt lại mật khẩu 
const resetPassword = async (req, res) => {
  const { token, email, newPassword } = req.body;

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      email,
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Mật khẩu đã được đặt lại thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi đặt lại mật khẩu', error: error.message });
  }
};


module.exports = { 
  register,
  login,
  forgotPassword,
  resetPassword 
};
