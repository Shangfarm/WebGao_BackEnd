const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },     // Người dùng
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // Sản phẩm
  quantity: { type: Number, default: 1, min: 1 },                                    // Số lượng
  totalPrice: { type: Number, default: 0 },                                          // Tổng giá trị sản phẩm trong giỏ hàng

  createdAt: { type: Date, default: Date.now },
  createdById: { type: String },
  updatedAt: { type: Date },
  updatedById: { type: String },
  deletedAt: { type: Date }
});

// Middleware: Tính tổng giá trị trước khi lưu
CartItemSchema.pre('save', async function (next) {
  const Product = mongoose.model('Product'); // Import ProductModel
  const product = await Product.findById(this.productId);
  if (!product) {
    throw new Error('Sản phẩm không tồn tại');
  }
  this.totalPrice = product.price * this.quantity; // Tính tổng giá trị
  next();
});

// Đảm bảo không trùng sản phẩm trong giỏ hàng của cùng một người dùng
CartItemSchema.index({ userId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model('CartItem', CartItemSchema);
