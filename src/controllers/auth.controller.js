const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'secret123'; // Gán trực tiếp chuỗi bí mật ở đây

// Đăng ký
const register = async (req, res) => {
    try {
        const { username, email, password, fullName, phoneNumber, role } = req.body;

        // Kiểm tra tồn tại
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Username hoặc email đã tồn tại' });
        }

        // Tạo người dùng mới
        const newUser = new User({
            username,
            email,
            password,
            fullName,
            phoneNumber,
            role
        });
        await newUser.save();

        res.status(201).json({ message: 'Đăng ký thành công', data: newUser });
    } catch (err) {
        // 👇 Sửa ở đây: xử lý lỗi validation Mongoose
    if (err.name === 'ValidationError') {
        return res.status(400).json({ errors: err.errors });
      }
  
      // Lỗi khác
      res.status(500).json({ message: 'Đã xảy ra lỗi', error: err.message });
    }
};

// Đăng nhập
const login = async (req, res) => {
    try {
        const { usernameOrEmail, password } = req.body;

        // Tìm user theo username hoặc email
        const user = await User.findOne({
            $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }]
        });
        if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

        // So sánh mật khẩu
        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Sai mật khẩu' });

        // Tạo JWT
        const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
            expiresIn: '7d'
        });

        res.json({ message: 'Đăng nhập thành công', token, user });
    } catch (err) {
        res.status(500).json({ message: 'Đã xảy ra lỗi', error: err.message });
    }
};

module.exports = { register, login };
