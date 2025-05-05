const Product = require("../models/ProductModel");
const Category = require("../models/CategoryModel");

// Lấy tất cả sản phẩm
const getAllProducts = async () => {
  return await Product.find().populate("categoryId", "name"); // Populate để lấy tên danh mục
};

// Lấy sản phẩm theo ID
const getProductById = async (id) => {
  return await Product.findById(id).populate("categoryId", "name");
};

// Tạo mới một sản phẩm
const createProduct = async (data) => {
  console.log("Dữ liệu nhận được:", data); // Log dữ liệu
  const newProduct = new Product(data);
  return await newProduct.save();
};

// Cập nhật sản phẩm
const updateProduct = async (id, data) => {
  return await Product.findByIdAndUpdate(id, data, { new: true });
};

// Xóa sản phẩm
const deleteProduct = async (id) => {
  return await Product.findByIdAndDelete(id);
};

// Thống kê tổng số sản phẩm thuộc từng danh mục
const getProductCountByCategory = async () => {
  const result = await Product.aggregate([
    {
      $match: {
        deletedAt: null,
        status: true
      }
    },
    {
      $group: {
        _id: "$categoryId",
        totalProducts: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "_id",
        as: "category"
      }
    },
    {
      $unwind: "$category"
    },
    {
      $project: {
        _id: 0,
        categoryId: "$category._id",
        categoryName: "$category.name",
        totalProducts: 1
      }
    }
  ]);

  return result;
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductCountByCategory,
};