import './MetricsCard.css';

const MetricsCard = ({ title, value, change, icon: Icon, color }) => {
  const isPositive = change >= 0;
  
  return (
    <div className="metrics-card">
      <div className="metrics-header">
        <div className="metrics-icon" style={{ background: `${color}15`, color }}>
          <Icon size={20} />
        </div>
        <span className={`metrics-change ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? '+' : ''}{change}%
        </span>
      </div>
      <h3 className="metrics-value">{value}</h3>
      <p className="metrics-title">{title}</p>
    </div>
  );
};

export default MetricsCard;
