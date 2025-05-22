const mongoose = require("mongoose");

const PromotionSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Tên chương trình khuyến mãi
  description: { type: String }, // Mô tả chương trình khuyến mãi
  discountType: { type: String, enum: ["percentage", "fixed"], required: true }, // Loại giảm giá (phần trăm hoặc cố định)
  discountValue: { type: Number, required: true }, // Giá trị giảm giá
  startDate: { type: Date, required: true }, // Ngày bắt đầu
  endDate: { type: Date, required: true }, // Ngày kết thúc
  status: { type: Boolean, default: true }, // Trạng thái (còn hiệu lực hay không)
  deletedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Promotion", PromotionSchema);
