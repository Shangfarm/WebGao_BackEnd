const reviewService = require("../services/review.service");
const Review = require("../models/ReviewModel");

// Lấy danh sách đánh giá của sản phẩm
const getReviewsByProduct = async (productId, isAdmin = false) => {
  const reviews = await Review.find({ productId })
    .populate({
      path: "userId",
      select: "username",
      options: { lean: true }
    });

  // Xử lý trường hợp userId không tồn tại hoặc populate thất bại
  const processedReviews = reviews.map((review) => {
    // Clone review object để tránh thay đổi dữ liệu gốc
    const reviewData = review.toObject ? review.toObject() : { ...review._doc };
    
   // Hàm ẩn tên bằng dấu * ngẫu nhiên
  const maskWithRandomStars = (name) => {
    if (!name || typeof name !== 'string') return "Ẩn danh";
    
    return name
      .split(' ')
      .map(word => {
        // Giữ lại 1-2 ký tự đầu tùy độ dài
        const keepChars = word.length <= 3 ? 1 : 2;
        const visiblePart = word.slice(0, keepChars);
        
        // Thay phần còn lại hoàn toàn bằng dấu *
        const maskedPart = '*'.repeat(Math.max(0, word.length - keepChars));
        
        return visiblePart + maskedPart;
      })
      .join(' ');
  };

  let userData = { username: "Ẩn danh" };
  if (review.userId?.username) {
    userData = {
      ...review.userId,
      username: isAdmin ? review.userId.username : maskWithRandomStars(review.userId.username)
    };
  }

  return {
    ...reviewData,
    userId: userData
  };
});

return processedReviews;
};

// Thêm đánh giá cho sản phẩm
const addReview = async (userId, productId, rating, comment) => {
  const existingReview = await Review.findOne({ userId, productId });
  if (existingReview) {
    throw new Error("Bạn đã đánh giá sản phẩm này rồi");
  }

  const review = new Review({ userId, productId, rating, comment });
  return await review.save();
};

// Xóa mềm đánh giá
const softDeleteReview = async (id) => {
  return await Review.findByIdAndUpdate(id, { deletedAt: new Date() });
};

// Khôi phục đánh giá đã xóa
const restoreReview = async (id) => {
  return await Review.findByIdAndUpdate(id, { deletedAt: null });
};

// Tính trung bình điểm đánh giá của sản phẩm
const calculateAverageRating = async (productId) => {
  return await Review.calculateAverageRating(productId);
};

module.exports = {
  getReviewsByProduct,
  addReview,
  softDeleteReview,
  restoreReview,
  calculateAverageRating,
};