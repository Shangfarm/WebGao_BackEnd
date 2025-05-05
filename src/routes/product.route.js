const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");


// Thống kê tình trạng sản phẩm (còn hàng / hết hàng)
router.get("/stock-status", productController.getStockStatus);

// Thống kê sản phẩm theo danh mục
router.get("/category", productController.getProductCountByCategory);

// Lấy danh sách sản phẩm với phân trang, lọc, và tìm kiếm
router.get("/", productController.getProducts);

// Lấy chi tiết sản phẩm theo ID
router.get("/:id", productController.getProductById);

// Tạo mới sản phẩm
router.post("/", productController.createProduct);

// Cập nhật sản phẩm
router.put("/:id", productController.updateProduct);

// Xóa mềm sản phẩm
router.delete("/:id", productController.softDeleteProduct);

// Khôi phục sản phẩm đã xóa mềm
router.put("/restore/:id", productController.restoreProduct);


module.exports = router;