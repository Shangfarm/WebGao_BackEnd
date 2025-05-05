const cartItemService = require("../services/cartItem.service");
const promotionService = require("../services/promotion.service");
const Product = require("../models/ProductModel"); // Import model Product

// Lấy tất cả sản phẩm trong giỏ hàng của người dùng
const getAllCartItems = async (req, res) => {
  try {
    const { userId } = req.params;
    const cartItems = await cartItemService.getAllCartItems(userId);

    // Áp dụng khuyến mãi cho giỏ hàng
    const updatedCartItems = await promotionService.applyPromotionToCartItems(cartItems);

    res.status(200).json({ message: "Danh sách sản phẩm trong giỏ hàng", data: updatedCartItems });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Lấy một sản phẩm trong giỏ hàng theo ID
const getCartItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const cartItem = await cartItemService.getCartItemById(id);
    if (!cartItem) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm trong giỏ hàng" });
    }
    res.json(cartItem);
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Thêm sản phẩm vào giỏ hàng
const addCartItem = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    // Kiểm tra sản phẩm đã tồn tại trong giỏ hàng chưa
    const existingCartItem = await cartItemService.getCartItemByUserAndProduct(userId, productId);

    if (existingCartItem) {
      // Cập nhật số lượng và tổng giá
      existingCartItem.quantity += quantity;
      existingCartItem.totalPrice = existingCartItem.productId.price * existingCartItem.quantity;
      await existingCartItem.save();
    } else {
      // Thêm sản phẩm mới vào giỏ hàng
      const product = await Product.findById(productId); // Truy vấn thông tin sản phẩm
      if (!product) {
        return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
      }

      const newCartItem = await cartItemService.addCartItem({
        userId,
        productId,
        quantity,
        totalPrice: product.price * quantity,
      });
      res.status(201).json({ message: "Sản phẩm đã được thêm vào giỏ hàng", data: newCartItem });
      return;
    }

    // Lấy danh sách giỏ hàng sau khi cập nhật
    const cartItems = await cartItemService.getAllCartItems(userId);

    // Áp dụng khuyến mãi
    const updatedCartItems = await promotionService.applyPromotionToCartItems(cartItems);

    res.status(200).json({ message: "Danh sách sản phẩm trong giỏ hàng", data: updatedCartItems });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Cập nhật số lượng sản phẩm trong giỏ hàng
const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCartItem = await cartItemService.updateCartItem(id, req.body);
    if (!updatedCartItem) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm trong giỏ hàng" });
    }
    res.json(updatedCartItem);
  } catch (error) {
    res.status(400).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Xóa sản phẩm khỏi giỏ hàng
const deleteCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCartItem = await cartItemService.deleteCartItem(id);
    if (!deletedCartItem) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm trong giỏ hàng" });
    }
    res.json({ message: "Sản phẩm đã được xóa khỏi giỏ hàng" });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Tính tổng giá trị giỏ hàng
const calculateCartTotal = async (req, res) => {
  try {
    const { userId } = req.params;
    const cartItems = await cartItemService.getAllCartItems(userId);

    // Áp dụng khuyến mãi
    const updatedCartItems = await promotionService.applyPromotionToCartItems(cartItems);

    // Tính tổng giá trị giỏ hàng
    const total = updatedCartItems.reduce((sum, item) => sum + item.totalPrice, 0);

    res.json({ total });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

module.exports = {
  getAllCartItems,
  getCartItemById,
  addCartItem,
  updateCartItem,
  deleteCartItem,
  calculateCartTotal,
};