Project Express.js kết nối PostgreSQL, thực hiện CRUD cơ bản. 

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

**Code:**

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
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/users', require('./routes/users'));

// Database connection
const pool = require('./db');
pool.on('connect', () => {
  console.log('Connected to the database');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

```

**3. db.js:**

```javascript
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432, // Port mặc định của PostgreSQL
});

module.exports = pool;

```

**4. models/User.js:**

```javascript
const pool = require('../db');

class User {
  static async findAll() {
    const { rows } = await pool.query('SELECT * FROM users');
    return rows;
  }

  static async findById(id) {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0];
  }

  static async create(username, password, email) {
    const { rows } = await pool.query(
      'INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING *',
      [username, password, email]
    );
    return rows[0];
  }

  // ... Các phương thức update, delete, etc.
}

module.exports = User;
```

**5. controllers/userController.js:**

```javascript
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

```


**6. routes/users.js:**

```javascript
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Routes cho users
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
// ... Các routes update, delete, etc.

module.exports = router;
```

**Lưu ý:**

- Thay thế thông tin trong file `.env` bằng thông tin database của bạn. 
- Chạy lệnh  `node index.js` để khởi động server. 
- Hãy kiểm tra lại kết nối database và log trên terminal để debug nếu gặp lỗi. 