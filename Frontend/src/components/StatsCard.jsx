function StatsCard({ title, value }) {
  return (
    <div className="stats-card">
      <span className="stats-card-title">
        {title}
      </span>

      <strong className="stats-card-value">
        {value}
      </strong>
    </div>
  );
}

export default StatsCard;