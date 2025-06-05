const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const { verifyToken, requireAdmin } = require('../middlewares/auth.middleware')

//Route: Phân quyền Admin – Xem toàn bộ đơn hàng
router.get('/admin/orders', verifyToken, requireAdmin, orderController.getAllOrders)

//Route: Thống kê doanh thu – Chỉ admin
router.get("/revenue-stats", verifyToken, requireAdmin, orderController.getRevenueStats)

//Route: Thống kê số lượng đơn hàng – Chỉ admin
router.get("/order-stats", verifyToken, requireAdmin, orderController.getOrderStats)

//Route: Lấy danh sách đơn hàng mới nhất – Chỉ admin
router.get("/recent-orders", verifyToken, requireAdmin, orderController.getRecentOrders)

//Route: Lấy danh sách đơn hàng của người dùng (user)
router.get("/", verifyToken, orderController.getOrders)

//Route: Lấy chi tiết đơn hàng theo ID – phải đăng nhập
router.get("/:id", verifyToken, orderController.getOrderById)

//Route: Tạo mới một đơn hàng – phải đăng nhập
router.post("/", verifyToken, orderController.createOrder)

//Route: Cập nhật thông tin đơn hàng – phải đăng nhập
router.put("/momo/:id", verifyToken, orderController.updateOrderAfterMomo);
router.put("/:id", verifyToken, orderController.updateOrder)

//Route: Xóa mềm đơn hàng – phải đăng nhập
router.delete("/:id", verifyToken, orderController.softDeleteOrder)

//Route: Khôi phục đơn hàng đã xóa mềm – phải đăng nhập
router.put("/restore/:id", verifyToken, orderController.restoreOrder)

//Route: Cập nhật trạng thái vận chuyển – chỉ admin
router.patch("/:id/shipping-status", verifyToken, requireAdmin, orderController.updateShippingStatus)

//Route: Cập nhật trạng thái thanh toán – chỉ admin
router.patch("/:id/payment-status", verifyToken, requireAdmin, orderController.updatePaymentStatus)

// Route: Cập nhật trạng thái đơn hàng – chỉ Admin
router.patch("/:id/order-status", verifyToken, requireAdmin, orderController.updateOrderStatus);

module.exports = router;
