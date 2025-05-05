const express = require("express");
const router = express.Router();
const orderItemController = require("../controllers/orderItem.controller");

// Route: Thống kê sản phẩm bán chạy
router.get("/top-selling-products", orderItemController.getTopSellingProducts);

// Route: Lấy tất cả sản phẩm trong đơn hàng
router.get("/", orderItemController.getAllOrderItems);

// Route: Lấy sản phẩm trong đơn hàng theo ID
router.get("/:id", orderItemController.getOrderItemById);

// Route: Tạo mới một sản phẩm trong đơn hàng
router.post("/", orderItemController.createOrderItem);

// Route: Cập nhật sản phẩm trong đơn hàng
router.put("/:id", orderItemController.updateOrderItem);

// Route: Xóa sản phẩm trong đơn hàng
router.delete("/:id", orderItemController.deleteOrderItem);



module.exports = router;