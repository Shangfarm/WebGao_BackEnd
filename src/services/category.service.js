const Category = require("../models/CategoryModel");

// Lấy tất cả categories
const getAllCategories = async () => {
  return await Category.findActive();
};

// Tạo mới một category
const createCategory = async (data) => {
  const category = new Category(data);
  return await category.save();
};

const updateCategory = async (id, data) => {
  return await Category.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

const softDeleteCategory = async (id) => {
  const category = await Category.findById(id);
  if (category) {
    await category.softDelete();
  }
  return category;
};

const deleteCategory = async (id) => {
  return await Category.findByIdAndDelete(id);
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  softDeleteCategory,
  deleteCategory,
};