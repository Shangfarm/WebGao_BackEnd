const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");

// Lấy tất cả danh mục
router.get("/", categoryController.getCategories);

// Lấy chi tiết danh mục theo ID
router.get("/:id", categoryController.getCategoryById);

// Tạo mới danh mục
router.post("/", categoryController.createCategory);

// Cập nhật danh mục
router.put("/:id", categoryController.updateCategory);

// Xóa mềm danh mục
router.delete("/:id", categoryController.softDeleteCategory);

// Xóa hoàn toàn danh mục
router.delete("/delete/:id", categoryController.deleteCategory);

// Khôi phục danh mục
router.put("/restore/:id", categoryController.restoreCategory);

module.exports = router;
