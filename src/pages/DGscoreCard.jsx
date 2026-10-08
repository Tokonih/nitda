import { Calendar, ChevronDown, Search, ArrowLeft, Info, ChevronRight, FileText, TrendingUp, TrendingDown, BarChart2 } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDgScoreCard, fetchDgAnnualScoreCard } from "../Slices/scoreCardSlice";
import { getDgScoreCardApi } from "../Slices/Utils/Api/scoreCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PerformanceInsights from "../components/scorecard/PerformanceInsights";
import StrategicPillars from "../components/scorecard/StrategicPillars";
import { useYears } from "@/hooks/use-years";
import { isAdmin } from "@/lib/roleLabels";
import { fetchDepartments } from "../Slices/departmentSlice";
import { Building } from "lucide-react";
import DepartmentSelect from "@/components/ui/DepartmentSelect";
import { useGlobalFilter } from "@/hooks/useGlobalFilter";

const DGKpiScorecard = () => {
  const dispatch = useDispatch();
  const { list, loading, error, meta: scorecardMeta } = useSelector((state) => state.scoreCard);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const currentYear = new Date().getFullYear().toString();
  const globalFilter = useGlobalFilter();
  const [selectedYear, setSelectedYear] = useState(globalFilter.year || currentYear);
  const [prevYearList, setPrevYearList] = useState([]);
  const [selectedQuarter, setSelectedQuarter] = useState("all");
  const [selectedPillar, setSelectedPillar] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openPillars, setOpenPillars] = useState({});
  const [openKpiId, setOpenKpiId] = useState(null);

  // State for multi-year trajectory
  const [trajectoryData, setTrajectoryData] = useState({});
  const { years: yearsList } = useYears();

  const { user } = useSelector((state) => state.authSlice);
  const { list: allDepartments } = useSelector((state) => state.departments);
  const userDepartment = user?.department?.id?.toString() || "";
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(
    globalFilter.department || userDepartment
  );

  const departments = useMemo(() => {
    return allDepartments?.filter(dept => dept.type !== 'stakeholder');
  }, [allDepartments]);

  useEffect(() => {
    // Only auto-select for non-admin users who have no department set
    if (!isAdmin(user) && userDepartment && !selectedDepartmentId) {
      setSelectedDepartmentId(userDepartment);
    }
  }, [userDepartment, selectedDepartmentId]);

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  useEffect(() => {
    const params = {
      year: selectedYear,
      // When admin selects "All Departments" (empty string), omit department_id
      // so the API returns data across all departments
      ...(selectedDepartmentId ? { department_id: selectedDepartmentId } : {}),
    };

    if (selectedQuarter === 'all') {
      dispatch(fetchDgAnnualScoreCard(params));
    } else {
      dispatch(fetchDgScoreCard({ ...params, quarter: selectedQuarter }));
    }
  }, [dispatch, selectedYear, selectedQuarter, selectedDepartmentId, userDepartment]);

  const togglePillar = (pillarId) => {
    setOpenPillars((prev) => ({
      ...prev,
      [pillarId]: !prev[pillarId],
    }));
  };

  const toggleKpi = (id) => {
    setOpenKpiId(openKpiId === id ? null : id);
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
            allKpis.reduce((sum, kpi) => {
              let comp = 0;
              // Default to annual
              const ann = kpi.annual || {};
              let target = parseFloat(ann.target_annual || 0);
              let actual = parseFloat(ann.actual_annual || 0);

              if (selectedQuarter === 'all') {
                if (ann.annual_percentage_target_completion !== undefined && ann.annual_percentage_target_completion !== null) {
                  comp = parseFloat(ann.annual_percentage_target_completion || 0);
                } else if (target > 0) {
                  comp = (actual / target) * 100;
                }
              } else {
                const qNum = selectedQuarter.replace('Q', '');
                const qKey = `quartar${qNum}`;
                const qKeyAlt = `q${qNum}`;
                // Resilience: check nested quarter object or flat on KPI itself
                const qObj = kpi[qKey] || kpi[qKeyAlt] || kpi;

                let qTarget = parseFloat(qObj[`target_q${qNum}`] || qObj.target || kpi[`target_q${qNum}`] || kpi.target_value || 0);
                let qActual = parseFloat(qObj[`actual_q${qNum}`] || qObj.actual || kpi[`actual_q${qNum}`] || 0);

                if (qTarget > 0) comp = (qActual / qTarget) * 100;
              }
              return sum + comp;
            }, 0) / allKpis.length
          ).toFixed(1)
          : 0;

      const completionVal = parseFloat(avgCompletion);
      let pillarGrade = "E";
      let pillarColor = "#ef4444"; // Red default

      if (completionVal >= 90) { pillarGrade = "A+"; pillarColor = "#155535"; }
      else if (completionVal >= 80) { pillarGrade = "A"; pillarColor = "#22c55e"; }
      else if (completionVal >= 70) { pillarGrade = "B"; pillarColor = "#10b981"; }
      else if (completionVal >= 60) { pillarGrade = "C"; pillarColor = "#eab308"; }
      else if (completionVal >= 50) { pillarGrade = "D"; pillarColor = "#f97316"; }

      return {
        pillar: pillar.name,
        pillarId: pillar.id,
        avgCompletion: parseFloat(pillar.avg_completion_percentage),
        score: `${pillar.avg_completion_percentage}%`,
        grade: pillarGrade,
        gradeColor: pillarColor,
        objectivesCount: `${pillar.initiatives?.reduce((acc, ini) => acc + (ini.objectives?.length || 0), 0) || 0} Objectives`,
        // Flatten objectives from initiatives for easier rendering in new UI
        flatObjectives: pillar.initiatives?.flatMap(initiative =>
          initiative.objectives?.map(objective => {
            const objKpis = objective.kpis || [];

            // Calculate Objective Average
            const objAvg = objKpis.length > 0 ? (objKpis.reduce((s, k) => {
              let kComp = 0;
              // Similar logic for objective average
              // Default to annual
              const ann = k.annual || {};
              let target = parseFloat(ann.target_annual || 0);
              let actual = parseFloat(ann.actual_annual || 0);

              if (selectedQuarter === 'all') {
                if (ann.annual_percentage_target_completion !== undefined && ann.annual_percentage_target_completion !== null) {
                  kComp = parseFloat(ann.annual_percentage_target_completion || 0);
                } else if (target > 0) {
                  kComp = (actual / target) * 100;
                }
              } else {
                const qNum = selectedQuarter.replace('Q', '');
                const qKey = `quartar${qNum}`;
                const qKeyAlt = `q${qNum}`;
                // Resilience: check nested quarter object or flat on KPI itself
                const qObj = k[qKey] || k[qKeyAlt] || k;

                let qTarget = parseFloat(qObj[`target_q${qNum}`] || qObj.target || k[`target_q${qNum}`] || k.target_value || 0);
                let qActual = parseFloat(qObj[`actual_q${qNum}`] || qObj.actual || k[`actual_q${qNum}`] || 0);
                if (qTarget > 0) kComp = (qActual / qTarget) * 100;
              }
              return s + kComp;
            }, 0) / objKpis.length).toFixed(1) : 0;


            const objVal = parseFloat(objAvg);
            let objPerf = "UNSATISFACTORY";
            let objPerfColor = "text-red-600";

            if (objVal >= 90) { objPerf = "EXCEPTIONAL"; objPerfColor = "text-[#155535] dark:text-[#22c55e]"; }
            else if (objVal >= 80) { objPerf = "HIGHLY EFFICIENT"; objPerfColor = "text-green-700 dark:text-green-400"; }
            else if (objVal >= 70) { objPerf = "EFFICIENT"; objPerfColor = "text-emerald-700 dark:text-emerald-400"; }
            else if (objVal >= 60) { objPerf = "AVERAGE"; objPerfColor = "text-yellow-700 dark:text-yellow-400"; }
            else if (objVal >= 50) { objPerf = "FAIR"; objPerfColor = "text-orange-700 dark:text-orange-400"; }

            return {
              name: objective.name,
              avgCompletion: `${objAvg}%`,
              performanceText: objPerf,
              performanceColor: objPerfColor,
              kpiCount: objKpis.length,
              kpis: objKpis.map(kpi => {

                let completion = 0;
                let actual = 0;
                let target = 0;
                let backendGrade = null;
                const ann = kpi.annual || {};

                if (selectedQuarter === 'all') {
                  // Use Annual Data
                  target = parseFloat(ann.target_annual || 0);
                  actual = parseFloat(ann.actual_annual || 0);

                  if (ann.annual_percentage_target_completion !== undefined && ann.annual_percentage_target_completion !== null) {
                    completion = parseFloat(ann.annual_percentage_target_completion || 0);
                  } else if (target > 0) {
                    completion = (actual / target) * 100;
                  }
                  backendGrade = ann.performance_threshold;
                } else {
                  // Use Quarter Data
                  const qNum = selectedQuarter.replace('Q', '');
                  const qKey = `quartar${qNum}`;
                  const qKeyAlt = `q${qNum}`;
                  // Resilience: check nested quarter object or flat on KPI itself
                  const qObj = kpi[qKey] || kpi[qKeyAlt] || kpi;

                  target = parseFloat(qObj[`target_q${qNum}`] || qObj.target || kpi[`target_q${qNum}`] || kpi.target_value || 0);
                  actual = parseFloat(qObj[`actual_q${qNum}`] || qObj.actual || kpi[`actual_q${qNum}`] || 0);

                  // Priority: backend percentage -> manual calc
                  if (qObj[`q${qNum}_percentage_target_completion`] !== undefined && qObj[`q${qNum}_percentage_target_completion`] !== null) {
                    completion = parseFloat(qObj[`q${qNum}_percentage_target_completion`] || 0);
                  } else if (qObj.percentage_target_completion !== undefined && qObj.percentage_target_completion !== null) {
                    completion = parseFloat(qObj.percentage_target_completion || 0);
                  } else if (target > 0) {
                    completion = (actual / target) * 100;
                  }
                }


                let grade = "E";
                let gradeColor = "#EF4444";
                let badgeText = "UNSATISFACTORY";
                let badgeBg = "bg-red-100 dark:bg-red-900/30";
                let badgeTextColor = "text-red-700 dark:text-red-400";

                // Map backend grade if it exists
                const useGrade = backendGrade || "";
                if (useGrade === "A+" || completion >= 90) {
                  grade = "A+"; gradeColor = "#155535"; badgeText = "EXCEPTIONAL"; badgeBg = "bg-[#155535]/10 dark:bg-green-900/30"; badgeTextColor = "text-[#155535] dark:text-green-400";
                } else if (useGrade === "A" || completion >= 80) {
                  grade = "A"; gradeColor = "#22C55E"; badgeText = "HIGHLY EFFICIENT"; badgeBg = "bg-green-100 dark:bg-green-900/30"; badgeTextColor = "text-green-700 dark:text-green-400";
                } else if (useGrade === "B" || completion >= 70) {
                  grade = "B"; gradeColor = "#10B981"; badgeText = "EFFICIENT"; badgeBg = "bg-emerald-100 dark:bg-emerald-900/30"; badgeTextColor = "text-emerald-700 dark:text-emerald-400";
                } else if (useGrade === "C" || completion >= 60) {
                  grade = "C"; gradeColor = "#F59E0B"; badgeText = "AVERAGE"; badgeBg = "bg-yellow-100 dark:bg-yellow-900/30"; badgeTextColor = "text-yellow-700 dark:text-yellow-400";
                } else if (useGrade === "D" || completion >= 50) {
                  grade = "D"; gradeColor = "#F97316"; badgeText = "FAIR"; badgeBg = "bg-orange-100 dark:bg-orange-900/30"; badgeTextColor = "text-orange-700 dark:text-orange-400";
                }

                let status = actual > 0 ? (actual >= target ? "Completed" : "Ongoing") : "Not Started";
                let statusColor = status === "Completed" ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800" : (status === "Ongoing" ? "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-700" : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-700");

                // Calculate Trend & Progression
                const quarters = ['quartar1', 'quartar2', 'quartar3', 'quartar4'];
                const progressionData = quarters.map((q, idx) => {
                  const qObj = kpi[q] || {};
                  const qNum = idx + 1;
                  return {
                    label: `Q${qNum}`,
                    value: parseFloat(qObj[`actual_q${qNum}`] || 0),
                    target: parseFloat(qObj[`target_q${qNum}`] || 0)
                  };
                });

                let trend = 'neutral';
                const validActuals = progressionData.map(d => d.value).filter(v => v > 0);
                if (validActuals.length >= 2) {
                  const current = validActuals[validActuals.length - 1];
                  const prev = validActuals[validActuals.length - 2];
                  trend = current > prev ? 'up' : (current < prev ? 'down' : 'neutral');
                }

                return {
                  id: kpi.id,
                  kpi: kpi.name,
                  target: parseFloat(target).toLocaleString(),
                  actual: parseFloat(actual).toLocaleString(),
                  completion: `${completion.toFixed(2)}%`,
                  grade,
                  gradeColor,
                  status,
                  statusColor,
                  badgeText,
                  badgeBg,
                  badgeTextColor,
                  trend,
                  details: {
                    definition: kpi.unit ? kpi.unit.replace(/_/g, ' ') : "N/A",
                    timeline: kpi.frequency || "Annual",
                    progressionData
                  }
                };
              })
            };
          })
        ) || []
      };

    });
  }, [list, selectedQuarter]);

  // Filter data based on selections
  const filteredData = useMemo(() => {
    let filtered = transformedData;

    // Filter by pillar
    if (selectedPillar !== "all") {
      filtered = filtered.filter(
        (section) => section.pillarId === parseInt(selectedPillar)
      );
    }
    return filtered;
  }, [transformedData, selectedPillar]);



  // Ensure current year is in the list
  const availableYears = useMemo(() => {
    const apiYears = yearsList.map(y => y.year.toString());
    if (selectedYear && !apiYears.includes(selectedYear)) {
      return [selectedYear, ...apiYears].sort((a, b) => b - a);
    }
    return apiYears;
  }, [yearsList, selectedYear]);

  const quarters = [
    { value: "all", label: "All Quarters" },
    { value: "Q1", label: "Q1" },
    { value: "Q2", label: "Q2" },
    { value: "Q3", label: "Q3" },
    { value: "Q4", label: "Q4" },
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">
                Organizational Performance Scorecard
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                Pillar → Initiative → Objective → KPI
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[120px] sm:w-[140px] bg-background border-input">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((year) => (
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
                <SelectTrigger className="w-[120px] sm:w-[160px] bg-background border-input">
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

              {
                isAdmin(user) && (
                  <DepartmentSelect
                    value={selectedDepartmentId}
                    onChange={setSelectedDepartmentId}
                    className="w-full sm:min-w-[240px] sm:w-auto max-w-[400px]"
                  />
                )
              }

              {/* <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#22C55E] text-white rounded-lg text-sm font-medium hover:bg-[#16A34A]">
                Generate Report
              </button> */}
            </div >
          </div >

          {/* New Components */}
          < PerformanceInsights
            data={selectedPillar === "all"
              ? (list || [])
              : list?.filter(p => p.id.toString() === selectedPillar) || []
            }
            prevYearList={selectedPillar === "all"
              ? (prevYearList || [])
              : prevYearList?.filter(p => p.id.toString() === selectedPillar) || []
            }
            trajectoryData={trajectoryData}
            selectedYear={selectedYear}
            selectedQuarter={selectedQuarter}
            infographic={scorecardMeta?.infographic || null}
          />

          <StrategicPillars
            pillars={transformedData.map((p) => ({
              id: p.pillarId,
              name: p.pillar,
              completion: p.avgCompletion,
            }))}
            selectedPillarId={selectedPillar}
            onPillarClick={(id) => {
              setSelectedPillar(id.toString());
              setOpenPillars((prev) => ({ ...prev, [id]: true }));
            }}
          />

          {
            selectedPillar !== "all" && (
              <div className="mb-6">
                <button
                  onClick={() => {
                    setSelectedPillar("all");
                    setOpenPillars({}); // Collapse all
                  }}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium mb-4"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to All Pillars
                </button>
              </div>
            )
          }
        </div >



        {/* Loading and Error States */}
        {
          loading && (
            <div className="bg-card rounded-lg p-8 text-center border border-border">
              <p className="text-muted-foreground">Loading scorecard data...</p>
            </div>
          )
        }

        {
          error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg p-4 text-center">
              <p className="text-red-600 dark:text-red-400">
                {error?.message || "Failed to load scorecard data"}
              </p>
            </div>
          )
        }

        {
          !loading && !error && filteredData.length === 0 && (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <p className="text-muted-foreground">
                No KPI data found for the selected filters.
              </p>
            </div>
          )
        }

        {/* KPI Sections */}
        <div className="space-y-6">
          {filteredData.map((section, sectionIdx) => (
            <div
              key={sectionIdx}
              id={`pillar-${section.pillarId}`}
              className="rounded-xl overflow-hidden shadow-sm border border-border bg-card"
            >
              {/* Pillar Header */}
              <div
                className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between cursor-pointer transition-colors gap-4 sm:gap-0 ${openPillars[section.pillarId] ? 'bg-slate-900 dark:bg-slate-950 text-white' : 'bg-slate-900 dark:bg-slate-950 text-white hover:bg-slate-800'
                  }`}
                onClick={() => togglePillar(section.pillarId)}
              >
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className={`p-1.5 rounded-full flex-shrink-0 ${openPillars[section.pillarId] ? 'bg-slate-800' : 'bg-slate-800'}`}>
                    {openPillars[section.pillarId] ? <ChevronDown className="w-5 h-5 rotate-180 transition-transform" /> : <ChevronDown className="w-5 h-5 transition-transform" />}
                  </div>
                  <h2 className="text-base sm:text-lg font-semibold tracking-tight leading-snug">{section.pillar}</h2>
                </div>

                <div className="flex items-center gap-4 sm:gap-8 w-full sm:w-auto justify-between sm:justify-end border-t border-slate-800 pt-4 sm:pt-0 sm:border-t-0">
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Avg Completion</p>
                    <p className={`text-lg sm:text-xl font-bold ${section.avgCompletion < 50 ? 'text-red-500' : 'text-green-500'}`}>{section.score}</p>
                  </div>
                  <div
                    className="w-10 h-10 rounded flex items-center justify-center font-bold text-lg text-white"
                    style={{ backgroundColor: section.gradeColor }}
                  >
                    {section.grade}
                  </div>
                </div>
              </div>

              {openPillars[section.pillarId] && (
                <div className="bg-card">
                  {section.flatObjectives?.map((obj, objIdx) => (
                    <div key={objIdx} className={`${objIdx !== 0 ? 'border-t border-border' : ''}`}>
                      {/* Objective Header Area */}
                      <div className="p-4 sm:p-6 border-b border-border">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Objective</p>
                            <h3 className="text-xl font-semibold text-foreground">{obj.name}</h3>
                          </div>
                          <div className="flex flex-wrap gap-x-6 gap-y-4 w-full md:w-auto">
                            {/* <div className="min-w-[80px]">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Avg Completion</p>
                              <p className="text-lg sm:text-2xl font-bold text-foreground">{obj.avgCompletion}</p>
                            </div> */}
                            <div className="min-w-[100px]">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Performance</p>
                              <p className={`text-xs sm:text-sm font-semibold ${obj.performanceColor} uppercase`}>{obj.performanceText}</p>
                            </div>
                            <div className="flex flex-col items-start md:items-end gap-1 flex-1 min-w-[80px]">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Summary</p>
                              <div className="flex gap-2 text-xs">
                                <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded font-medium">{obj.kpiCount} KPIs</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* KPI Grid Header */}
                        <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-2 bg-muted/50 border-y border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          <div className="col-span-4">KPI Name</div>
                          <div className="col-span-1 text-right">Target</div>
                          <div className="col-span-1 text-right">Actual</div>
                          <div className="col-span-1 text-right">Comp. %</div>
                          <div className="col-span-1 text-center">Trend</div>
                          <div className="col-span-1 text-center">Grade</div>
                          <div className="col-span-3 text-right">Performance</div>
                        </div>

                        {/* KPI Rows */}
                        <div className="space-y-1">
                          {obj.kpis.map((kpi, kpiIdx) => (
                            <div key={kpiIdx} className="group">
                              {/* Main Row */}
                              <div
                                className={`grid grid-cols-1 lg:grid-cols-12 gap-4 px-4 py-4 items-center hover:bg-muted/50 transition-colors cursor-pointer ${openKpiId === kpi.id ? 'bg-muted/30' : ''}`}
                                onClick={() => toggleKpi(kpi.id)}
                              >
                                <div className="lg:col-span-4 flex items-start gap-3">
                                  {openKpiId === kpi.id
                                    ? <ChevronDown className="w-4 h-4 text-muted-foreground mt-0.5" />
                                    : <ChevronRight className="w-4 h-4 text-muted-foreground mt-0.5 opacity-50" />
                                  }
                                  <div>
                                    <p className="text-sm font-medium text-foreground">{kpi.kpi}</p>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${kpi.statusColor}`}>
                                      {kpi.status}
                                    </span>
                                  </div>
                                </div>
                                {/* Mobile Labels are simplified for brevity, assuming Desktop focus primarily per mockup, but adding responsive hidden/block if needed. For now sticking to grid structure. */}
                                <div className="lg:col-span-1 flex justify-between lg:justify-end text-sm text-muted-foreground">
                                  <span className="lg:hidden text-[10px] uppercase font-bold text-slate-400">Target</span>
                                  <span className="font-medium lg:font-normal">{kpi.target}</span>
                                </div>
                                <div className="lg:col-span-1 flex justify-between lg:justify-end text-sm font-semibold text-foreground">
                                  <span className="lg:hidden text-[10px] uppercase font-bold text-slate-400">Actual</span>
                                  {kpi.actual}
                                </div>
                                <div className="lg:col-span-1 flex justify-between lg:justify-end text-sm font-bold text-foreground">
                                  <span className="lg:hidden text-[10px] uppercase font-bold text-slate-400">Comp %</span>
                                  {kpi.completion}
                                </div>
                                <div className="lg:col-span-1 flex justify-between lg:justify-center">
                                  <span className="lg:hidden text-[10px] uppercase font-bold text-slate-400">Trend</span>
                                  {kpi.trend === 'up'
                                    ? <TrendingUp className="w-4 h-4 text-green-500" />
                                    : (kpi.trend === 'down'
                                      ? <TrendingDown className="w-4 h-4 text-red-500" />
                                      : <span className="text-muted-foreground text-xs">-</span>
                                    )
                                  }
                                </div>
                                <div className="lg:col-span-1 flex justify-between lg:justify-center">
                                  <span className="lg:hidden text-[10px] uppercase font-bold text-slate-400">Grade</span>
                                  <span
                                    className="w-6 h-6 flex items-center justify-center text-white text-[10px] font-bold rounded"
                                    style={{ backgroundColor: kpi.gradeColor }}
                                  >
                                    {kpi.grade}
                                  </span>
                                </div>
                                <div className="lg:col-span-3 flex justify-between lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 mt-2 lg:mt-0">
                                  <span className="lg:hidden text-[10px] uppercase font-bold text-slate-400 pt-1">Rating</span>
                                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${kpi.badgeBg} ${kpi.badgeTextColor} tracking-tight`}>
                                    {kpi.badgeText}
                                  </span>
                                </div>
                              </div>

                              {/* Included Details Card */}
                              {openKpiId === kpi.id && (
                                <div className="px-4 pb-6 pt-2">
                                  <div className="bg-card border border-border rounded-lg p-6 grid grid-cols-1 gap-8 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">

                                    {/* Context */}
                                    <div className="space-y-4">
                                      <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                                        <Info className="w-4 h-4 text-emerald-500" />
                                        KPI Context
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                          <p className="text-xs text-muted-foreground font-medium uppercase">Measurement Unit:</p>
                                          <p className="text-sm text-foreground bg-muted/50 p-2 rounded border border-border uppercase">{kpi.details.definition}</p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-xs text-muted-foreground font-medium uppercase">Frequency:</p>
                                          <p className="text-sm text-foreground bg-muted/50 p-2 rounded border border-border uppercase">{kpi.details.timeline}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div >
    </div >
  );
};

export default DGKpiScorecard;