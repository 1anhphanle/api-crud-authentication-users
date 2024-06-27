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