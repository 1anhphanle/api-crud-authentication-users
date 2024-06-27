const pool = require('./db');

const createTable = async () => {
    try {
        await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL
      )
    `);
        console.log('Table "users" created successfully!');
    } catch (error) {
        console.error('Error creating table:', error);
    }
};

const insertData = async () => {
    try {
        await pool.query(`
      INSERT INTO users (username, password, email) 
      SELECT 'user1', 'password123', 'user1@example.com'
      WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'user1');

      INSERT INTO users (username, password, email) 
      SELECT 'user2', 'securepassword', 'user2@example.com'
      WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'user2');
    `);
        console.log('Data inserted successfully!');
    } catch (error) {
        console.error('Error inserting data:', error);
    }
};

const initializeDatabase = async () => {
    await createTable();
    await insertData();
    await pool.end(); // Đóng kết nối sau khi hoàn thành
};

initializeDatabase();