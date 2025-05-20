const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlist.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

// Lấy danh sách yêu thích của người dùng – cần đăng nhập
router.get("/:userId", verifyToken, wishlistController.getWishlist);

// Thêm sản phẩm vào danh sách yêu thích – cần đăng nhập
router.post("/", verifyToken, wishlistController.addToWishlist);

// Xóa vĩnh viễn sản phẩm khỏi danh sách yêu thích – cần đăng nhập
router.delete("/:id", verifyToken, wishlistController.deleteWishlistItem);

module.exports = router;
