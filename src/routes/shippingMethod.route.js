const express = require("express");
const router = express.Router();
const shippingMethodController = require("../controllers/shippingMethod.controller");

// Route: Lọc, tìm kiếm, phân trang phương thức vận chuyển 
router.get("/", shippingMethodController.getShippingMethod);
// // Route: Lấy tổng danh sách phương thức vận chuyển
// router.get("/", shippingMethodController.getAllShippingMethods);

// Route: Lấy danh sách theo id phương thức vận chuyển
router.get("/:id", shippingMethodController.getShippingMethodById);

// Route: Thêm phương thức vận chuyển mới
router.post("/", shippingMethodController.createShippingMethod);

// Route: Cập nhật phương thức vận chuyển
router.put("/:id", shippingMethodController.updateShippingMethod);

// Route: Xóa mềm phương thức vận chuyển
router.delete("/:id", shippingMethodController.softDeleteShippingMethod);

// Khôi phục
router.put("/restore/:id", shippingMethodController.restoreShippingMethod);

// Route: Xóa phương thức vận chuyển
router.delete("/delete/:id", shippingMethodController.deleteShippingMethod);

module.exports = router;