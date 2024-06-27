const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const jwt = require('jsonwebtoken');

// Middleware xác thực JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401); // Unauthorized

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden
        req.user = user; // Lưu thông tin user vào req.user để sử dụng sau
        next(); // Cho phép request tiếp tục
    });
};

// Các routes công khai (không cần xác thực)
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// Routes cần xác thực
router.get('/profile', authenticateToken, userController.getUserProfile); // Ví dụ route lấy thông tin user

router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

// ... Các routes khác
router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);

module.exports = router;