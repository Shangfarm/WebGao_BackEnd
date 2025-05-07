const jwt = require('jsonwebtoken')
const User = require('../models/UserModel')
const JWT_SECRET = process.env.JWT_SECRET || 'secret123'

/**
 * Middleware xác thực token
 */
exports.verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Không có token, truy cập bị từ chối' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET)

    if (!decoded?.userId) {
      return res.status(403).json({ message: 'Token không hợp lệ hoặc thiếu thông tin' })
    }

    req.user = {
        userId: decoded.userId,
        role: decoded.role
      }
    next()
  } catch (error) {
    return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn' })
  }
}

/**
 * Middleware kiểm tra người dùng có phải là admin không
 */
exports.requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId)
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ admin mới có quyền truy cập' })
    }
    next()
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi xác minh quyền admin' })
  }
}

/**
 * Middleware kiểm tra user là chính mình hoặc là admin
 */
exports.requireSelfOrAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId)
    const isAdmin = user?.role === 'admin'
    const isSelf = req.user.userId === req.params.id

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này' })
    }

    next()
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi xác minh quyền truy cập' })
  }
}
