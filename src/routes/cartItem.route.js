const express = require("express");
const router = express.Router();
const cartItemController = require("../controllers/cartItem.controller");
const { verifyToken } = require('../middlewares/auth.middleware');

//Lấy tất cả sản phẩm trong giỏ hàng của người dùng (cần đăng nhập)
router.get("/:userId", verifyToken, cartItemController.getAllCartItems);

//Lấy tổng giá trị của giỏ hàng (cần đăng nhập)
router.get("/:userId/total", verifyToken, cartItemController.calculateCartTotal);

//Lấy một sản phẩm trong giỏ hàng theo ID (cần đăng nhập)
router.get("/item/:id", verifyToken, cartItemController.getCartItemById);

//Thêm sản phẩm vào giỏ hàng – cần đăng nhập
router.post("/", verifyToken, cartItemController.addCartItem);

//Cập nhật số lượng sản phẩm – cần đăng nhập
router.put("/:id", verifyToken, cartItemController.updateCartItem);

//Xóa sản phẩm khỏi giỏ hàng – cần đăng nhập
router.delete("/:id", verifyToken, cartItemController.deleteCartItem);

module.exports = router;
