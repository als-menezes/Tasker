import { useState } from 'react';

function TaskForm({ onCreate }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
  });

  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);

    try {
      await onCreate({
        ...form,
        due_date: form.due_date || null,
      });

      setForm({
        title: '',
        description: '',
        priority: 'medium',
        due_date: '',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="task-form">
      <h2>Nova tarefa</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Título"
          value={form.title}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Descrição"
          value={form.description}
          onChange={handleChange}
        />

        <select
          name="priority"
          value={form.priority}
          onChange={handleChange}
        >
          <option value="low">Baixa</option>
          <option value="medium">Média</option>
          <option value="high">Alta</option>
        </select>

        <input
          type="date"
          name="due_date"
          value={form.due_date}
          onChange={handleChange}
        />

        <button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Criando...' : 'Criar tarefa'}
        </button>
      </form>
    </section>
  );
}

export default TaskForm;