const reviewService = require("../services/review.service");
const User = require("../models/UserModel");
const Product = require("../models/ProductModel");

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

// Xóa mềm đánh giá
const softDeleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    await reviewService.softDeleteReview(id);
    res.status(200).json({ message: "Đánh giá đã được xóa" });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Khôi phục đánh giá đã xóa
const restoreReview = async (req, res) => {
  try {
    const { id } = req.params;
    await reviewService.restoreReview(id);
    res.status(200).json({ message: "Đánh giá đã được khôi phục" });
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

module.exports = {
  getReviewsByProduct,
  addReview,
  softDeleteReview,
  restoreReview,
  calculateAverageRating,
};