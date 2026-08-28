const express = require('express');
const cors = require('cors');
const authMiddleware = require('./middlewares/authMiddleware');
require('dotenv').config();

const db = require('./database');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Tasker API',
  });
});

app.get('/api/profile', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, name, email, created_at
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

app.get('/api/health', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');

    res.json({
      status: 'ok',
      database: 'connected',
      timestamp: result.rows[0].now,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: 'error',
      database: 'disconnected',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Tasker API running on port ${PORT}`);
});