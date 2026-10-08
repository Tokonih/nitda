import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

const MetricCard = ({ label, value, status, statusColor }) => {
  const getIcon = () => {
    if (status.includes('Exceptional')) {
      return <TrendingUp className="w-4 h-4" />;
    } else if (status.includes('Unsatisfactory')) {
      return <AlertTriangle className="w-4 h-4" />;
    } else {
      return <CheckCircle className="w-4 h-4" />;
    }
  };

  const borderColor = status.includes('Unsatisfactory') ? 'border-status-unsatisfactory' : 'border-transparent';

  return (
    <div className={`bg-card rounded-xl p-6 border-2 ${borderColor} transition-all hover:shadow-lg`}>
      <div className="text-sm text-muted-foreground uppercase mb-2 font-medium">{label}</div>
      <div className="text-4xl font-bold mb-3">{value}</div>
      <div className={`flex items-center gap-2 text-sm font-medium ${statusColor}`}>
        {getIcon()}
        <span>{status}</span>
      </div>
    </div>
  );
};

export default MetricCard;
