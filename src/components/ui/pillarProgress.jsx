import { useNavigate } from "react-router-dom";

const PillarProgres = ({ summary, year, quarter }) => {
  const navigate = useNavigate();

  const getColorByThreshold = (threshold) => {
    switch (threshold) {
      case "A+":
        return "bg-[#7C3AED]";
      case "A":
        return "bg-[#3B82F6]";
      case "B":
        return "bg-[#10B981]";
      case "C":
        return "bg-[#F59E0B]";
      case "D":
        return "bg-[#F97316]";
      case "E":
        return "bg-[#EF4444]";
      default:
        return "bg-gray-400";
    }
  };

  const pillarData =
    summary?.map((item) => ({
      id: item.pillar_id,
      label: item.pillar_name,
      value: item.progress_percentage,
      color: getColorByThreshold(item.performance_threshold),
    })) || [];

  const kpiCategories = [
    {
      grade: "A+",
      count: 11,
      percentage: 20.8,
      color: "bg-[#7C3AED]",
      textColor: "text-white",
    },
    {
      grade: "A",
      count: 0,
      percentage: 0,
      color: "bg-[#3B82F6]",
      textColor: "text-white",
    },
    {
      grade: "B",
      count: 3,
      percentage: 5.7,
      color: "bg-[#10B981]",
      textColor: "text-white",
    },
    {
      grade: "C",
      count: 2,
      percentage: 3.8,
      color: "bg-[#F59E0B]",
      textColor: "text-white",
    },
    {
      grade: "D",
      count: 5,
      percentage: 9.4,
      color: "bg-[#F97316]",
      textColor: "text-white",
    },
    {
      grade: "E",
      count: 9,
      percentage: 17,
      color: "bg-[#EF4444]",
      textColor: "text-white",
    },
    {
      grade: "NIL",
      count: 23,
      percentage: 43.4,
      color: "bg-[#6B7280]",
      textColor: "text-white",
    },
  ];

  return (
    <div className="mb-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strategic Pillar Performance */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-gray-900">
                Strategic Pillar Performance ({year} Q{quarter})
              </h2>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            Average % KPI completion rate
          </p>

          <div className="space-y-4">
            {pillarData.map((pillar, index) => (
              <div
                key={index}
                className="flex items-center gap-4 cursor-pointer "
                onClick={() => navigate(`/dashboard/pillar/${pillar?.id}`)}
              >
                <div
                  className="text-right flex-shrink-0"
                  style={{ width: "300px" }}
                >
                  <p className="text-sm font-medium text-gray-900">
                    {pillar.label}
                  </p>
                </div>

                <div className="flex-grow relative">
                  <div className="bg-gray-100 h-10 rounded relative">
                    <div
                      className={`${pillar.color} h-10 rounded flex items-center justify-end pr-3`}
                      style={{ width: `${pillar.value}%` }}
                    >
                      <span className="text-white text-sm font-medium">
                        {pillar.value}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>

        {/* KPI Performance Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 ">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xl font-semibold text-gray-900">
              KPI Performance Distribution
            </h2>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 16v-4m0-4h.01"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-500 mb-8">
            Distribution across threshold categories
          </p>

          <div className="flex items-center">
            {/* Donut Chart */}
            <div className="relative w-64 h-64 mb-8">
              <svg viewBox="0 0 200 200" className="transform -rotate-90">
                <circle cx="100" cy="100" r="80" fill="white" stroke="none" />
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="#7C3AED"
                  strokeWidth="20"
                  strokeDasharray="117.8 502.4"
                  strokeDashoffset="0"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="#6B7280"
                  strokeWidth="20"
                  strokeDasharray="244.1 502.4"
                  strokeDashoffset="-117.8"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="20"
                  strokeDasharray="95.7 502.4"
                  strokeDashoffset="-361.9"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="#F97316"
                  strokeWidth="20"
                  strokeDasharray="52.9 502.4"
                  strokeDashoffset="-457.6"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="20"
                  strokeDasharray="21.4 502.4"
                  strokeDashoffset="-510.5"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="20"
                  strokeDasharray="32.1 502.4"
                  strokeDashoffset="-531.9"
                />
              </svg>
            </div>

            {/* Legend */}
            <div className="w-full space-y-2">
              {kpiCategories.map((category, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`${category.color} ${category.textColor} w-10 h-8 rounded flex items-center justify-center text-sm font-bold`}
                    >
                      {category.grade}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {category.count} KPIs
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {category.percentage}%
                    </span>
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PillarProgres;
