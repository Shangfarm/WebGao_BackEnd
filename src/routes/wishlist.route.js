const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlist.controller");

// Route: Lấy danh sách yêu thích của người dùng
router.get("/:userId", wishlistController.getWishlist);

// Route: Thêm sản phẩm vào danh sách yêu thích
router.post("/", wishlistController.addToWishlist);

// Route: Xóa mềm sản phẩm khỏi danh sách yêu thích
router.delete("/:id", wishlistController.softDeleteWishlistItem);

// Route: Khôi phục sản phẩm đã xóa mềm
router.patch("/:id/restore", wishlistController.restoreWishlistItem);

module.exports = router;