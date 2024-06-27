Dưới đây là toàn bộ code cho project Express.js kết nối PostgreSQL, bao gồm CRUD, Login, Logout và Register, sử dụng `bcryptjs` và `jsonwebtoken`.

**Cấu trúc thư mục:**

```
express-postgresql-crud/
├── controllers/
│   └── userController.js
├── models/
│   └── User.js
├── routes/
│   └── users.js
├── db.js
├── index.js
└── .env
```

**1. .env:**

```
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
JWT_SECRET=your_jwt_secret
```

**2. index.js:**

```javascript
const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api/users", require("./routes/users"));

// Database connection
const pool = require("./db");
pool.on("connect", () => {
  console.log("Connected to the database");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
```

**3. db.js:**

```javascript
const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
});

module.exports = pool;
```

**4. models/User.js:**

```javascript
const pool = require("../db");

class User {
  static async findAll() {
    const { rows } = await pool.query("SELECT * FROM users");
    return rows;
  }

  static async findById(id) {
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [
      id,
    ]);
    return rows[0];
  }

  static async findByUsername(username) {
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    return rows[0];
  }

  static async create(username, password, email) {
    const { rows } = await pool.query(
      "INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING *",
      [username, password, email]
    );
    return rows[0];
  }

  static async update(id, username, password, email) {
    const { rows } = await pool.query(
      "UPDATE users SET username = $1, password = $2, email = $3 WHERE id = $4 RETURNING *",
      [username, password, email, id]
    );
    return rows[0];
  }

  static async delete(id) {
    const { rows } = await pool.query("DELETE FROM users WHERE id = $1", [id]);
    return rows[0];
  }
}

module.exports = User;
```

**5. controllers/userController.js:**

```javascript
const User = require("../models/User");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.json(user);
  } catch (error) {
    console.error("Error getting user by ID:", error);
    res.status(500).json({ error: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const newUser = await User.create(username, password, email);
    res.json(newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, email } = req.body;
    const updatedUser = await User.update(id, username, password, email);
    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.delete(id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
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
      return res.status(400).json({ error: "Username is already taken" });
    }

    // Băm mật khẩu
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Tạo user mới
    const newUser = await User.create(username, hashedPassword, email);
    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate dữ liệu (nếu cần)

    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // So sánh mật khẩu
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Tạo JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

    res.json({ token });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ error: error.message });
  }
};

// Ví dụ controller cho route được bảo vệ
const getUserProfile = async (req, res) => {
  try {
    // Lấy thông tin user từ req.user (đã được middleware authenticateToken giải mã từ token)
    const userId = req.user.userId;

    // Lấy thông tin user từ database dựa vào userId
    const user = await User.findById(userId);

    // Trả về thông tin user
    res.json(user);
  } catch (error) {
    console.error("Error getting user profile:", error);
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
  getUserProfile, // Xuất controller cho route được bảo vệ
};
```

**6. routes/users.js:**

```javascript
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const jwt = require("jsonwebtoken");

// Middleware để xác thực JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Các routes không cần xác thực
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);

// Các routes cần xác thực
router.get("/", authenticateToken, userController.getAllUsers);
router.get("/:id", authenticateToken, userController.getUserById);
router.post("/", authenticateToken, userController.createUser);
router.put("/:id", authenticateToken, userController.updateUser);
router.delete("/:id", authenticateToken, userController.deleteUser);
router.get("/profile", authenticateToken, userController.getUserProfile);

module.exports = router;
```
