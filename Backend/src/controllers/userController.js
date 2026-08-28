const bcrypt = require('bcrypt');
const db = require('../database');

async function createUser(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Name, email and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must have at least 6 characters',
      });
    }

    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: 'Email already registered',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name, email, passwordHash]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Internal server error',
    });
  }
}

module.exports = {
  createUser,
};