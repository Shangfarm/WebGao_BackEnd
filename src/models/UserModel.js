const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  email: { 
    type: String, 
    unique: true, 
    required: true, 
    match: [/^[a-zA-Z0-9._%+-]+@(gmail\.com|email\.com)$/, 'Chỉ chấp nhận email @gmail.com hoặc @email.com'] // Kiểm tra định dạng email
  },
  fullName: { type: String,
    required: [true, 'Họ và tên là bắt buộc']},
  address: { type: String },
  phoneNumber: { type: String,
    required: true,
    maxlength: [10, 'Số điện thoại không được vượt quá 10 số'],
    match: [/^\d{10}$/, 'Số điện thoại không hợp lệ. Phải gồm đúng 10 chữ số']
  },
  avatar: { 
    type: String, 
    default: 'https://example.com/default-avatar.png' 
  },
  loyaltyPoints: { type: Number, default: 0 },
  role: { 
    type: String, 
    required: true, 
    enum: {
      values: ['admin', 'user', 'moderator'], // Các giá trị hợp lệ
      message: 'Vai trò không hợp lệ' // Thông báo lỗi tùy chỉnh
    }, 
    default: 'user' 
  }, 
  
  createdAt: { type: Date, default: Date.now },
  createdById: { type: String },
  updatedAt: { type: Date },
  updatedById: { type: String },
  deletedAt: { type: Date } // Trường để đánh dấu đã xóa
});

UserSchema.pre("save", function (next) {
  const validRoles = ["admin", "user", "moderator"];
  if (!validRoles.includes(this.role)) {
    return next(new Error("Vai trò không hợp lệ"));
  }
  next();
});

// Phương thức để đánh dấu người dùng là đã xóa
UserSchema.methods.softDelete = async function () {
  this.deletedAt = new Date();
  await this.save();
};

// Phương thức để khôi phục người dùng đã xóa
UserSchema.methods.restore = async function () {
  this.deletedAt = null;
  await this.save();
};

// Phương thức tĩnh để lấy tất cả người dùng chưa bị xóa
UserSchema.statics.findActive = function () {
  return this.find({ deletedAt: null });
};

const bcrypt = require('bcrypt')

// Mã hóa password trước khi lưu
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (err) {
    next(err)
  }
})

// So sánh password khi login
UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password)
}

module.exports = mongoose.model('User', UserSchema);
