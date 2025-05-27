const OrderItem = require("../models/OrderItemModel");
const Product = require("../models/ProductModel");

// Lấy tất cả sản phẩm trong đơn hàng
const getAllOrderItems = async (orderId) => {
  return await OrderItem.find({ orderId }).populate("productId", "name price");
};

// Lấy sản phẩm trong đơn hàng theo ID
const getOrderItemById = async (id) => {
  return await OrderItem.findById(id).populate("productId", "name price");
};

// Tạo mới một sản phẩm trong đơn hàng
const createOrderItem = async (data) => {
  const newOrderItem = new OrderItem(data);
  return await newOrderItem.save();
};

// Cập nhật sản phẩm trong đơn hàng
const updateOrderItem = async (id, data) => {
  return await OrderItem.findByIdAndUpdate(id, data, { new: true });
};

// Xóa sản phẩm trong đơn hàng
const deleteOrderItem = async (id) => {
  return await OrderItem.findByIdAndDelete(id);
};


// Thống kê sản phẩm bán chạy
const getTopSellingProducts = async () => {
  const topProducts = await OrderItem.aggregate([
    {
      $lookup: {
        from: "orders",
        localField: "orderId",
        foreignField: "_id",
        as: "order"
      }
    },
    { $unwind: "$order" },
    {
      $group: {
        _id: "$productId",
        totalQuantity: { $sum: "$quantity" }
      }
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product"
      }
    },
    { $unwind: "$product" },
    {
      $project: {
        _id: 0,
        productId: "$_id",
        productName: "$product.name",
        totalQuantity: 1,
        price: "$product.price"
      }
    }
  ]);

  const totalSales = topProducts.reduce((sum, p) => sum + p.totalQuantity, 0);

  return {
    totalSales,
    data: topProducts
  };
};

// Cập nhật số lượng sản phẩm bán ra khi đơn hàng bị hủy
const revertSoldQuantityOnCancel = async (orderId) => {
  try {
    const orderItems = await OrderItem.find({ orderId });  // Lấy tất cả sản phẩm trong đơn hàng
    console.log("Order Items to revert:", orderItems); // In ra các sản phẩm để kiểm tra

    // Giảm số lượng sản phẩm trong thống kê bán chạy
    for (const item of orderItems) {
      console.log(`Reverting ${item.productId} by ${item.quantity} quantity`); // Kiểm tra từng sản phẩm
      await Product.updateOne(
        { _id: item.productId },
        { $inc: { totalQuantity: -item.quantity } } // Giảm số lượng đã bán
      );
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật sản phẩm bán chạy:", error);
  }
};

// Cập nhật trạng thái đơn hàng
const updateOrderStatus = async (orderId, status) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("Không tìm thấy đơn hàng");
    }

    // Nếu trạng thái đơn hàng chưa phải là 'CANCELLED' và status mới là 'CANCELLED', cần cập nhật lại số lượng bán chạy
    if (order.status !== "CANCELLED" && status === "CANCELLED") {
      // Gọi hàm để cập nhật sản phẩm bán chạy khi đơn hàng bị hủy
      await revertSoldQuantityOnCancel(orderId);
    }

    // Cập nhật trạng thái đơn hàng
    order.status = status;
    await order.save();
    console.log("Trạng thái đơn hàng đã được cập nhật thành công.");
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
    throw new Error("Lỗi khi cập nhật trạng thái đơn hàng");
  }
};

module.exports = {
  getAllOrderItems,
  getOrderItemById,
  createOrderItem,
  updateOrderItem,
  deleteOrderItem,
  getTopSellingProducts,
  revertSoldQuantityOnCancel,
  updateOrderStatus,
};