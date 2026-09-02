function TaskCard({
  task,
  onEdit,
  onComplete,
  onDelete,
}) {
  return (
    <article
      className={`task-card ${
        task.status === 'completed'
          ? 'completed'
          : ''
      }`}
    >
      <div>
        <h3>{task.title}</h3>

        <p>
          {task.description ||
            'Sem descrição'}
        </p>

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
        <button onClick={() => onEdit(task)}>
          Editar
        </button>

        <button
          onClick={() => onComplete(task)}
        >
          {task.status === 'completed'
            ? 'Reabrir'
            : 'Concluir'}
        </button>

        <button
          onClick={() => onDelete(task.id)}
        >
          Excluir
        </button>
      </div>
    </article>
  );
}

export default TaskCard;