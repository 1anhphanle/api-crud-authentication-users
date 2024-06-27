const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Routes cho users
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
// ... Các routes update, delete, etc.

module.exports = router;