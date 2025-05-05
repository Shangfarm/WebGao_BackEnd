const orderItemService = require("../services/orderItem.service");

// Lấy tất cả sản phẩm trong đơn hàng
const getAllOrderItems = async (req, res) => {
  try {
    const { orderId } = req.params;
    const orderItems = await orderItemService.getAllOrderItems(orderId);
    res.json(orderItems);
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Lấy sản phẩm trong đơn hàng theo ID
const getOrderItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const orderItem = await orderItemService.getOrderItemById(id);
    if (!orderItem) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm trong đơn hàng" });
    }
    res.json(orderItem);
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Tạo mới một sản phẩm trong đơn hàng
const createOrderItem = async (req, res) => {
  try {
    const newOrderItem = await orderItemService.createOrderItem(req.body);
    res.status(201).json({ message: "Sản phẩm đã được thêm vào đơn hàng", data: newOrderItem });
  } catch (error) {
    res.status(400).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Cập nhật sản phẩm trong đơn hàng
const updateOrderItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedOrderItem = await orderItemService.updateOrderItem(id, req.body);
    if (!updatedOrderItem) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm trong đơn hàng" });
    }
    res.json(updatedOrderItem);
  } catch (error) {
    res.status(400).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Xóa sản phẩm trong đơn hàng
const deleteOrderItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedOrderItem = await orderItemService.deleteOrderItem(id);
    if (!deletedOrderItem) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm trong đơn hàng" });
    }
    res.json({ message: "Sản phẩm đã được xóa khỏi đơn hàng" });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};


// Thống kê sản phẩm bán chạy 
const getTopSellingProducts = async (req, res) => {
  try {
    const topProducts = await orderItemService.getTopSellingProducts();
    res.status(200).json({ message: "Sản phẩm bán chạy", data: topProducts });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

module.exports = {
  getAllOrderItems,
  getOrderItemById,
  createOrderItem,
  updateOrderItem,
  deleteOrderItem,
  getTopSellingProducts,
};