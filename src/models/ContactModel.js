const mongoose = require('mongoose');

// Định nghĩa schema cho yêu cầu liên hệ
const contactSchema = new mongoose.Schema(
  {
    fullName: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      required: true, 
      match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Định dạng email không hợp lệ'] 
    },
    phoneNumber: {  
      type: String, 
      required: true, 
      maxlength: [10, 'Số điện thoại không được vượt quá 10 ký tự'],
      match: [/^\d{10}$/, 'Số điện thoại phải gồm đúng 10 chữ số']
    },
    message: { 
      type: String, 
      required: true 
    }
  },
  {
    timestamps: true, // Tạo tự động trường createdAt và updatedAt
  }
);

// Tạo model Contact
const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
