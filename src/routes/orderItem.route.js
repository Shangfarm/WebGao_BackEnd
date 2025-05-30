const express = require("express");
const router = express.Router();
const orderItemController = require("../controllers/orderItem.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

//Route: Thống kê sản phẩm bán chạy – public
router.get("/top-selling-products", orderItemController.getTopSellingProducts);

// Route: Lấy tổng số sản phẩm đã bán – public
router.get("/total-sold", orderItemController.getTotalSoldItems);

//Route: Lấy tất cả sản phẩm trong đơn hàng – yêu cầu đăng nhập
router.get("/", verifyToken, orderItemController.getAllOrderItems);

//Route: Lấy sản phẩm theo ID – yêu cầu đăng nhập
router.get("/:id", verifyToken, orderItemController.getOrderItemById);

//Route: Tạo mới sản phẩm trong đơn hàng – yêu cầu đăng nhập
router.post("/", verifyToken, orderItemController.createOrderItem);

//Route: Cập nhật sản phẩm trong đơn hàng – yêu cầu đăng nhập
router.put("/:id", verifyToken, orderItemController.updateOrderItem);

//Route: Xóa sản phẩm khỏi đơn hàng – yêu cầu đăng nhập
router.delete("/:id", verifyToken, orderItemController.deleteOrderItem);

module.exports = router;
