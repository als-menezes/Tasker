const db = require('../database');

async function createTask(req, res) {
  try {
    const {
      title,
      description,
      priority,
      due_date,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        error: 'Title is required',
      });
    }

    const validPriorities = ['low', 'medium', 'high'];

    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({
        error: 'Invalid priority',
      });
    }

    const result = await db.query(
      `INSERT INTO tasks
        (title, description, priority, due_date, user_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        title,
        description || null,
        priority || 'medium',
        due_date || null,
        req.user.id,
      ]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Internal server error',
    });
  }
}

async function getTasks(req, res) {
  try {
    const result = await db.query(
      `SELECT *
       FROM tasks
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Internal server error',
    });
  }
}

async function getTaskById(req, res) {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT *
       FROM tasks
       WHERE id = $1
       AND user_id = $2`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Task not found',
      });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Internal server error',
    });
  }
}

async function updateTask(req, res) {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      priority,
      status,
      due_date,
    } = req.body;

    const validPriorities = ['low', 'medium', 'high'];
    const validStatuses = ['pending', 'completed'];

    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({
        error: 'Invalid priority',
      });
    }

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
      });
    }

    const result = await db.query(
      `UPDATE tasks
       SET
         title = COALESCE($1, title),
         description = COALESCE($2, description),
         priority = COALESCE($3, priority),
         status = COALESCE($4, status),
         due_date = COALESCE($5, due_date),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       AND user_id = $7
       RETURNING *`,
      [
        title,
        description,
        priority,
        status,
        due_date,
        id,
        req.user.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Task not found',
      });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Internal server error',
    });
  }
}

async function deleteTask(req, res) {
  try {
    const { id } = req.params;

    const result = await db.query(
      `DELETE FROM tasks
       WHERE id = $1
       AND user_id = $2
       RETURNING id`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Task not found',
      });
    }

    return res.status(204).send();
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Internal server error',
    });
  }
}

async function updateTaskStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'completed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
      });
    }

    const result = await db.query(
      `UPDATE tasks
       SET
         status = $1,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       AND user_id = $3
       RETURNING *`,
      [status, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Task not found',
      });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Internal server error',
    });
  }
}

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
};