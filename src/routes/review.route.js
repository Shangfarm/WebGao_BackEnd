const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");

// Route: Lấy danh sách đánh giá của sản phẩm
router.get("/:productId", reviewController.getReviewsByProduct);

// Route: Thêm đánh giá cho sản phẩm
router.post("/", reviewController.addReview);

// Route: Xóa mềm đánh giá
router.delete("/:id", reviewController.softDeleteReview);

// Route: Khôi phục đánh giá đã xóa mềm
router.put("/restore/:id", reviewController.restoreReview);

// Route: Tính trung bình điểm đánh giá của sản phẩm
router.get("/:productId/average", reviewController.calculateAverageRating);

module.exports = router;