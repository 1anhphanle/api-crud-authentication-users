# 1. Hoàn thiện API CRUD:

## 1.1. Cập nhật user (PUT /api/users/:id):

**a. `models/User.js`:**

```javascript
// ... (Các phương thức khác)

static async update(id, username, password, email) {
  const { rows } = await pool.query(
    'UPDATE users SET username = $1, password = $2, email = $3 WHERE id = $4 RETURNING *',
    [username, password, email, id]
  );
  return rows[0];
}

// ... (Các phương thức khác)
```

**b. `controllers/userController.js`:**

```javascript
// ... (Các controller khác)

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

// ... (Các controller khác)

module.exports = {
  // ...
  updateUser,
  // ...
};
```

**c. `routes/users.js`:**

```javascript
// ... (Các routes khác)

router.put('/:id', userController.updateUser);

// ... (Các routes khác)
```

## 1.2. Xóa user (DELETE /api/users/:id):

**a. `models/User.js`:**

```javascript
// ... (Các phương thức khác)

static async delete(id) {
  const { rows } = await pool.query('DELETE FROM users WHERE id = $1', [id]);
  return rows[0];
}

// ... (Các phương thức khác)
```

**b. `controllers/userController.js`:**

```javascript
// ... (Các controller khác)

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

// ... (Các controller khác)

module.exports = {
  // ...
  deleteUser,
  // ...
};
```

**c. `routes/users.js`:**

```javascript
// ... (Các routes khác)

router.delete('/:id', userController.deleteUser);

// ... (Các routes khác)
```