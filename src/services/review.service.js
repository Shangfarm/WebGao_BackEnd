const Review = require("../models/ReviewModel");

const getReviewsByProduct = async (productId, isAdmin = false) => {
  const reviews = await Review.find({ productId })
    .populate("userId", "username avatar")                    // người viết đánh giá
    .populate("replies.userId", "username avatar")            // người trả lời đánh giá
    .lean(); // dùng lean để xử lý nhanh

  // Hàm ẩn tên
  const maskWithRandomStars = (name) => {
    if (!name || typeof name !== 'string') return "Ẩn danh";
    return name
      .split(' ')
      .map(word => {
        const keepChars = word.length <= 3 ? 1 : 2;
        const maskedPart = '*'.repeat(Math.max(0, word.length - keepChars));
        return word.slice(0, keepChars) + maskedPart;
      })
      .join(' ');
  };

  // Xử lý che tên nếu không phải admin
  const processedReviews = reviews.map((review) => {
    const maskedUser = review.userId
      ? {
          ...review.userId,
          username: isAdmin ? review.userId.username : maskWithRandomStars(review.userId.username),
        }
      : { username: "Ẩn danh" };

    const replies = (review.replies || []).map((reply) => {
      const replyUser = reply.userId
        ? {
            ...reply.userId,
            username: isAdmin ? reply.userId.username : maskWithRandomStars(reply.userId.username),
          }
        : { username: "Ẩn danh" };

      return {
        ...reply,
        userId: replyUser
      };
    });

    return {
      ...review,
      userId: maskedUser,
      replies
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

// Xóa đánh giá
const deleteReview = async (id) => {
  return await Review.findByIdAndDelete(id);
};
// Sửa đánh giá
const editReview = async (id, rating, comment) => {
  const updateData = {};
  if (rating !== undefined) updateData.rating = rating;
  if (comment !== undefined) updateData.comment = comment;
  updateData.updatedAt = new Date();

  return await Review.findByIdAndUpdate(id, updateData, { new: true });
};

// Tính trung bình điểm đánh giá của sản phẩm
const calculateAverageRating = async (productId) => {
  return await Review.calculateAverageRating(productId);
};

module.exports = {
  getReviewsByProduct,
  addReview,
  deleteReview,
  editReview,
  calculateAverageRating
};