import { ChevronRight } from 'lucide-react';

const PillarCard = ({ pillar, onClick }) => {
  const getStatusColor = (status) => {
    const statusMap = {
      'UNSATISFACTORY': 'bg-status-unsatisfactory',
      'EXCEPTIONAL': 'bg-status-exceptional',
      'AVERAGE': 'bg-status-average',
      'EFFICIENT': 'bg-status-efficient',
      'HIGHLY EFFICIENT': 'bg-status-highly-efficient'
    };
    return statusMap[status] || 'bg-gray-400';
  };

  const getStatusBadgeColor = (status) => {
    const statusMap = {
      'UNSATISFACTORY': 'bg-red-50 text-status-unsatisfactory',
      'EXCEPTIONAL': 'bg-purple-50 text-status-exceptional',
      'AVERAGE': 'bg-yellow-50 text-status-average',
      'EFFICIENT': 'bg-green-50 text-status-efficient',
      'HIGHLY EFFICIENT': 'bg-blue-50 text-status-highly-efficient'
    };
    return statusMap[status] || 'bg-gray-50 text-gray-600';
  };

  return (
    <div 
      className="bg-card rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer border border-border"
      onClick={onClick}
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="p-3 bg-muted rounded-lg">
          <div className="w-6 h-6 bg-gray-300 rounded"></div>
        </div>
        <div className="flex-1">
          <div className="text-xs text-muted-foreground uppercase mb-1 font-medium">Pillar {pillar.id}</div>
          <div className="font-semibold text-foreground leading-tight">{pillar.title}</div>
        </div>
        <div className="text-3xl font-bold text-foreground">{pillar.percentage}%</div>
      </div>
      
      <div className="relative h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
        <div 
          className={`absolute top-0 left-0 h-full ${getStatusColor(pillar.status)} rounded-full transition-all`}
          style={{ width: `${pillar.percentage}%` }}
        ></div>
      </div>
      
      <div className="flex items-center justify-between">
        <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${getStatusBadgeColor(pillar.status)}`}>
          {pillar.status}
        </span>
        <button className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm">
          View Details
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PillarCard;
