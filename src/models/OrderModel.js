const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Người đặt hàng
  userName: { type: String, required: true }, // Tên người dùng (lưu trữ tại thời điểm tạo đơn hàng)
  couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', default: null }, // Mã giảm giá (nếu có)
  totalAmount: { type: Number, required: true }, // Tổng tiền sau giảm giá
  paymentMethod: { type: String, enum: ['COD', 'MOMO'], default: 'COD' }, // Phương thức thanh toán
  paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'FAILED'], default: 'PENDING' }, // Trạng thái thanh toán
  promotionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Promotion', default: null },
  totalCost: { type: Number }, // Tổng chưa giảm
  transaction_id: { type: String },
  payment_intent_id: { type: String },
  orderStatus: { 
    type: String, 
    enum: ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED'], 
    default: 'PENDING' 
  }, // Trạng thái đơn hàng
  shippingStatus: { 
    type: String, 
    enum: ['PROCESSING', 'IN_TRANSIT', 'DELIVERED', 'FAILED'], 
    default: 'PROCESSING' 
  }, // Trạng thái vận chuyển

  // Địa chỉ giao hàng chi tiết
  shippingAddress: {
    houseNumber: { type: String, required: true }, // Số nhà
    ward: { type: String, required: true },        // Phường
    district: { type: String, required: true },    // Quận
    city: { type: String, required: true },        // Thành phố
    phoneNumber: { type: String, required: true }  // Số điện thoại
  },

  // Liên kết với phương thức vận chuyển
  shippingMethodId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ShippingMethod', 
    required: true 
  }, // Phương thức vận chuyển đã chọn

  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],

  createdAt: { type: Date, default: Date.now },
  createdById: { type: String },
  updatedAt: { type: Date },
  updatedById: { type: String },
  deletedAt: { type: Date, default: null }
});

module.exports = mongoose.model('Order', OrderSchema);
