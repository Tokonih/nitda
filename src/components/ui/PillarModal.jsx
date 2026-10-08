import { X, Download } from 'lucide-react';

const PillarModal = ({ pillar, onClose }) => {
  if (!pillar) return null;

  const getGradeColor = (grade) => {
    const gradeMap = {
      'E': 'text-status-unsatisfactory',
      'D': 'text-status-fair',
      'C': 'text-status-average',
      'B': 'text-status-efficient',
      'A': 'text-status-highly-efficient',
      'A+': 'text-status-exceptional'
    };
    return gradeMap[grade] || 'text-gray-600';
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="text-xs text-muted-foreground uppercase mb-2 font-medium">
                Strategic Pillar {pillar.id}
              </div>
              <h2 className="text-2xl font-bold text-foreground">{pillar.title}</h2>
            </div>
            <button 
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-muted-foreground uppercase mb-2">Performance Score</div>
              <div className={`text-3xl font-bold ${pillar.percentage < 50 ? 'text-status-unsatisfactory' : 'text-foreground'}`}>
                {pillar.percentage}%
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-muted-foreground uppercase mb-2">Grade</div>
              <div className={`text-3xl font-bold ${getGradeColor(pillar.grade)}`}>
                {pillar.grade}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-muted-foreground uppercase mb-2">Progress</div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium uppercase ${getStatusBadgeColor(pillar.status)}`}>
                {pillar.status}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <ul className="space-y-3 text-sm text-foreground">
              {pillar.description.map((item, index) => (
                <li key={index} className="flex gap-3">
                  <span className="text-muted-foreground mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* KPI Table */}
          <div className="mb-6">
            <h3 className="text-sm font-bold uppercase mb-4">Objective & KPI Breakdown</h3>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase p-4">Metric</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase p-4">Actual / Target</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase p-4">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {pillar.kpis.map((kpi, index) => (
                    <tr key={index} className="border-t border-border">
                      <td className="p-4 text-sm font-medium">{kpi.metric}</td>
                      <td className="p-4 text-sm">{kpi.actual} / {kpi.target}</td>
                      <td className="p-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium uppercase ${getStatusBadgeColor(kpi.progress)}`}>
                          {kpi.progress}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-4 border-t border-border">
            <div className="text-xs text-muted-foreground">
              Data Source: SRAP 2.0 2025 Scorecard
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              <span>Download</span>
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PillarModal;
