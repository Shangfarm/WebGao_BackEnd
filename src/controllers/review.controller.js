const reviewService = require("../services/review.service");
const User = require("../models/UserModel");
const Product = require("../models/ProductModel");
const Review = require("../models/ReviewModel");

// Lấy danh sách đánh giá của sản phẩm
const getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const isAdmin = req.user && req.user.role === "admin"; // Kiểm tra quyền admin
    const reviews = await reviewService.getReviewsByProduct(productId, isAdmin);
    res.status(200).json({ message: "Danh sách đánh giá", data: reviews });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Thêm đánh giá cho sản phẩm
const addReview = async (req, res) => {
  try {
    const { userId, productId, rating, comment } = req.body;

    if (!userId || !productId || !rating) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    // Thêm kiểm tra userId và productId có tồn tại
    const [user, product] = await Promise.all([
      User.findById(userId),
      Product.findById(productId)
    ]);

    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    const review = await reviewService.addReview(userId, productId, rating, comment);
    res.status(201).json({ message: "Đánh giá đã được thêm", data: review });
  } catch (error) {
    if (error.code === 11000) { // MongoDB duplicate key error
      res.status(400).json({ message: "Bạn đã đánh giá sản phẩm này rồi" });
    } else {
      res.status(400).json({ message: "Đã xảy ra lỗi", error: error.message });
    }
  }
};

// Xóa đánh giá
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    await reviewService.deleteReview(id);
    res.status(200).json({ message: "Đánh giá đã được xóa vĩnh viễn" });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Sửa đánh giá đã xóa
const editReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating && !comment) {
      return res.status(400).json({ message: "Không có dữ liệu để cập nhật" });
    }

    const updatedReview = await reviewService.editReview(id, rating, comment);
    if (!updatedReview) {
      return res.status(404).json({ message: "Đánh giá không tồn tại" });
    }

    res.status(200).json({ message: "Cập nhật đánh giá thành công", data: updatedReview });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Tính trung bình điểm đánh giá của sản phẩm
const calculateAverageRating = async (req, res) => {
  try {
    const { productId } = req.params;
    const averageRating = await reviewService.calculateAverageRating(productId);
    res.status(200).json({ message: "Điểm đánh giá trung bình", data: averageRating });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

//Trả lời đánh giá
const replyToReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { userId, comment } = req.body;

    if (!userId || !comment) {
      return res.status(400).json({ message: "Thiếu thông tin trả lời" });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Đánh giá không tồn tại" });
    }

    review.replies.push({
      userId,
      comment
    });

    await review.save();

    res.status(200).json({ message: "Trả lời thành công", data: review.replies });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

module.exports = {
  getReviewsByProduct,
  addReview,
  deleteReview,
  editReview,
  calculateAverageRating,
  replyToReview,
};