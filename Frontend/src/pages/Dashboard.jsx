import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  getTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from '../services/api';

function Dashboard() {
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');

  const user = storedUser ? JSON.parse(storedUser) : null;

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  

  const [newTask, setNewTask] = useState({
  title: '',
  description: '',
  priority: 'medium',
  due_date: '',
  });

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    loadTasks();
  }, [token, navigate]);

  async function loadTasks() {
    try {
      const data = await getTasks(token);

      setTasks(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    setNewTask({
      ...newTask,
      [event.target.name]: event.target.value,
    });
  }

  function handleEditTask(task) {
  setEditingTask({
    ...task,
  });
  }

  function handleEditChange(event) {
  setEditingTask({
    ...editingTask,
    [event.target.name]: event.target.value,
  });
  }

  async function handleCreateTask(event) {
    event.preventDefault();

    try {
      const task = await createTask(token, newTask);

      setTasks([task, ...tasks]);

      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        due_date: '',
      });
    } catch (error) {
      setError(error.message);
    }
  }

  async function handleUpdateTask(event) {
  event.preventDefault();

  try {
    const updatedTask = await updateTask(
      token,
      editingTask.id,
      {
        title: editingTask.title,
        description: editingTask.description,
        priority: editingTask.priority,
        due_date: editingTask.due_date || null,
      }
    );

    setTasks(
      tasks.map((task) =>
        task.id === updatedTask.id
          ? updatedTask
          : task
      )
    );

    setEditingTask(null);
  } catch (error) {
    setError(error.message);
  }
  }

  async function handleCompleteTask(task) {
    try {
      const status =
        task.status === 'completed'
          ? 'pending'
          : 'completed';

      const updatedTask = await updateTaskStatus(
        token,
        task.id,
        status
      );

      setTasks(
        tasks.map((currentTask) =>
          currentTask.id === task.id
            ? updatedTask
            : currentTask
        )
      );
    } catch (error) {
      setError(error.message);
    }
  }

  async function handleDeleteTask(id) {
    try {
      await deleteTask(token, id);

      setTasks(
        tasks.filter((task) => task.id !== id)
      );
    } catch (error) {
      setError(error.message);
    }
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    navigate('/login');
  }

  if (loading) {
    return <p>Carregando tarefas...</p>;
  }

  const filteredTasks = tasks.filter((task) => {
  const matchesSearch =
    task.title
      .toLowerCase()
      .includes(search.toLowerCase()) ||
    (task.description || '')
      .toLowerCase()
      .includes(search.toLowerCase());

  const matchesStatus =
    statusFilter === 'all' ||
    task.status === statusFilter;

  const matchesPriority =
    priorityFilter === 'all' ||
    task.priority === priorityFilter;

  return (
    matchesSearch &&
    matchesStatus &&
    matchesPriority
  );
  });

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Tasker</h1>
          <p>Olá, {user?.name}!</p>
        </div>

        <button onClick={handleLogout}>
          Sair
        </button>
      </header>

      {error && <p className="error">{error}</p>}

      {editingTask && (
  <section className="task-form">
    <h2>Editar tarefa</h2>

    <form onSubmit={handleUpdateTask}>
      <input
        type="text"
        name="title"
        placeholder="Título"
        value={editingTask.title}
        onChange={handleEditChange}
        required
      />

      <textarea
        name="description"
        placeholder="Descrição"
        value={editingTask.description || ''}
        onChange={handleEditChange}
      />

      <select
        name="priority"
        value={editingTask.priority}
        onChange={handleEditChange}
      >
        <option value="low">Baixa</option>
        <option value="medium">Média</option>
        <option value="high">Alta</option>
      </select>

      <input
        type="date"
        name="due_date"
        value={editingTask.due_date || ''}
        onChange={handleEditChange}
      />

      <div className="task-actions">
        <button type="submit">
          Salvar alterações
        </button>

        <button
          type="button"
          onClick={() => setEditingTask(null)}
        >
          Cancelar
        </button>
      </div>
    </form>
  </section>
)}

      <section className="task-form">
        <h2>Nova tarefa</h2>

        <form onSubmit={handleCreateTask}>
          <input
            type="text"
            name="title"
            placeholder="Título"
            value={newTask.title}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="Descrição"
            value={newTask.description}
            onChange={handleChange}
          />

          <select
            name="priority"
            value={newTask.priority}
            onChange={handleChange}
          >
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
          </select>

          <input
            type="date"
            name="due_date"
            value={newTask.due_date}
            onChange={handleChange}
          />

          <button type="submit">
            Criar tarefa
          </button>
        </form>
      </section>

      <section>
        <h2>Minhas tarefas</h2>
        <div className="filters">
  <input
    type="text"
    placeholder="Buscar tarefa..."
    value={search}
    onChange={(event) =>
      setSearch(event.target.value)
    }
  />

  <select
    value={statusFilter}
    onChange={(event) =>
      setStatusFilter(event.target.value)
    }
  >
    <option value="all">Todos os status</option>
    <option value="pending">Pendentes</option>
    <option value="completed">Concluídas</option>
  </select>

  <select
    value={priorityFilter}
    onChange={(event) =>
      setPriorityFilter(event.target.value)
    }
  >
    <option value="all">Todas as prioridades</option>
    <option value="low">Baixa</option>
    <option value="medium">Média</option>
    <option value="high">Alta</option>
  </select>
</div>
        {filteredTasks.length === 0 ? (
          <p>Você ainda não possui tarefas.</p>
        ) : (
          <div className="task-list">
            {filteredTasks.map((task) => (
              <article
                key={task.id}
                className={`task-card ${
                  task.status === 'completed'
                    ? 'completed'
                    : ''
                }`}
              >
                <div>
                  <h3>{task.title}</h3>

                  <p>{task.description}</p>

                  <small>
                    Prioridade: {task.priority}
                  </small>

                  {task.due_date && (
                    <small>
                      Prazo: {task.due_date}
                    </small>
                  )}
                </div>

                <div className="task-actions">
                  <button
  onClick={() => handleEditTask(task)}
>
  Editar
</button> 
                  <button
                    onClick={() =>
                      handleCompleteTask(task)
                    }
                  >
                    {task.status === 'completed'
                      ? 'Reabrir'
                      : 'Concluir'}
                  </button>

                  <button
                    onClick={() =>
                      handleDeleteTask(task.id)
                    }
                  >
                    Excluir
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Dashboard;