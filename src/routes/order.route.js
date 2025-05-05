const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");

//Route: Thống kê doanh thu 
router.get("/revenue-stats", orderController.getRevenueStats);

// Route: Thống kê số lượng đơn hàng 
router.get("/order-stats", orderController.getOrderStats);

// Route: Lấy danh sách đơn hàng mới nhất
router.get("/recent-orders", orderController.getRecentOrders);

// Route: Lấy danh sách đơn hàng với phân trang, lọc, và tìm kiếm
router.get("/", orderController.getOrders);

// Route: Lấy chi tiết đơn hàng theo ID
router.get("/:id", orderController.getOrderById);

// Route: Tạo mới một đơn hàng
router.post("/", orderController.createOrder);

// Route: Cập nhật thông tin đơn hàng
router.put("/:id", orderController.updateOrder);

// Route: Xóa mềm đơn hàng
router.delete("/:id", orderController.softDeleteOrder);

// Route: Khôi phục đơn hàng đã xóa mềm
router.put("/restore/:id", orderController.restoreOrder);

// Route: Cập nhật trạng thái vận chuyển
router.patch("/:id/shipping-status", orderController.updateShippingStatus);

module.exports = router;