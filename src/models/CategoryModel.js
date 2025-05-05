const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  status: { type: Boolean, default: true }, // true = hiện, false = ẩn
  createdAt: { type: Date, default: Date.now },
  createdById: { type: String },
  updatedAt: { type: Date },
  updatedById: { type: String },
  deletedAt: { type: Date } // Trường để đánh dấu đã xóa
});

// Phương thức để đánh dấu danh mục là đã xóa
CategorySchema.methods.softDelete = async function () {
  this.deletedAt = new Date();
  await this.save();
};

// Phương thức để khôi phục danh mục đã xóa
CategorySchema.methods.restore = async function () {
  this.deletedAt = null;
  await this.save();
};

// Phương thức tĩnh để lấy tất cả danh mục chưa bị xóa
CategorySchema.statics.findActive = function () {
  return this.find({ deletedAt: null });
};

module.exports = mongoose.model('Category', CategorySchema);
