const categoryService = require("../services/category.service");
const Category = require("../models/CategoryModel");

// Lấy tất cả danh mục chưa bị xóa
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findActive();
    res.status(200).json({ message: "Danh sách tất cả danh mục", data: categories });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Lấy danh mục theo ID
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category || category.deletedAt) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }

    res.status(200).json({ message: "Chi tiết danh mục", data: category });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Tạo mới một danh mục
const createCategory = async (req, res) => {
  try {
    const newCategory = new Category(req.body);
    await newCategory.save();
    res.status(201).json({ message: "Danh mục đã được tạo thành công", data: newCategory });
  } catch (error) {
    res.status(400).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Cập nhật danh mục
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedCategory = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedCategory) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }

    res.status(200).json({ message: "Danh mục đã được cập nhật", data: updatedCategory });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Xóa mềm danh mục
const softDeleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }

    await category.softDelete();
    res.status(200).json({ message: "Danh mục đã được xóa mềm", data: category });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Khôi phục danh mục đã xóa mềm
const restoreCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm danh mục theo ID
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }

    // Đặt lại deletedAt thành null
    category.deletedAt = null;
    await category.save();

    res.status(200).json({ message: "Danh mục đã được khôi phục", data: category });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Xóa hoàn toàn danh mục
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCategory = await Category.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }

    res.status(200).json({ message: "Danh mục đã được xóa hoàn toàn" });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Lấy danh sách danh mục với phân trang, tìm kiếm, và lọc
const getCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const skip = (page - 1) * limit;
    const filter = { deletedAt: null };

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    if (status) {
      filter.status = status === "true";
    }

    const categories = await Category.find(filter)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Category.countDocuments(filter);

    res.status(200).json({
      message: "Danh sách danh mục",
      data: categories,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};


module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  softDeleteCategory,
  restoreCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
};