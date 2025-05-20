const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }, // Người dùng

  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  }, // Sản phẩm được thêm vào wishlist

  createdAt: { type: Date, default: Date.now },
  createdById: { type: String },
  updatedAt: { type: Date, default: Date.now },
  updatedById: { type: String }
});

// ✅ Đảm bảo không trùng sản phẩm trong wishlist của cùng một người dùng
WishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

// ✅ Middleware: Tự động cập nhật updatedAt
WishlistSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// ✅ Middleware: Kiểm tra dữ liệu trước khi lưu
WishlistSchema.pre('save', async function (next) {
  if (!this.userId || !this.productId) {
    throw new Error('userId và productId là bắt buộc');
  }
  next();
});

module.exports = mongoose.model('Wishlist', WishlistSchema);
