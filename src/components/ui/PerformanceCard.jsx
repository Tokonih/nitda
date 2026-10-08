const PerformanceCard = ({ percentage, grade }) => {
  return (
    <div className="bg-performance-dark rounded-xl p-6 text-white relative overflow-hidden">
      <div className="relative z-10">
        <div className="text-sm uppercase mb-2 font-medium opacity-90">Overall Performance</div>
        <div className="text-5xl font-bold mb-1">{percentage}%</div>
        <div className="text-sm opacity-90">Grade: {grade}</div>
      </div>
      
      {/* Circular progress indicator */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2">
        <svg width="80" height="80" className="transform -rotate-90">
          <circle
            cx="40"
            cy="40"
            r="32"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="40"
            cy="40"
            r="32"
            stroke="white"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 32 * (percentage / 100)} ${2 * Math.PI * 32}`}
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
};

export default PerformanceCard;
