const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Định nghĩa schema cho bảng otps
const otpSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', // Liên kết với bảng users
    required: true 
  },
  code: { 
    type: String, 
    required: true, 
    minlength: 4, // Độ dài tối thiểu
    maxlength: 10 // Độ dài tối đa
  },
  expirationTime: { 
    type: Date, 
    required: true 
  },
  isUsed: { 
    type: Boolean, 
    default: false 
  },
  isDelete: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  createdById: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' // Liên kết với bảng users (user tạo OTP)
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedById: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' // Liên kết với bảng users (user cập nhật OTP)
  },
  deletedAt: { 
    type: Date 
  }
}, { timestamps: true }); // Tự động thêm createdAt và updatedAt

// Tạo model từ schema
const OtpModel = mongoose.model('Otp', otpSchema);

// Export model
module.exports = OtpModel;
