
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PillarProgressTable = ({ summary }) => {
  const getColorByThreshold = (threshold) => {
    switch (threshold) {
      case "A+": return "#7C3AED";
      case "A":  return "#3B82F6";
      case "B":  return "#10B981";
      case "C":  return "#F59E0B";
      case "D":  return "#F97316";
      case "E":  return "#EF4444";
      default:   return "#6B7280"; // gray
    }
  };

  const tableData =
    summary?.map((item) => ({
      pillar: item.pillar_name,
      kpi: item.kpi_count,
      completion: item.progress_percentage,
      grade: item.performance_threshold,
      gradeColor: getColorByThreshold(item.performance_threshold),
    })) || [];

  return (
    <Card className="nitda-card rounded-lg p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground mb-1">
        Pillars & Objectives & KPIs
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#E5E7EB]">
              <th className="text-left py-3 px-4 font-semibold text-[#374151]">
                Pillar
              </th>

              <th className="text-left py-3 px-4 font-semibold text-[#374151]">
                KPI
              </th>

              <th className="text-center py-3 px-4 font-semibold text-[#374151]">
                Completion %
              </th>

              <th className="text-center py-3 px-4 font-semibold text-[#374151]">
                Grade
              </th>
            </tr>
          </thead>

          <tbody>
            {tableData.map((item, idx) => (
              <tr
                key={idx}
                className={`border-b border-[#F3F4F6] hover:bg-[#F9FAFB] ${
                  item.completion < 50 ? "bg-[#FFF5F5]" : ""
                }`}
              >
                <td className="py-4 px-4 text-[#1F2937] font-medium max-w-[200px]">
                  {item.pillar}
                </td>

                <td className="py-4 px-4 text-[#374151] max-w-[200px]">
                  {item.kpi}
                </td>

                <td className="py-4 px-4">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-24 h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${item.completion}%`,
                          backgroundColor: item.gradeColor,
                        }}
                      />
                    </div>

                    <span className="text-[#374151] min-w-[38px] text-right">
                      {item.completion}%
                    </span>
                  </div>
                </td>

                <td className="py-4 px-4 text-center">
                  <span
                    className="inline-block px-2 py-1 rounded font-semibold text-white"
                    style={{ backgroundColor: item.gradeColor }}
                  >
                    {item.grade}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default PillarProgressTable;
