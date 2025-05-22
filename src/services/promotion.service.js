const Promotion = require("../models/PromotionModel");

// Lấy danh sách tất cả chương trình khuyến mãi
const getAllPromotions = async () => {
  return await Promotion.find({deletedAt: null});
};

// Lấy danh sách khuyến mãi đang áp dụng
const getActivePromotions = async () => {
  return await Promotion.find({
    status: true,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
    deletedAt: null,
  });
};

// Tạo chương trình khuyến mãi mới
const createPromotion = async (promotionData) => {
  const promotion = new Promotion(promotionData);
  return await promotion.save();
};

// Cập nhật chương trình khuyến mãi
const updatePromotion = async (id, promotionData) => {
  return await Promotion.findByIdAndUpdate(id, promotionData, { new: true });
};

// Xóa mềm chương trình khuyến mãi
const softDeletePromotion = async (id) => {
  return await Promotion.findByIdAndUpdate(
    id,
    {
      deletedAt: new Date(),
      status: false  // ✅ Tự động tắt trạng thái nếu đang hoạt động
    },
    { new: true }
  );
};
// Khôi phục chương trình khuyến mãi đã xóa
const restorePromotion = async (id) => {
  return await Promotion.findByIdAndUpdate(
    id,
    {
      deletedAt: null,
      status: false  // ✅ Giữ nguyên không hoạt động khi khôi phục
    },
    { new: true }
  );
};
// Xóa chương trình khuyến mãi
const deletePromotion = async (id) => {
  return await Promotion.findByIdAndDelete(id);
};

const applyAutoPromotion = async (cartTotal) => {
  const promotions = await Promotion.find({
    status: true,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
    deletedAt: null
  });

  // Nếu không có khuyến mãi nào, trả lại giá trị gốc
  if (promotions.length === 0) {
    return {
      totalAfterDiscount: cartTotal,
      appliedPromotion: null
    };
  }

  // Giả sử chỉ áp dụng khuyến mãi đầu tiên tìm thấy (ưu tiên cao nhất)
  const promotion = promotions[0];
  let totalAfterDiscount = cartTotal;

  if (promotion.discountType === "percentage") {
    totalAfterDiscount -= (cartTotal * promotion.discountValue) / 100;
  } else if (promotion.discountType === "fixed") {
    totalAfterDiscount -= promotion.discountValue;
  }

  totalAfterDiscount = Math.max(totalAfterDiscount, 0);

  return {
    totalAfterDiscount,
    appliedPromotion: promotion
  };
};


// Thêm vào promotion.service.js
const getPromotionsWithPagination = async (filter = {}, skip = 0, limit = 10) => {
  const [promotions, total] = await Promise.all([
    Promotion.find(filter).skip(skip).limit(limit),
    Promotion.countDocuments(filter)
  ]);
  
  return { promotions, total };
};

module.exports = {
  getAllPromotions,
  getActivePromotions,
  createPromotion,
  updatePromotion,
  softDeletePromotion,
  deletePromotion,
  restorePromotion,
  applyAutoPromotion,
  getPromotionsWithPagination
};