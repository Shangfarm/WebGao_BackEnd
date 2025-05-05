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
  return await Promotion.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
};

// Khôi phục chương trình khuyến mãi đã xóa
const restorePromotion = async (id) => {
  return await Promotion.findByIdAndUpdate(id, { deletedAt: null }, { new: true });
};
// Xóa chương trình khuyến mãi
const deletePromotion = async (id) => {
  return await Promotion.findByIdAndDelete(id);
};

const applyPromotionToCartItems = async (cartItems) => {
  const promotions = await Promotion.find({
    status: true,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
  });

  // Tạo Map để tra cứu nhanh hơn
  const productPromotions = new Map();
  const categoryPromotions = new Map();

  promotions.forEach((promo) => {
    promo.applicableProducts.forEach((productId) => {
      if (!productPromotions.has(productId.toString())) {
        productPromotions.set(productId.toString(), []);
      }
      productPromotions.get(productId.toString()).push(promo);
    });

    promo.applicableCategories.forEach((categoryId) => {
      if (!categoryPromotions.has(categoryId.toString())) {
        categoryPromotions.set(categoryId.toString(), []);
      }
      categoryPromotions.get(categoryId.toString()).push(promo);
    });
  });

  // Áp dụng khuyến mãi cho từng sản phẩm
  cartItems.forEach((item) => {
    const productPromos = productPromotions.get(item.productId._id.toString()) || [];
    const categoryPromos = categoryPromotions.get(item.productId.categoryId?.toString()) || [];
    const applicablePromos = [...productPromos, ...categoryPromos];

    applicablePromos.forEach((promo) => {
      if (promo.discountType === "percentage") {
        item.totalPrice -= (item.totalPrice * promo.discountValue) / 100;
      } else if (promo.discountType === "fixed") {
        item.totalPrice -= promo.discountValue;
      }
      item.totalPrice = Math.max(item.totalPrice, 0);
    });
  });

  return cartItems;
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
  applyPromotionToCartItems,
  getPromotionsWithPagination
};