import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Info,
  Maximize2,
  Calendar,
  FileText,
  Target,
  BarChart3,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useLocation, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import KpiDrillDownModal from "@/components/modals/KpiDrillDownModal";
import { getSinglePillar } from "../Slices/pillarSlice";
import { getPillarInitiativesProgressApi } from "../Slices/Utils/Api/pillar";
import { getDepartmentApi } from "../Slices/Utils/Api/departments";
import DepartmentSelect from "@/components/ui/DepartmentSelect";
import { useYears } from "@/hooks/use-years";
import { isAdmin } from "@/lib/roleLabels";
import { useGlobalFilter } from "@/hooks/useGlobalFilter";
import { getGradeHex, getGradeBadgeClasses, gradeFromPct } from "@/lib/gradeColors";

// ── Ring Chart ────────────────────────────────────────────────────────────────
const RingChart = ({ percentage, color = "#22c55e", size = 60, strokeWidth = 6 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle cx="50%" cy="50%" r={radius} stroke="#e5e7eb" strokeWidth={strokeWidth} fill="transparent" />
        <circle
          cx="50%" cy="50%" r={radius}
          stroke={color} strokeWidth={strokeWidth} fill="transparent"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

// ── Grade helpers — delegate to shared gradeColors system ────────────────────
const getGradeColor = (pct) => getGradeHex(typeof pct === "number" ? pct : 0);
const getGradeFromThreshold = (grade) => getGradeHex(grade);

const getStatusText = (grade, pct) => {
  if (grade === "A+" || pct >= 90) return "EXCEPTIONAL (A+)";
  if (grade === "A" || pct >= 80) return "HIGHLY EFFICIENT (A)";
  if (grade === "B" || pct >= 70) return "EFFICIENT (B)";
  if (grade === "C" || pct >= 60) return "AVERAGE (C)";
  if (grade === "D" || pct >= 50) return "FAIR (D)";
  return pct > 0 ? "UNSATISFACTORY (E)" : "NO DATA (E)";
};

const fmt = (n) => new Intl.NumberFormat("en-US").format(n || 0);

// ── Component ─────────────────────────────────────────────────────────────────
const Pillar1 = () => {
  const { id } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.authSlice);
  const { currentPillar, loading: pillarLoading } = useSelector((state) => state.pillars);
  const userDepartment = user?.department?.id || "";

  const { years: yearsList } = useYears();
  const currentYear = new Date().getFullYear().toString();
  const globalFilter = useGlobalFilter();
  const dashboardFilters = location.state?.filters || {};
  const normalizeQuarter = (quarter) => {
    if (!quarter || quarter === "All" || quarter === "all") return "all";
    const value = String(quarter);
    return value.startsWith("Q") ? value : `Q${value}`;
  };

  // ── Filters ──────────────────────────────────────────────────────────────
  const [selectedYear, setSelectedYear] = useState(dashboardFilters.year || globalFilter.year || currentYear);
  const [selectedQuarter, setSelectedQuarter] = useState(
    normalizeQuarter(dashboardFilters.quarter || globalFilter.quarter)
  );
  const [selectedDepartment, setSelectedDepartment] = useState(
    dashboardFilters.department !== undefined
      ? dashboardFilters.department
      : (globalFilter.department || user?.department?.id?.toString() || "")
  );
  const [departments, setDepartments] = useState([]);

  // ── Data ─────────────────────────────────────────────────────────────────
  const [progressData, setProgressData] = useState(null); // full response .data
  const [loading, setLoading] = useState(false);

  // ── UI ───────────────────────────────────────────────────────────────────
  const [expandedInitiativeId, setExpandedInitiativeId] = useState(null);
  const [expandedObjectiveId, setExpandedObjectiveId] = useState(null);
  const [drillDownOpen, setDrillDownOpen] = useState(false);
  const [selectedKpi, setSelectedKpi] = useState(null);

  // ── Fetch departments ─────────────────────────────────────────────────────
  useEffect(() => {
    getDepartmentApi({ per_page: 100 })
      .then((res) => {
        const nitda = (res.data || []).filter((d) => d.type !== "stakeholder");
        setDepartments(nitda);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    // Only auto-select for non-admin users who don't have a department set yet
    if (!isAdmin(user) && userDepartment && !selectedDepartment && departments.length > 0) {
      setSelectedDepartment(userDepartment.toString());
    }
  }, [userDepartment, selectedDepartment, departments]);

  // ── Fetch pillar meta (name etc.) ─────────────────────────────────────────
  useEffect(() => {
    if (id) dispatch(getSinglePillar(id));
  }, [id, dispatch]);

  // ── Fetch initiatives progress ────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;

    // For non-admin users, always require a department
    const deptId = isAdmin(user) ? selectedDepartment : (selectedDepartment || userDepartment);
    if (!isAdmin(user) && !deptId) return;

    setLoading(true);
    const isQuarter = selectedQuarter !== "all";

    getPillarInitiativesProgressApi({
      pillar_id: id,
      year: selectedYear,
      // Pass department_id only when a specific department is selected;
      // omitting it (admin + "All Departments") fetches across all departments
      department_id: deptId || undefined,
      period_type: isQuarter ? "quarter" : "annual",
      quarter: isQuarter ? Number(selectedQuarter.replace("Q", "")) : undefined,
      use_approvals: true,
    })
      .then((res) => setProgressData(res?.data || null))
      .catch(() => setProgressData(null))
      .finally(() => setLoading(false));
  }, [id, selectedYear, selectedQuarter, selectedDepartment, userDepartment]);

  // ── Derived values ────────────────────────────────────────────────────────
  const initiatives = progressData?.initiatives || [];
  const overallCompletion = Number(progressData?.overall_completion_percentage ?? 0);
  const initiativesCount = progressData?.initiatives_count ?? initiatives.length;
  const objectivesCount = progressData?.objectives_count ?? 0;
  const kpisCount = progressData?.kpis_count ?? 0;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleInitiativeClick = (initId) => {
    setExpandedInitiativeId((prev) => (prev === initId ? null : initId));
    setExpandedObjectiveId(null);
  };

  const handleObjectiveClick = (objId) => {
    setExpandedObjectiveId((prev) => (prev === objId ? null : objId));
  };

  const handleOpenDrillDown = (kpi) => {
    setSelectedKpi(kpi);
    setDrillDownOpen(true);
  };

  // ── Loading guard ─────────────────────────────────────────────────────────
  if (pillarLoading || !currentPillar) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const periodLabel = selectedQuarter === "all" ? "Annual" : selectedQuarter;

  return (
    <div className="space-y-8 min-h-screen bg-transparent font-sans text-slate-800">

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {currentPillar.name}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Strategic Roadmap & Action Plan 2.0 (2025–2027)
          </p>
          <div className="flex items-center gap-1 text-emerald-600 mt-2 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="font-medium">Live Data</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3" id="pillar-controls">
          {/* Year */}
          <Select value={selectedYear.toString()} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px] h-9 text-xs bg-white border-gray-200">
              <Calendar className="w-3.5 h-3.5 mr-2 text-gray-400" />
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {[...new Set([selectedYear.toString(), ...yearsList.map((y) => y.year.toString())])]
                .sort((a, b) => b - a)
                .map((yr) => (
                  <SelectItem key={yr} value={yr}>{yr}</SelectItem>
                ))}
            </SelectContent>
          </Select>

          {/* Department (admin only) */}
          {isAdmin(user) && (
            <DepartmentSelect
              value={selectedDepartment}
              onChange={setSelectedDepartment}
              className="w-[180px]"
            />
          )}

          {/* Quarter */}
          <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
            <SelectTrigger className="w-[130px] h-9 text-xs bg-white border-gray-200">
              <SelectValue placeholder="Quarter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Quarters</SelectItem>
              <SelectItem value="Q1">Q1</SelectItem>
              <SelectItem value="Q2">Q2</SelectItem>
              <SelectItem value="Q3">Q3</SelectItem>
              <SelectItem value="Q4">Q4</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── SUMMARY CARDS ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="pillar-stats">
        {/* Overall Completion */}
        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {periodLabel} Overall Completion
              </p>
              <h3 className="text-3xl font-bold" style={{ color: getGradeColor(overallCompletion) }}>
                {overallCompletion.toFixed(1)}%
              </h3>
            </div>
            <RingChart percentage={overallCompletion} size={64} strokeWidth={6} color={getGradeColor(overallCompletion)} />
          </CardContent>
        </Card>

        {/* Initiatives */}
        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{periodLabel} Initiatives</p>
              <h3 className="text-3xl font-bold text-gray-900">{initiativesCount}</h3>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg"><FileText className="w-6 h-6 text-gray-400" /></div>
          </CardContent>
        </Card>

        {/* Objectives */}
        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{periodLabel} Objectives</p>
              <h3 className="text-3xl font-bold text-gray-900">{objectivesCount}</h3>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg"><Target className="w-6 h-6 text-gray-400" /></div>
          </CardContent>
        </Card>

        {/* KPIs */}
        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{periodLabel} KPIs</p>
              <h3 className="text-3xl font-bold text-gray-900">{kpisCount}</h3>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg"><BarChart3 className="w-6 h-6 text-gray-400" /></div>
          </CardContent>
        </Card>
      </div>

      {/* ── INITIATIVES GRID ───────────────────────────────────────────────── */}
      <div id="pillar-initiatives">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Initiatives</h3>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          </div>
        ) : initiatives.length === 0 ? (
          <div className="text-center text-gray-500 py-10 border border-dashed border-gray-200 rounded-xl">
            No initiatives found for this pillar
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4" id="pillar-initiative-grid">
            {initiatives.map((initiative) => {
              const pct = Number(initiative.completion_percentage ?? 0);
              const color = getGradeColor(pct);
              const isExpanded = expandedInitiativeId === initiative.id;

              return (
                <Card
                  key={initiative.id}
                  className={`relative border shadow-sm transition-shadow rounded-xl overflow-hidden border-t-[5px] cursor-pointer hover:shadow-md ${isExpanded ? "border-gray-300 ring-2 ring-emerald-500" : "border-gray-100"}`}
                  style={!isExpanded ? { borderTopColor: color } : {}}
                  onClick={() => handleInitiativeClick(initiative.id)}
                >
                  <CardContent className="p-6 flex flex-col items-center justify-center space-y-4">
                    <div className="relative flex items-center justify-center">
                      <RingChart percentage={pct} size={56} strokeWidth={5} color={color} />
                      <span className="absolute text-xs font-bold" style={{ color }}>
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wide text-center line-clamp-2">
                      {initiative.name}
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ── OBJECTIVES & KPIs (accordion) ──────────────────────────────────── */}
      {initiatives.map((initiative) => {
        if (expandedInitiativeId !== initiative.id) return null;
        const initObjectives = initiative.objectives || [];

        return (
          <div key={initiative.id} className="space-y-4">
            <h4 className="text-base font-semibold text-gray-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              {initiative.name}
            </h4>

            {initObjectives.length === 0 ? (
              <div className="text-center text-gray-500 py-8 border border-gray-200 rounded-xl">
                No objectives found for this initiative
              </div>
            ) : (
              initObjectives.map((objective) => {
                const objKpis = objective.kpis || [];
                const isObjExpanded = expandedObjectiveId === objective.id;
                const avgCompletion = objKpis.length > 0
                  ? objKpis.reduce((acc, k) => acc + Number(k.percentage ?? 0), 0) / objKpis.length
                  : Number(objective.completion_percentage ?? 0);

                return (
                  <div key={objective.id} className="border border-gray-200 bg-white rounded-xl shadow-sm overflow-hidden">
                    {/* Objective header */}
                    <div
                      className="p-6 border-b border-gray-100 cursor-pointer hover:bg-gray-50/50 transition-colors"
                      onClick={() => handleObjectiveClick(objective.id)}
                    >
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="mt-1 p-2 bg-[#052e23] rounded-lg shadow-sm">
                            <Target className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-gray-900 leading-snug max-w-2xl">
                              {objective.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-3">
                              <span className="bg-emerald-50 text-emerald-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-emerald-100">
                                OBJECTIVE
                              </span>
                              <span className="text-xs text-gray-500 font-medium">
                                {objKpis.length} KPI{objKpis.length !== 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between w-full sm:w-auto gap-6 border-t sm:border-t-0 pt-4 sm:pt-0">
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Completion</p>
                            <p className="text-xl font-bold" style={{ color: getGradeColor(avgCompletion) }}>
                              {avgCompletion.toFixed(1)}%
                            </p>
                          </div>
                          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-900">
                            {isObjExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* KPI table */}
                    {isObjExpanded && (
                      <div className="bg-gray-50/30 overflow-x-auto">
                        {objKpis.length === 0 ? (
                          <div className="text-center text-gray-500 py-8">
                            No KPIs found for this objective
                          </div>
                        ) : (
                          <Table className="min-w-[800px]">
                            <TableHeader>
                              <TableRow className="border-b border-gray-100 hover:bg-transparent">
                                <TableHead className="w-[300px] text-[10px] font-bold uppercase tracking-wider text-gray-400 pl-6 h-10">KPI Metric</TableHead>
                                <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider text-gray-400 h-10">Target</TableHead>
                                <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider text-gray-400 h-10">Actual</TableHead>
                                <TableHead className="text-center text-[10px] font-bold uppercase tracking-wider text-gray-400 h-10">Completion</TableHead>
                                <TableHead className="text-center text-[10px] font-bold uppercase tracking-wider text-gray-400 w-[160px] h-10">Status</TableHead>
                                <TableHead className="w-[60px] h-10" />
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {objKpis.map((kpi) => {
                                const pct = Number(kpi.percentage ?? 0);
                                const grade = kpi.grade || "";
                                const color = grade ? getGradeFromThreshold(grade) : getGradeColor(pct);
                                const statusText = kpi.status || getStatusText(grade, pct);

                                // Shape for drill-down modal
                                const kpiForModal = {
                                  kpi_id: kpi.id,
                                  kpi_name: kpi.name,
                                  target: kpi.target,
                                  actual: kpi.actual,
                                  completion_percentage: pct,
                                  performance_threshold: grade,
                                  annual: {
                                    target_annual: kpi.target,
                                    actual_annual: kpi.actual,
                                    annual_percentage_target_completion: pct,
                                    performance_threshold: grade,
                                  },
                                };

                                return (
                                  <TableRow key={kpi.id} className="hover:bg-white transition-colors border-b border-gray-50 group">
                                    <TableCell className="pl-6 py-4">
                                      <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-700 text-sm">{kpi.name}</span>
                                        {kpi.description && (
                                          <Popover>
                                            <PopoverTrigger asChild>
                                              <Info className="w-5 h-5 text-gray-300 cursor-pointer hover:text-gray-500 transition-colors outline-none" tabIndex={0} />
                                            </PopoverTrigger>
                                            <PopoverContent className="bg-[#022c22] border-none p-5 max-w-[320px] shadow-xl rounded-xl z-50">
                                              <div className="space-y-2">
                                                <h4 className="text-[#10b981] text-[11px] font-extrabold uppercase tracking-widest">Definition</h4>
                                                <p className="text-white text-xs leading-relaxed font-medium">{kpi.description}</p>
                                              </div>
                                            </PopoverContent>
                                          </Popover>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right py-4">
                                      <span className="font-bold text-gray-900 text-sm">{fmt(kpi.target)}</span>
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-gray-900 text-sm py-4">
                                      {fmt(kpi.actual)}
                                    </TableCell>
                                    <TableCell className="text-center py-4">
                                      <div className="flex flex-col items-center">
                                        <span className="font-bold text-sm" style={{ color }}>
                                          {pct.toFixed(1)}%
                                        </span>
                                        <div className="w-12 h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                          <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }} />
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-center py-4">
                                      <Badge
                                        variant="outline"
                                        className={`uppercase text-[9px] font-extrabold px-3 py-1 shadow-sm border ${getGradeBadgeClasses(grade || gradeFromPct(pct)).bg} ${getGradeBadgeClasses(grade || gradeFromPct(pct)).text} ${getGradeBadgeClasses(grade || gradeFromPct(pct)).border}`}
                                      >
                                        {statusText}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="py-4 pr-6 text-right">
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 text-gray-400 border-gray-200 hover:text-gray-900 hover:border-gray-300 hover:bg-white bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleOpenDrillDown(kpiForModal)}
                                      >
                                        <Maximize2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        );
      })}

      <KpiDrillDownModal
        key={selectedKpi?.kpi_id}
        isOpen={drillDownOpen}
        onClose={() => setDrillDownOpen(false)}
        data={selectedKpi}
      />
    </div>
  );
};

export default Pillar1;
