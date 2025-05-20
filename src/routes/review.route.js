const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

//Lấy danh sách đánh giá của sản phẩm – Public
router.get("/:productId", reviewController.getReviewsByProduct);

//Tính trung bình điểm đánh giá – Public
router.get("/:productId/average", reviewController.calculateAverageRating);

//Thêm đánh giá – Phải đăng nhập
router.post("/", verifyToken, reviewController.addReview);

//Xóa đánh giá – Phải đăng nhập
router.delete("/:id", verifyToken, reviewController.deleteReview);

//Sửa đánh giá – Phải đăng nhập
router.put("/:id", verifyToken, reviewController.editReview);

//Trả lời đánh giá – Phải đăng nhập
router.post("/:reviewId/reply", verifyToken, reviewController.replyToReview);

module.exports = router;
