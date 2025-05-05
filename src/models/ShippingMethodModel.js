// filepath: d:\DoAn_CoSo\WebGao\src\models\ShippingMethodModel.js
const mongoose = require("mongoose");

const ShippingMethodSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Tên phương thức vận chuyển (ví dụ: Giao hàng nhanh)
  description: { type: String }, // Mô tả (nếu cần)
  price: { type: Number, required: true }, // Phí vận chuyển
  estimatedDeliveryTime: { type: String }, // Thời gian giao hàng dự kiến (ví dụ: 1-2 ngày)
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date, default: null } // Xóa mềm
});

module.exports = mongoose.model("ShippingMethod", ShippingMethodSchema);