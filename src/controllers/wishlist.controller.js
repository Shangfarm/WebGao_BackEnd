const wishlistService = require("../services/wishlist.service");

// Lấy danh sách yêu thích của người dùng
const getWishlist = async (req, res) => {
  try {
    const { userId } = req.params;
    const wishlist = await wishlistService.getWishlist(userId);
    res.status(200).json({ message: "Danh sách yêu thích", data: wishlist });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Thêm sản phẩm vào danh sách yêu thích
const addToWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ message: "Thiếu userId hoặc productId" });
    }

    const wishlistItem = await wishlistService.addToWishlist(userId, productId);
    res.status(201).json({ message: "Đã thêm vào danh sách yêu thích", data: wishlistItem });
  } catch (error) {
    res.status(400).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// ✅ Xóa vĩnh viễn sản phẩm khỏi danh sách yêu thích
const deleteWishlistItem = async (req, res) => {
  try {
    const { id } = req.params;
    await wishlistService.deleteWishlistItem(id);
    res.status(200).json({ message: "Đã xóa sản phẩm khỏi danh sách yêu thích" });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  deleteWishlistItem
};
