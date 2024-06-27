# Hướng dẫn triển khai chức năng Login/Logout/Register:

Dưới đây là hướng dẫn chi tiết cách triển khai chức năng Login/Logout/Register cho project Express.js kết nối PostgreSQL, sử dụng `bcryptjs` để băm mật khẩu và `jsonwebtoken` để tạo và xác thực JWT token.

## 1. Cài đặt `bcryptjs` và `jsonwebtoken`:

Nếu chưa cài đặt, hãy cài đặt `bcryptjs` và `jsonwebtoken` bằng npm hoặc yarn:

```bash
npm install bcryptjs jsonwebtoken
```

## 2. Cập nhật `models/User.js`:

- Thêm phương thức `findByUsername` để tìm user theo username (hoặc email, tùy bạn thiết kế):

```javascript
// ... (Các phương thức khác)

static async findByUsername(username) {
  const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  return rows[0];
}

// ... (Các phương thức khác)
```

## 3. Cập nhật `controllers/userController.js`:

```javascript
const User = require('../models/User');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ... (Các controller khác)

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

// ... (Các controller khác)

module.exports = {
  // ...
  registerUser,
  loginUser,
  // ...
};
```

## 4. Tạo routes cho Login/Logout/Register:

**`routes/users.js`:**

```javascript
// ... (Các routes khác)

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// ... (Các routes khác)
```

### 5. Bảo vệ route bằng middleware (ví dụ):

```javascript
const express = require('express');
const jwt = require('jsonwebtoken');

// ...

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// ...

// Áp dụng middleware cho các route cần xác thực
router.get('/profile', authenticateToken, userController.getUserProfile); // Ví dụ route lấy thông tin user
```

## 6. Triển khai chức năng Logout:

- Logout chủ yếu là xử lý phía client, bạn có thể xóa token khỏi local storage hoặc cookie.

## Lưu ý:

- Hãy thay thế `process.env.JWT_SECRET` bằng một chuỗi bí mật của bạn trong file `.env`.

## 7. Thêm middleware vào `routes/users.js`

Bạn sẽ thêm đoạn code middleware `authenticateToken` trực tiếp vào file `routes/users.js`. Mục đích của việc này là kiểm tra JWT token **trước** khi cho phép truy cập vào các route yêu cầu xác thực. 

```javascript
// routes/users.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const jwt = require('jsonwebtoken');

// Middleware để xác thực JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401); // Unauthorized

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden
    req.user = user; // Lưu thông tin user vào req.user (nếu cần)
    next(); // Tiếp tục đến controller nếu token hợp lệ
  });
};

// Các routes không cần xác thực
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// Route cần xác thực (ví dụ: lấy thông tin user)
router.get('/profile', authenticateToken, userController.getUserProfile); 

// ... Các routes khác

module.exports = router;
```

## 8. Tạo controller `getUserProfile` (ví dụ)

Bạn cần tạo controller `getUserProfile` trong file `controllers/userController.js` để xử lý logic khi user đã đăng nhập truy cập vào route `/profile`.

```javascript
// controllers/userController.js

// ... Các controller khác

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

// ... Các controller khác

module.exports = {
  // ...
  getUserProfile,
  // ...
};
```

Dưới đây là hướng dẫn chi tiết cách test chức năng Login, Logout và Register bằng Postman, bao gồm cả việc test route được bảo vệ bằng JWT token:

**Chuẩn bị:**

- Đảm bảo server của bạn đang chạy (`node index.js`).
- Postman đã được cài đặt.

# Test postman

## 1. Test chức năng Register (`POST /api/register`):

1. **Mở Postman** và tạo request mới.
2. **Chọn method `POST`**.
3. **Nhập URL:** `http://localhost:3000/api/users/register`.
4. Chọn tab **Body**, chọn **raw** và **JSON**.
5. **Nhập dữ liệu user mới** theo định dạng JSON:
   ```json
   {
     "username": "testuser",
     "password": "testpassword",
     "email": "testuser@example.com"
   }
   ```
6. Click **Send**.
7. **Kiểm tra kết quả:**
   - **Status code 201 Created:** Đăng ký thành công.
   - **Kiểm tra database:** Xem user mới đã được tạo hay chưa.

## 2. Test chức năng Login (`POST /api/login`):

1. **Tạo request mới** trong Postman.
2. **Chọn method `POST`**.
3. **Nhập URL:** `http://localhost:3000/api/users/login`.
4. Chọn tab **Body**, chọn **raw** và **JSON**.
5. **Nhập username và password** của user vừa tạo:
   ```json
   {
     "username": "testuser",
     "password": "testpassword"
   }
   ```
6. Click **Send**.
7. **Kiểm tra kết quả:**
   - **Status code 200 OK:** Đăng nhập thành công.
   - **Response sẽ chứa JWT token**, ví dụ:
     ```json
     {
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." 
     }
     ```
   - **Copy token này** để sử dụng cho các request tiếp theo yêu cầu xác thực.

## 3. Test route được bảo vệ (ví dụ: `GET /api/profile`):

1. **Tạo request mới** trong Postman.
2. **Chọn method `GET`**.
3. **Nhập URL:** `http://localhost:3000/api/users/profile`.
4. Chọn tab **Headers**.
5. **Thêm header `Authorization`**.
6. **Giá trị của header:** `Bearer {token}`, thay `{token}` bằng token đã copy ở bước 2.7.
7. Click **Send**.
8. **Kiểm tra kết quả:**
   - **Status code 200 OK:** Token hợp lệ, bạn sẽ nhận được thông tin user.
   - **Status code 401 Unauthorized hoặc 403 Forbidden:** Token không hợp lệ hoặc không có header `Authorization`.

## 4. Test chức năng Logout:

- Logout thường là xử lý phía client (ví dụ: xóa token khỏi local storage).
- Bạn không cần test API logout bằng Postman, nhưng có thể kiểm tra xem client có xóa token sau khi logout hay không.

**Lưu ý:**

- Thay thế `http://localhost:3000` bằng địa chỉ server của bạn (nếu khác).
- Đảm bảo bạn đã tạo controller và route cho `/api/profile` (hoặc route khác cần bảo vệ).

Bằng cách thực hiện các bước trên, bạn đã test xong các chức năng Login, Logout, Register và kiểm tra route được bảo vệ bằng JWT token.