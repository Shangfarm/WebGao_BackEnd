const express = require("express");
const router = express.Router();
const cartItemController = require("../controllers/cartItem.controller");

// Route: Lấy tất cả sản phẩm trong giỏ hàng của người dùng
router.get("/:userId", cartItemController.getAllCartItems);

// Route: Lấy tổng giá trị của giỏ hàng
router.get("/:userId/total", cartItemController.calculateCartTotal);

// Route: Lấy một sản phẩm trong giỏ hàng theo ID
router.get("/item/:id", cartItemController.getCartItemById);

// Route: Thêm sản phẩm vào giỏ hàng
router.post("/", cartItemController.addCartItem);

// Route: Cập nhật số lượng sản phẩm trong giỏ hàng
router.put("/:id", cartItemController.updateCartItem);

// Route: Xóa sản phẩm khỏi giỏ hàng
router.delete("/:id", cartItemController.deleteCartItem);

module.exports = router;