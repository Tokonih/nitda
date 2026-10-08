const GradingSystem = () => {
  const grades = [
    { label: 'Exceptional (A+)', range: '90-100%', color: 'bg-status-exceptional' },
    { label: 'Highly Efficient (A)', range: '80-89%', color: 'bg-status-highly-efficient' },
    { label: 'Efficient (B)', range: '70-79%', color: 'bg-status-efficient' },
    { label: 'Average (C)', range: '60-69%', color: 'bg-status-average' },
    { label: 'Fair (D)', range: '50-59%', color: 'bg-status-fair' },
    { label: 'Unsatisfactory (E)', range: '< 50%', color: 'bg-status-unsatisfactory' }
  ];

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <h3 className="font-bold text-sm uppercase mb-4">Grading System</h3>
      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
        This dashboard aggregates performance data from 7 strategic departments. Grades are assigned based on percentage completion of quarterly targets.
      </p>
      <div className="space-y-3">
        {grades.map((grade, index) => (
          <div key={index} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-sm ${grade.color}`}></div>
              <span className="font-medium">{grade.label}</span>
            </div>
            <span className="text-muted-foreground">{grade.range}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GradingSystem;
