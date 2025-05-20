const Wishlist = require("../models/WishlistModel");

// Lấy danh sách yêu thích của người dùng
const getWishlist = async (userId) => {
  return await Wishlist.find({ userId })
    .populate("productId") // 💥 lấy đủ thông tin sản phẩm
    .sort({ createdAt: -1 });
};

// Thêm sản phẩm vào danh sách yêu thích
const addToWishlist = async (userId, productId) => {
  const existingItem = await Wishlist.findOne({ userId, productId });
  if (existingItem) {
    throw new Error("Sản phẩm đã có trong danh sách yêu thích");
  }

  const wishlistItem = new Wishlist({ userId, productId });
  return await wishlistItem.save();
};

// ✅ Xóa vĩnh viễn sản phẩm khỏi danh sách yêu thích
const deleteWishlistItem = async (id) => {
  return await Wishlist.findByIdAndDelete(id);
};

module.exports = {
  getWishlist,
  addToWishlist,
  deleteWishlistItem
};
