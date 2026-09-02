function TaskFilters({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
}) {
  return (
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
        <option value="all">
          Todos os status
        </option>

        <option value="pending">
          Pendentes
        </option>

        <option value="completed">
          Concluídas
        </option>
      </select>

      <select
        value={priorityFilter}
        onChange={(event) =>
          setPriorityFilter(event.target.value)
        }
      >
        <option value="all">
          Todas as prioridades
        </option>

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
    </div>
  );
}

export default TaskFilters;