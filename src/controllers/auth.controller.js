const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');

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

  

module.exports = { register, login };
