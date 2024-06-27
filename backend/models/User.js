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

    static async update(id, username, password, email) {
        const { rows } = await pool.query(
            'UPDATE users SET username = $1, password = $2, email = $3 WHERE id = $4 RETURNING *',
            [username, password, email, id]
        );
        return rows[0];
    }

    static async delete(id) {
        const { rows } = await pool.query('DELETE FROM users WHERE id = $1', [id]);
        return rows[0];
    }

    static async findByUsername(username) {
        const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        return rows[0];
    }
}

module.exports = User;