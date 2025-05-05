// filepath: d:\DoAn_CoSo\WebGao\src\controllers\shippingMethod.controller.js
const shippingMethodService = require("../services/shippingMethod.service");
const ShippingMethod = require("../models/ShippingMethodModel");

// Lấy danh sách phương thức vận chuyển
const getAllShippingMethods = async (req, res) => {
  try {
    const shippingMethods = await shippingMethodService.getAllShippingMethods();
    res.status(200).json({ message: "Danh sách phương thức vận chuyển", data: shippingMethods });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Lấy danh mục theo ID
const getShippingMethodById = async (req, res) => {
  try {
    const { id } = req.params;
    const shippingMethod = await shippingMethodService.getShippingMethodById(id);

    if (!shippingMethod || shippingMethod.deletedAt) {
      return res.status(404).json({ message: "Không tìm thấy phương thức vận chuyển" });
    }

    res.status(200).json({ message: "Chi tiết phương thức vận chuyển", data: shippingMethod });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};


// Thêm phương thức vận chuyển mới
const createShippingMethod = async (req, res) => {
  try {
    const { name, description, price, estimatedDeliveryTime } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!name || !price) {
      return res.status(400).json({ message: "Thiếu dữ liệu bắt buộc" });
    }

    const newShippingMethod = new ShippingMethod({
      name,
      description,
      price,
      estimatedDeliveryTime,
    });

    await newShippingMethod.save();
    res.status(201).json({ message: "Phương thức vận chuyển đã được thêm", data: newShippingMethod });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Cập nhật phương thức vận chuyển
const updateShippingMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const shippingMethod = await shippingMethodService.updateShippingMethod(id, req.body);
    res.status(200).json({ message: "Phương thức vận chuyển đã được cập nhật", data: shippingMethod });
  } catch (error) {
    res.status(400).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Xóa phương thức vận chuyển
const deleteShippingMethod = async (req, res) => {
  try {
    const { id } = req.params;
    await shippingMethodService.deleteShippingMethod(id);
    res.status(200).json({ message: "Phương thức vận chuyển đã được xóa" });
  } catch (error) {
    res.status(400).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Xóa mềm
const softDeleteShippingMethod = async (req, res) => {
  try {
    const { id } = req.params;
    await shippingMethodService.softDeleteShippingMethod(id);
    res.status(200).json({ message: "Đã xóa (mềm) phương thức vận chuyển" });
  } catch (error) {
    res.status(400).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Khôi phục
const restoreShippingMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const restored = await shippingMethodService.restoreShippingMethod(id);
    res.status(200).json({ message: "Khôi phục thành công", data: restored });
  } catch (error) {
    res.status(400).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Lấy danh sách phương thức vận chuyển với phân trang, tìm kiếm, và lọc
const getShippingMethod = async (req, res) => {
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

    const shippingMethods = await ShippingMethod.find(filter)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ShippingMethod.countDocuments(filter);

    res.status(200).json({
      message: "Danh sách phương thức vận chuyển (lọc & phân trang)",
      data: shippingMethods,
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
  getAllShippingMethods,
  getShippingMethodById,
  createShippingMethod,
  updateShippingMethod,
  deleteShippingMethod,
  softDeleteShippingMethod,
  restoreShippingMethod,  
  getShippingMethod,
};