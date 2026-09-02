import { useEffect, useState } from 'react';

import {
  getTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from '../services/api';

import Navbar from '../components/Navbar';
import TaskStats from '../components/TaskStats';
import TaskForm from '../components/TaskForm';
import TaskFilters from '../components/TaskFilters';
import TaskCard from '../components/TaskCard';

function Dashboard() {
  const token = localStorage.getItem('token');

  const storedUser =
    localStorage.getItem('user');

  const user = storedUser
    ? JSON.parse(storedUser)
    : null;

  const [tasks, setTasks] = useState([]);

  const [editingTask, setEditingTask] =
    useState(null);

  const [search, setSearch] = useState('');

  const [statusFilter, setStatusFilter] =
    useState('all');

  const [priorityFilter, setPriorityFilter] =
    useState('all');

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  useEffect(() => {
    loadTasks();
  }, []);

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

  async function handleCreateTask(taskData) {
    try {
      const task = await createTask(
        token,
        taskData
      );

      setTasks((currentTasks) => [
        task,
        ...currentTasks,
      ]);
    } catch (error) {
      setError(error.message);
    }
  }

  function handleEditTask(task) {
    setEditingTask({
      ...task,
    });
  }

  async function handleUpdateTask(event) {
    event.preventDefault();

    try {
      const updatedTask =
        await updateTask(
          token,
          editingTask.id,
          {
            title: editingTask.title,
            description:
              editingTask.description,
            priority:
              editingTask.priority,
            due_date:
              editingTask.due_date || null,
          }
        );

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
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

      const updatedTask =
        await updateTaskStatus(
          token,
          task.id,
          status
        );

      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
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

      setTasks((currentTasks) =>
        currentTasks.filter(
          (task) => task.id !== id
        )
      );
    } catch (error) {
      setError(error.message);
    }
  }

  function handleEditChange(event) {
    setEditingTask({
      ...editingTask,
      [event.target.name]:
        event.target.value,
    });
  }

  const filteredTasks = tasks.filter(
    (task) => {
      const matchesSearch =
        task.title
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        (task.description || '')
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const matchesStatus =
        statusFilter === 'all' ||
        task.status === statusFilter;

      const matchesPriority =
        priorityFilter === 'all' ||
        task.priority ===
          priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    }
  );

  if (loading) {
    return (
      <main className="loading">
        <p>Carregando tarefas...</p>
      </main>
    );
  }

  return (
    <>
      <Navbar user={user} />

      <main className="dashboard">
        {error && (
          <p className="error">
            {error}
          </p>
        )}

        <TaskStats tasks={tasks} />

        {editingTask && (
          <section className="task-form">
            <h2>Editar tarefa</h2>

            <form
              onSubmit={handleUpdateTask}
            >
              <input
                type="text"
                name="title"
                placeholder="Título"
                value={
                  editingTask.title
                }
                onChange={
                  handleEditChange
                }
                required
              />

              <textarea
                name="description"
                placeholder="Descrição"
                value={
                  editingTask.description ||
                  ''
                }
                onChange={
                  handleEditChange
                }
              />

              <select
                name="priority"
                value={
                  editingTask.priority
                }
                onChange={
                  handleEditChange
                }
              >
                <option value="low">
                  Baixa
                </option>

                <option value="medium">
                  Média
                </option>

                <option value="high">
                  Alta
                </option>
              </select>

              <input
                type="date"
                name="due_date"
                value={
                  editingTask.due_date ||
                  ''
                }
                onChange={
                  handleEditChange
                }
              />

              <div className="task-actions">
                <button type="submit">
                  Salvar alterações
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setEditingTask(null)
                  }
                >
                  Cancelar
                </button>
              </div>
            </form>
          </section>
        )}

        <TaskForm
          onCreate={handleCreateTask}
        />

        <section>
          <h2>Minhas tarefas</h2>

          <TaskFilters
            search={search}
            setSearch={setSearch}
            statusFilter={
              statusFilter
            }
            setStatusFilter={
              setStatusFilter
            }
            priorityFilter={
              priorityFilter
            }
            setPriorityFilter={
              setPriorityFilter
            }
          />

          {filteredTasks.length ===
          0 ? (
            tasks.length === 0 ? (
              <p>
                Você ainda não possui
                tarefas.
              </p>
            ) : (
              <p>
                Nenhuma tarefa corresponde
                aos filtros.
              </p>
            )
          ) : (
            <div className="task-list">
              {filteredTasks.map(
                (task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={
                      handleEditTask
                    }
                    onComplete={
                      handleCompleteTask
                    }
                    onDelete={
                      handleDeleteTask
                    }
                  />
                )
              )}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

export default Dashboard;