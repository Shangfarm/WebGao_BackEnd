const promotionService = require("../services/promotion.service");

// Lấy danh sách tất cả chương trình khuyến mãi
const getAllPromotions = async (req, res) => {
  try {
    const promotions = await promotionService.getAllPromotions();
    res.status(200).json({ message: "Danh sách chương trình khuyến mãi", data: promotions });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Lấy danh sách khuyến mãi đang áp dụng
const getActivePromotions = async (req, res) => {
  try {
    const promotions = await promotionService.getActivePromotions();
    res.status(200).json({ message: "Danh sách khuyến mãi đang áp dụng", data: promotions });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Tạo chương trình khuyến mãi mới
const createPromotion = async (req, res) => {
  try {
    const promotion = await promotionService.createPromotion(req.body);
    res.status(201).json({ message: "Chương trình khuyến mãi đã được tạo", data: promotion });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Cập nhật chương trình khuyến mãi
const updatePromotion = async (req, res) => {
  try {
    const promotion = await promotionService.updatePromotion(req.params.id, req.body);
    if (!promotion) {
      return res.status(404).json({ message: "Không tìm thấy chương trình khuyến mãi" });
    }
    res.status(200).json({ message: "Chương trình khuyến mãi đã được cập nhật", data: promotion });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Xóa chương trình khuyến mãi
const deletePromotion = async (req, res) => {
  try {
    const promotion = await promotionService.deletePromotion(req.params.id);
    if (!promotion) {
      return res.status(404).json({ message: "Không tìm thấy chương trình khuyến mãi" });
    }
    res.status(200).json({ message: "Chương trình khuyến mãi đã được xóa" });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Xóa mềm danh mục
const softDeletePromotion = async (req, res) => {
  try {
    const promotion = await promotionService.softDeletePromotion(req.params.id);
    if (!promotion) {
      return res.status(404).json({ message: "Không tìm thấy chương trình khuyến mãi" });
    }
    res.status(200).json({ message: "Chương trình khuyến mãi đã được xóa mềm" }); 
  }
  catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
}

// Khôi phục chương trình khuyến mãi đã xóa
const restorePromotion = async (req, res) => {
  try {
    const promotion = await promotionService.restorePromotion(req.params.id);
    if (!promotion) {
      return res.status(404).json({ message: "Không tìm thấy chương trình khuyến mãi" });
    }
    res.status(200).json({ message: "Chương trình khuyến mãi đã được khôi phục", data: promotion });
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
  }
};

// Lấy danh sách chương trình khuyến mãi với phân trang, tìm kiếm và lọc
const getPromotion = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", deleted } = req.query;
    const skip = (page - 1) * limit;
    const filter = { deletedAt: null }; // Chỉ lấy chương trình khuyến mãi chưa bị xóa mềm


   // ✅ Thêm lọc theo deleted
    if (deleted === "true") {
      filter.deletedAt = { $ne: null };
    } else if (deleted === "false") {
      filter.deletedAt = null;
    } else {
      // Mặc định là chưa xóa
      filter.deletedAt = null;
    }

    // Tìm kiếm theo tên chương trình khuyến mãi
    if (search) {
      filter.name = { $regex: search, $options: "i" }; // Không phân biệt hoa thường
    }
    // Lọc theo trạng thái
    if (req.query.status) {
      filter.status = req.query.status === "true";
    }
    // Lọc theo khoảng thời gian  
    if (req.query.startDate && req.query.endDate) {
      filter.startDate = { $gte: new Date(req.query.startDate) };
      filter.endDate = { $lte: new Date(req.query.endDate) };
    }    
  
    const { promotions, total } = await promotionService.getPromotionsWithPagination(
      filter, 
      skip, 
      parseInt(limit)
    );
    res.status(200).json({
      message: "Danh sách chương trình khuyến mãi",
      data: promotions,
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
}

module.exports = {
  getAllPromotions,
  getActivePromotions,
  createPromotion,
  updatePromotion,
  softDeletePromotion,
  restorePromotion,
  deletePromotion,
  getPromotion,
};