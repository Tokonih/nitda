import { Calendar, ChevronDown, Search, RotateCcw } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchScoreCard } from "../Slices/scoreCardSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getKpiLabel, getKpiLabelPlural } from "@/lib/roleLabels";
import { useYears } from "@/hooks/use-years";

const KpiScorecard = () => {
  const getCurrentQuarter = () => {
    const month = new Date().getMonth(); // 0-11
    if (month < 3) return "q1";
    if (month < 6) return "q2";
    if (month < 9) return "q3";
    return "all";
  };

  const [selectedQuarter, setSelectedQuarter] = useState(getCurrentQuarter());
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((state) => state.scoreCard);
  const { user } = useSelector((state) => state.authSlice);

  const { years: yearsList } = useYears();

  const [selectedYear, setSelectedYear] = useState("2025");
  // const [selectedQuarter, setSelectedQuarter] = useState("all");
  const [selectedPillar, setSelectedPillar] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openPillars, setOpenPillars] = useState({});

  useEffect(() => {
    dispatch(fetchScoreCard({ year: selectedYear }));
  }, [dispatch, selectedYear]);

  const grades = [
    {
      grade: "A+",
      range: "90% - 100%",
      desc: "Exceptional Performance",
      color: "#7C3AED",
    },
    {
      grade: "A",
      range: "80% - <90%",
      desc: "Highly Efficient Performance",
      color: "#3B82F6",
    },
    {
      grade: "B",
      range: "70% - <80%",
      desc: "Efficient Performance",
      color: "#22C55E",
    },
    {
      grade: "C",
      range: "60% - <70%",
      desc: "Average Performance",
      color: "#F59E0B",
    },
    {
      grade: "D",
      range: "50% - <60%",
      desc: "Fair Performance",
      color: "#F97316",
    },
    {
      grade: "E",
      range: "0% - <50%",
      desc: "Unsatisfactory Performance",
      color: "#EF4444",
    },
  ];

  const togglePillar = (pillarId) => {
    setOpenPillars((prev) => ({
      ...prev,
      [pillarId]: !prev[pillarId],
    }));
  };

  // Transform API data to UI format
  const transformedData = useMemo(() => {
    if (!list || !Array.isArray(list)) return [];

    return list.map((pillar) => {
      const allObjectives = [];
      const allKpis = [];

      pillar.initiatives?.forEach((initiative) => {
        initiative.objectives?.forEach((objective) => {
          allObjectives.push(objective);
          objective.kpis?.forEach((kpi) => {
            allKpis.push(kpi);
          });
        });
      });

      const avgCompletion =
        allKpis.length > 0
          ? (
            allKpis.reduce(
              (sum, kpi) =>
                sum + (kpi.annual?.annual_percentage_target_completion || 0),
              0
            ) / allKpis.length
          ).toFixed(0)
          : 0;

      return {
        pillar: pillar.name,
        pillarId: pillar.id,
        objectives: `${allObjectives.length} objectives • Avg completion: ${avgCompletion}%`,
        bgColor: "#2D3748", // You might want to change this to a theme color if possible
        sections:
          pillar.initiatives?.map((initiative) => ({
            initiative: initiative.name,
            initiativeCode: initiative.initiative_code,
            objectives:
              initiative.objectives?.map((objective) => ({
                objective: objective.name,
                kpis:
                  objective.kpis?.map((kpi) => {
                    // Helper to get value for selected quarter
                    const getQuarterData = (quarter) => {
                      if (quarter === "all") {
                        // For "All Quarters", you can show annual or latest available quarter
                        // Option: use annual if exists, else fall back to latest quarter
                        if (kpi.annual) {
                          return {
                            actual: kpi.annual.actual_annual || 0,
                            target: kpi.annual.target_annual || 0,
                            completion:
                              kpi.annual.annual_percentage_target_completion ||
                              0,
                            grade: kpi.annual.performance_threshold || "E",
                          };
                        }
                      }

                      const qKey =
                        quarter === "q1"
                          ? "quartar1"
                          : quarter === "q2"
                            ? "quartar2"
                            : quarter === "q3"
                              ? "quartar3"
                              : quarter === "q4"
                                ? "quartar4"
                                : null;

                      if (!qKey || !kpi[qKey]) {
                        return {
                          actual: 0,
                          target: 0,
                          completion: 0,
                          grade: "E",
                        };
                      }

                      const q = kpi[qKey];
                      return {
                        actual: parseFloat(
                          q.actual_q1 ||
                          q.actual_q2 ||
                          q.actual_q3 ||
                          q.actual_q4 ||
                          0
                        ),
                        target: parseFloat(
                          q.target_q1 ||
                          q.target_q2 ||
                          q.target_q3 ||
                          q.target_q4 ||
                          0
                        ),
                        completion:
                          q.q1_percentage_target_completion ||
                          q.q2_percentage_target_completion ||
                          q.q3_percentage_target_completion ||
                          q.q4_percentage_target_completion ||
                          0,
                        grade: q.performance_threshold || "E",
                      };
                    };

                    const quarterData = getQuarterData(selectedQuarter);

                    const actual = quarterData.actual;
                    const target = quarterData.target;
                    const completion = quarterData.completion;
                    const grade = quarterData.grade;

                    const status =
                      actual === 0
                        ? "Not Started"
                        : actual >= target
                          ? "Completed"
                          : "Ongoing";

                    const gradeColors = {
                      "A+": "#7C3AED",
                      A: "#3B82F6",
                      B: "#22C55E",
                      C: "#F59E0B",
                      D: "#F97316",
                      E: "#EF4444",
                    };
                    const statusColors = {
                      Completed: "#22C55E",
                      Ongoing: "#F59E0B",
                      "Not Started": "#6B7280",
                    };

                    return {
                      kpi: kpi.name,
                      target: target.toLocaleString(),
                      actual: actual.toLocaleString(),
                      completion: `${completion.toFixed(1)}%`,
                      grade,
                      gradeColor: gradeColors[grade] || "#EF4444",
                      status,
                      statusColor: statusColors[status] || "#6B7280",
                      dept: "N/A",
                      freq: kpi.frequency || "Annual",
                    };
                  }) || [],
              })) || [],
          })) || [],
      };
    });
  }, [list]);

  // Filter data based on selections
  const filteredData = useMemo(() => {
    let filtered = transformedData;

    // Filter by pillar
    if (selectedPillar !== "all") {
      filtered = filtered.filter(
        (section) => section.pillarId === parseInt(selectedPillar)
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered
        .map((section) => ({
          ...section,
          sections: section.sections
            .map((initiative) => ({
              ...initiative,
              objectives: initiative.objectives
                .map((obj) => ({
                  ...obj,
                  kpis: obj.kpis.filter(
                    (kpi) =>
                      kpi.kpi.toLowerCase().includes(query) ||
                      obj.objective.toLowerCase().includes(query) ||
                      initiative.initiative.toLowerCase().includes(query)
                  ),
                }))
                .filter((obj) => obj.kpis.length > 0),
            }))
            .filter((initiative) => initiative.objectives.length > 0),
        }))
        .filter((section) => section.sections.length > 0);
    }
    if (selectedQuarter !== "all") {
      filtered = filtered
        .map((section) => ({
          ...section,
          sections: section.sections
            .map((initiative) => ({
              ...initiative,
              objectives: initiative.objectives
                .map((obj) => ({
                  ...obj,
                  kpis: obj.kpis.filter((kpi) => {
                    // Only keep KPIs that have data in the selected quarter
                    const qKey =
                      selectedQuarter === "q1"
                        ? "quartar1"
                        : selectedQuarter === "q2"
                          ? "quartar2"
                          : selectedQuarter === "q3"
                            ? "quartar3"
                            : selectedQuarter === "q4"
                              ? "quartar4"
                              : null;

                    return (
                      qKey &&
                      kpi[qKey] &&
                      (kpi[qKey].target_q1 ||
                        kpi[qKey].target_q2 ||
                        kpi[qKey].target_q3 ||
                        kpi[qKey].target_q4)
                    );
                  }),
                }))
                .filter((obj) => obj.kpis.length > 0),
            }))
            .filter((init) => init.objectives.length > 0),
        }))
        .filter((section) => section.sections.length > 0);
    }

    return filtered;
  }, [transformedData, selectedPillar, searchQuery, selectedQuarter]);

  const handleReset = () => {
    setSelectedYear("2025");
    setSelectedQuarter("all");
    setSelectedPillar("all");
    setSearchQuery("");
  };

  const years = yearsList.map(y => y.year.toString());
  const quarters = [
    { value: "all", label: "All Quarters" },
    { value: "q1", label: "Q1" },
    { value: "q2", label: "Q2" },
    { value: "q3", label: "Q3" },
    { value: "q4", label: "Q4" },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-6" id="kpi-scorecard-header">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {getKpiLabel(user?.role)} Performance Scorecard
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Pillar → Initiative → Objective → {getKpiLabel(user?.role)}
              </p>
            </div>
            <div className="flex items-center gap-3">

              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[140px] bg-background border-input">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedQuarter}
                onValueChange={setSelectedQuarter}
              >
                <SelectTrigger className="w-[160px] bg-background border-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {quarters.map((q) => (
                    <SelectItem key={q.value} value={q.value}>
                      {q.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* <button className="flex items-center gap-2 px-4 py-2 bg-[#22C55E] text-white rounded-lg text-sm font-medium hover:bg-[#16A34A]">
                Generate Report
              </button> */}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-lg p-4 mb-6 border border-border" id="kpi-scorecard-filters">
          <div className="flex items-center gap-3">
            <Select value={selectedPillar} onValueChange={setSelectedPillar}>
              <SelectTrigger className="w-[200px] truncate bg-background border-input">
                <SelectValue placeholder="All Pillars" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pillars</SelectItem>
                {list?.map((pillar) => (
                  <SelectItem key={pillar.id} value={pillar.id.toString()}>
                    {pillar.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search KPI, Objective, Initiative..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
              />
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-background border border-input rounded-lg text-sm text-foreground hover:bg-muted/50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="bg-card rounded-lg p-8 text-center border border-border">
            <p className="text-muted-foreground">Loading scorecard data...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg p-4 text-center">
            <p className="text-red-600 dark:text-red-400">
              {error?.message || "Failed to load scorecard data"}
            </p>
          </div>
        )}

        {!loading && !error && filteredData.length === 0 && (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <p className="text-muted-foreground">
              No KPI data found for the selected filters.
            </p>
          </div>
        )}

        {/* KPI Sections */}
        <div className="space-y-6">
          {filteredData.map((section, sectionIdx) => (
            <div
              key={sectionIdx}
              className="bg-card rounded-lg overflow-hidden border border-border"
            >
              {/* Pillar Header */}
              <div
                className="px-6 py-4 text-white flex items-center justify-between cursor-pointer"
                style={{ backgroundColor: section.bgColor }}
                onClick={() => togglePillar(section.pillarId)}
              >
                <div>
                  <h2 className="text-lg font-bold">{section.pillar}</h2>
                  <p className="text-sm opacity-90 mt-1">
                    {section.objectives}
                  </p>
                </div>

                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-300 ${openPillars[section.pillarId] ? "rotate-180" : "rotate-0"
                    }`}
                />
              </div>

              {/* Initiatives and Objectives */}
              {openPillars[section.pillarId] && (
                <div className="divide-y divide-border">
                  {section.sections.map((initiative, initIdx) => (
                    <div key={initIdx}>
                      {initiative.objectives.map((obj, objIdx) => (
                        <div key={objIdx}>
                          {/* Initiative Header (show once per initiative) */}
                          {objIdx === 0 && (
                            <div className="px-6 py-2 bg-muted/30">
                              <p className="text-xs font-semibold text-foreground">
                                Initiative: {initiative.initiative} (
                                {initiative.initiativeCode})
                              </p>
                            </div>
                          )}

                          {/* Objective Header */}
                          <div className="px-6 py-3 bg-muted/10 border-l-4 border-[#22C55E]">
                            <h3 className="text-sm font-semibold text-[#047857] dark:text-[#34D399]">
                              Objective: {obj.objective}
                            </h3>
                          </div>

                          {/* KPI Table */}
                          {obj.kpis.length > 0 && (
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="bg-muted" id="kpi-scorecard-table-header">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                                      KPI
                                    </th>
                                    <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">
                                      Target
                                    </th>
                                    <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">
                                      Actual
                                    </th>
                                    <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">
                                      Completion
                                    </th>
                                    <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">
                                      Grade
                                    </th>
                                    <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">
                                      Status
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {obj.kpis.map((kpi, kpiIdx) => (
                                    <tr
                                      key={kpiIdx}
                                      className="border-b border-border hover:bg-muted/30 transition-colors"
                                    >
                                      <td className="px-4 py-3 text-sm text-foreground">
                                        {kpi.kpi}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-muted-foreground text-center">
                                        {kpi.target}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-muted-foreground text-center">
                                        {kpi.actual}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-muted-foreground text-center">
                                        {kpi.completion}
                                      </td>
                                      <td className="px-4 py-3 text-center">
                                        <span
                                          className="inline-flex items-center justify-center px-3 py-1 rounded-md text-white text-xs font-bold min-w-[40px]"
                                          style={{
                                            backgroundColor: kpi.gradeColor,
                                          }}
                                        >
                                          {kpi.grade}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3 text-center">
                                        <span
                                          className="text-xs font-semibold"
                                          style={{ color: kpi.statusColor }}
                                        >
                                          {kpi.status}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KpiScorecard;