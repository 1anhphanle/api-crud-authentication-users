const User = require('../models/User');

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

// ... Các controller khác cho update, delete, etc.

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    // ...
};