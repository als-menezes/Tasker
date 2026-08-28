const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./database');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Tasker API',
  });
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