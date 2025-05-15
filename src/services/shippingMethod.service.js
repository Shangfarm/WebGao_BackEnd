// filepath: d:\DoAn_CoSo\WebGao\src\services\shippingMethod.service.js
const ShippingMethod = require("../models/ShippingMethodModel");

// Lấy danh sách phương thức vận chuyển
const getAllShippingMethods = async () => {
  return await ShippingMethod.find({ deletedAt: null });
};

// Lấy danh sách phương thức vận chuyển theo Id
const getShippingMethodById = async (id) => {
  return await ShippingMethod.findById(id);
};

// Thêm phương thức vận chuyển mới
const createShippingMethod = async (data) => {
  const shippingMethod = new ShippingMethod(data);
  return await shippingMethod.save();
};

// Cập nhật phương thức vận chuyển
const updateShippingMethod = async (id, data) => {
  return await ShippingMethod.findByIdAndUpdate(id, data, { new: true });
};

// Xóa phương thức vận chuyển
const deleteShippingMethod = async (id) => {
  return await ShippingMethod.findByIdAndDelete(id);
};

// Xóa mềm phương thức vận chuyển
const softDeleteShippingMethod = async (id) => {
  return await ShippingMethod.findByIdAndUpdate(
    id,
    { deletedAt: new Date() },
    { new: true }
  );
};

// Khôi phục phương thức vận chuyển đã xóa
const restoreShippingMethod = async (id) => {
  return await ShippingMethod.findByIdAndUpdate(
    id,
    { $unset: { deletedAt: "" } },
    { new: true }
  );
};

module.exports = {
  getAllShippingMethods,
  getShippingMethodById,
  createShippingMethod,
  updateShippingMethod,
  deleteShippingMethod,
  softDeleteShippingMethod,
  restoreShippingMethod,
};