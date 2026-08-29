import StatsCard from './StatsCard';

function TaskStats({ tasks }) {
  const total = tasks.length;

  const completed = tasks.filter(
    (task) => task.status === 'completed'
  ).length;

  const pending = tasks.filter(
    (task) => task.status === 'pending'
  ).length;

  const completionPercentage =
  total === 0
    ? 0
    : Math.round((completed / total) * 100);

  const highPriority = tasks.filter(
    (task) => task.priority === 'high'
  ).length;

  return (
    <section className="task-stats">
      <StatsCard
        title="Total"
        value={total}
      />

      <StatsCard
        title="Concluídas"
        value={completed}
      />

      <StatsCard
        title="Pendentes"
        value={pending}
      />

      <StatsCard
        title="Alta prioridade"
        value={highPriority}
      />
      <StatsCard
        title="Progresso"
        value={`${completionPercentage}%`}
        />
        <div className="progress-card">
  <div className="progress-header">
    <span>Progresso das tarefas</span>

    <strong>
      {completionPercentage}%
    </strong>
  </div>

  <div className="progress-bar">
    <div
      className="progress-bar-fill"
      style={{
        width: `${completionPercentage}%`,
      }}
    />
  </div>
</div>
    </section>
  );
}

export default TaskStats;