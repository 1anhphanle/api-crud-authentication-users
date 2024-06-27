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

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
};