const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, minlength: 3, maxlength: 20 }, // mã giảm giá
  description: { type: String },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true }, // loại giảm giá phần trăm và cố địnhđịnh
  discountValue: { type: Number, required: true, min: 0 }, // giá trị giảm
  maxDiscount: { type: Number, min: 0 }, // giá trị giảm tối đa (nếu có)
  quantity: { type: Number, required: true, min: 0 }, // số lượng mã còn dùng được
  expiryDate: { type: Date, required: true }, // hạn sử dụng

  status: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  createdById: { type: String },
  updatedAt: { type: Date },
  updatedById: { type: String },
  deletedAt: { type: Date }
});

// Kiểm tra mã giảm giá đã hết hạn hay chưa
CouponSchema.methods.isExpired = function () {
  return this.expiryDate < new Date();
};

// Sử dụng mã giảm giá
CouponSchema.methods.useCoupon = function () {
  if (this.isExpired()) {
    throw new Error('Mã giảm giá đã hết hạn');
  }
  if (this.quantity <= 0) {
    throw new Error('Mã giảm giá đã hết số lượng sử dụng');
  }
  this.quantity -= 1;
  return this.save();
};

// Middleware: Tự động cập nhật trạng thái mã giảm giá
CouponSchema.pre('save', function (next) {
  if (this.expiryDate < new Date() || this.quantity <= 0) {
    this.status = false;
  }
  next();
});

module.exports = mongoose.model('Coupon', CouponSchema);
