const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Tên sản phẩm
  description: { type: String },
  image: { type: String }, // URL hình ảnh
  price: { type: Number, required: true }, // Giá bán
  stock: { type: Number, required: true }, // Số lượng tồn kho
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }, // Liên kết tới danh mục
  discount: { type: Number, default: 0 }, // % giảm giá (nếu có)
  totalQuantity: { type: Number, default: 0 }, // Tổng số lượng đã bán
  status: { type: Boolean, default: true }, // Còn bán hay ngừng bán
  createdAt: { type: Date, default: Date.now },
  createdById: { type: String },
  updatedAt: { type: Date },
  updatedById: { type: String },
  deletedAt: { type: Date }
});

module.exports = mongoose.model('Product', ProductSchema);
