const productService = require("../services/product.service");
const Product = require("../models/ProductModel");

// Lấy tất cả sản phẩm
const getAllProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy sản phẩm theo ID
const getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Tạo mới một sản phẩm
const createProduct = async (req, res) => {
  try {
    const { name, price, stock, categoryId } = req.body;

    // Kiểm tra dữ liệu bắt buộc
    if (!name || !price || !stock || !categoryId) {
      return res.status(400).json({
        message: "Thiếu dữ liệu bắt buộc. Vui lòng cung cấp name, price, stock và categoryId.",
      });
    }

    // Gọi service để tạo sản phẩm
    const savedProduct = await productService.createProduct(req.body);
    res.status(201).json({
      message: "Sản phẩm đã được tạo thành công.",
      data: savedProduct,
    });
  } catch (error) {
    console.error("Lỗi khi tạo sản phẩm:", error);
    res.status(500).json({
      message: "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.",
      error: error.message,
    });
  }
};

// Cập nhật sản phẩm
const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await productService.updateProduct(req.params.id, req.body);
    if (!updatedProduct) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Xóa sản phẩm
const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await productService.deleteProduct(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
    res.json({ message: "Xóa sản phẩm thành công" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy danh sách sản phẩm với phân trang, tìm kiếm và lọc
const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, categoryId, minPrice, maxPrice, inStock } = req.query;
    const skip = (page - 1) * limit;
    const filter = { deletedAt: null }; // Chỉ lấy sản phẩm chưa bị xóa mềm

    // Tìm kiếm theo tên sản phẩm
    if (search) {
      filter.name = { $regex: search, $options: "i" }; // Không phân biệt hoa thường
    }

    // Lọc theo trạng thái
    if (status) {
      filter.status = status === "true";
    }

    // Lọc theo danh mục
    if (categoryId) {
      filter.categoryId = categoryId;
    }

    // Lọc theo khoảng giá
    if (minPrice) {
      filter.price = { ...filter.price, $gte: parseInt(minPrice) };
    }
    if (maxPrice) {
      filter.price = { ...filter.price, $lte: parseInt(maxPrice) };
    }

    // Lọc theo sản phẩm còn hàng hay hết hàng
    if (inStock === "true") {
      filter.stock = { $gt: 0 }; // Còn hàng (stock > 0)
    } else if (inStock === "false") {
      filter.stock = 0; // Hết hàng (stock == 0)
    }

    // Lấy danh sách sản phẩm với phân trang
    const products = await Product.find(filter)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      message: "Danh sách sản phẩm",
      data: products,
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

// Xóa mềm sản phẩm
const softDeleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    product.deletedAt = new Date();
    await product.save();

    res.status(200).json({ message: "Sản phẩm đã được xóa mềm", data: product });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Khôi phục sản phẩm
const restoreProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    product.deletedAt = null;
    await product.save();

    res.status(200).json({ message: "Sản phẩm đã được khôi phục", data: product });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};


// Thống kê sản phẩm còn hàng và hết hàng
const getStockStatus = async (req, res) => {
  try {
    const productsInStock = await Product.find({
      stock: { $gt: 0 },
      status: true,
      deletedAt: null
    }).select("name stock");

    const productsOutOfStock = await Product.find({
      stock: 0,
      status: true,
      deletedAt: null
    }).select("name stock");

    res.status(200).json({
      message: "Thống kê tình trạng sản phẩm",
      data: {
        productsInStock,
        productsOutOfStock
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Thống kê tổng số sản phẩm thuộc từng danh mục
const getProductCountByCategory = async (req, res) => {
  try {
    const data = await productService.getProductCountByCategory();
    res.status(200).json({ message: "Thống kê số lượng sản phẩm theo danh mục", data });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};
module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  softDeleteProduct,
  restoreProduct,
  getStockStatus,
  getProductCountByCategory,
};