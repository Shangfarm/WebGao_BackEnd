const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  }, // Sản phẩm được đánh giá
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }, // Người đánh giá
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  }, // Điểm đánh giá (1-5 sao)
  comment: { 
    type: String 
  }, // Bình luận (tuỳ chọn)

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  createdById: { type: String },
  updatedById: { type: String },
  replies: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      comment: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }
  ]
});

// Đảm bảo không trùng lặp đánh giá của cùng một người dùng cho một sản phẩm
ReviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

// Middleware: Tự động cập nhật updatedAt
ReviewSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Middleware: Chỉ lấy các đánh giá chưa bị xóa
ReviewSchema.pre('find', function () {
  this.where({ deletedAt: null });
});

ReviewSchema.pre('findOne', function () {
  this.where({ deletedAt: null });
});

// Phương thức tĩnh: Tính trung bình điểm đánh giá của sản phẩm
ReviewSchema.statics.calculateAverageRating = async function (productId) {
  const ObjectId = mongoose.Types.ObjectId;
  const result = await this.aggregate([
    { $match: { productId: new ObjectId(productId) } },
    { $group: { _id: "$productId", averageRating: { $avg: "$rating" } } }
  ]);
  return result.length > 0 ? result[0].averageRating : 0;
};

module.exports = mongoose.model('Review', ReviewSchema);
