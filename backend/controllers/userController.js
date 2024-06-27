const User = require('../models/User');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Controller cho users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        console.error('Error getting users:', error); // In ra lỗi để debug
        res.status(500).json({ error: error.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        res.json(user);
    } catch (error) {
        console.error('Error getting user by ID:', error); // In ra lỗi để debug
        res.status(500).json({ error: error.message });
    }
};

const createUser = async (req, res) => {
    try {
        const { username, password, email } = req.body;
        const newUser = await User.create(username, password, email);
        res.json(newUser);
    } catch (error) {
        console.error('Error creating user:', error); // In ra lỗi để debug
        res.status(500).json({ error: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, password, email } = req.body;

        // Validate dữ liệu (nếu cần)

        const updatedUser = await User.update(id, username, password, email);
        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.delete(id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: error.message });
    }
};

const registerUser = async (req, res) => {
    try {
        const { username, password, email } = req.body;

        // Validate dữ liệu (nếu cần)

        // Kiểm tra username hoặc email đã tồn tại chưa
        const existingUser = await User.findByUsername(username);
        if (existingUser) {
            return res.status(400).json({ error: 'Username is already taken' });
        }

        // Băm mật khẩu
        const hashedPassword = await bcryptjs.hash(password, 10);

        // Tạo user mới
        const newUser = await User.create(username, hashedPassword, email);
        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate dữ liệu (nếu cần)

        const user = await User.findByUsername(username);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // So sánh mật khẩu
        const isMatch = await bcryptjs.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Tạo JWT token
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

        res.json({ token });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ error: error.message });
    }
};

const getUserProfile = async (req, res) => {
    try {
        // Lấy thông tin user từ req.user (đã được middleware authenticateToken giải mã từ token)
        const userId = req.user.userId;

        // Lấy thông tin user từ database dựa vào userId
        const user = await User.findById(userId);

        // Trả về thông tin user
        res.json(user);
    } catch (error) {
        console.error('Error getting user profile:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    registerUser,
    loginUser,
    getUserProfile,
};