const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true }, // Đơn hàng chứa sản phẩm này
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // Sản phẩm được mua
  quantity: { type: Number, required: true, min: 1 }, // Số lượng sản phẩm tối thiểu là 1
  price: { type: Number, required: true, min: 0 },    // Giá tại thời điểm mua

  createdAt: { type: Date, default: Date.now },
  createdById: { type: String },
  updatedAt: { type: Date },
  updatedById: { type: String },
  deletedAt: { type: Date }
});

// Phương thức: Tính tổng giá trị của một sản phẩm trong đơn hàng
OrderItemSchema.methods.getTotalPrice = function () {
  return this.price * this.quantity;
};

// Middleware: Kiểm tra dữ liệu trước khi lưu
OrderItemSchema.pre('save', function (next) {
  if (this.quantity <= 0) {
    throw new Error('Số lượng sản phẩm phải lớn hơn 0');
  }
  if (this.price < 0) {
    throw new Error('Giá sản phẩm không được âm');
  }
  next();
});

module.exports = mongoose.model('OrderItem', OrderItemSchema);
