import { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import {
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Info,
  FileText,
  ArrowRight,
  TrendingDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useYears } from "@/hooks/use-years";
import {
  mockKPIData,
  mockProjectsData,
  mockComplianceData,
} from "@/services/mockData";
import Select from "react-select";
import {
  Pillar1,
  Pillar2,
  Pillar3,
  Pillar4,
  Pillar5,
  Pillar6,
  Pillar7,
  Pillar8,
} from "../assets/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchPillars } from "../Slices/pillarSlice";
import PillarProgres from "../components/ui/pillarProgress";
import { getKpiLabel, isStakeholder, isAdmin } from "@/lib/roleLabels";
import {
  getQuarterSummary,
  getDepartmentSummary,
} from "../Slices/Utils/Api/pillarQuarterlySumary";
import { getPillarPerformanceSummary } from "../Slices/Utils/Api/pillarQuarterlySumary";
import PillarProgressTable from "../components/ui/pillarProgressTable";
import { getKPIPerformance } from "../Slices/Utils/Api/pillarQuarterlySumary";
import PillarPerformanceChart from "../components/ui/PillarPerformanceChart";
import StrategicPillarColumns from "../components/scorecard/StrategicPillarColumns";
import { getKpiProgressApi } from "../Slices/Utils/Api/kpi";
import { getDepartmentApi } from "../Slices/Utils/Api/departments";
import { getErrorMessage } from "@/lib/utils";
import DepartmentSelect from "@/components/ui/DepartmentSelect";
import { setGlobalFilters } from "../Slices/globalFilterSlice";
import { getGradeHex, getGradeBadgeClasses, gradeFromPct, GRADE_SCALE } from "@/lib/gradeColors";
import { saveFilterCookie, readFilterCookie } from "@/lib/filterCookies";

import { isStakeholder as checkIsStakeholder, isAdmin as checkIsAdmin } from "@/lib/roleLabels";
const COLORS = ["#155535", "#22c55e", "#eab308", "#ef4444", "#10b981"];

const Index = () => {
  const { toast } = useToast();
  // Seed initial filter values from cookie (persisted for 2 days)
  const _initCookie = readFilterCookie();
  const [year, setYear] = useState(_initCookie.year ? parseInt(_initCookie.year) : new Date().getFullYear());
  const [quarter, setQuarter] = useState(_initCookie.quarter || "All");
  const [selectedDepartment, setSelectedDepartment] = useState(_initCookie.department || "");
  const [departments, setDepartments] = useState([]);

  const [kpiData, setKpiData] = useState([]);
  const [quaterlyData, setQuaterlyData] = useState([]);
  const [pillarSummary, setPillarSummary] = useState([]);
  const [pillarSummaryMeta, setPillarSummaryMeta] = useState(null);
  const [departmentSummary, setDepartmentSummary] = useState([]);

  const [projects, setProjects] = useState([]);
  const [complianceData, setComplianceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [hoveredPillar, setHoveredPillar] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [kPIPerformance, setkPIPerformance] = useState();
  const [impactMetrics, setImpactMetrics] = useState([]);
  const [loadingImpactMetrics, setLoadingImpactMetrics] = useState(false);
  const [selectedQuarterDetail, setSelectedQuarterDetail] = useState(null); // quarter item with details
  const carouselRef = useRef(null);
  const isFirstFetch = useRef(true);
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.authSlice);
  const userDepartment = user?.department?.id || "";
  const isAdmin = checkIsAdmin(user);
  const {
    list,
    loading: pillar,
    error,
  } = useSelector((state) => state.pillars);

  useEffect(() => {
    if (list.length === 0) {
      dispatch(fetchPillars());
    }
  }, [dispatch, list.length, user]);




  // Fetch departments (excluding stakeholders)
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await getDepartmentApi({ per_page: 100 });
        if (response.data && response.data.length > 0) {
          // Filter out stakeholder departments
          const nitdaDepartments = response.data.filter(
            (dept) => dept.type !== "stakeholder"
          );
          setDepartments(nitdaDepartments);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      }
    };
    fetchDepartments();
  }, []);

  // Initialize selectedDepartment as empty (no filter = all departments)
  // User can select any department from the dropdown

  useEffect(() => {
    // Simulate API calls
    const fetchData = async () => {
      try {
        // TODO: Replace with actual API calls

        const kpis = await mockKPIData.getAll();
        const projectsData = await mockProjectsData.getAll();
        const compliance = await mockComplianceData.getAll();

        setKpiData(kpis);
        setProjects(projectsData);
        setComplianceData(compliance);
      } catch (error) {
        toast({
          title: "Error fetching dashboard data",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoadingSummary(true);
      try {
        // Quarter summary
        const qSummary = await getQuarterSummary({
          year,
          department_id: selectedDepartment || undefined,
          all_quarters: true,
          // quarter: quarter !== "All" ? quarter.replace("Q", "") : undefined,
        });

        setQuaterlyData(qSummary?.data?.quarters);

        // Pillar performance summary
        const pSummary = await getPillarPerformanceSummary({
          year,
          period_type: quarter === "All" ? "annual" : "quarter",
          quarter: quarter !== "All" ? Number(quarter) : undefined,
          use_approvals: true,
          department_id: selectedDepartment || undefined,
        });
        setPillarSummary(pSummary?.data?.items);
        setPillarSummaryMeta(pSummary?.data || null);

        const kpiP = await getKPIPerformance({
          year,
          period_type: quarter === "All" ? "annual" : "quarter",
          quarter: quarter !== "All" ? quarter : undefined,
          use_approvals: true,
          department_id: selectedDepartment || undefined,
        });

        setkPIPerformance(kpiP.data);


        const departmentRes = await getDepartmentSummary({
          year,
          period_type: quarter === "All" ? "annual" : "quarter",
          quarter: quarter !== "All" ? quarter : undefined,
          use_approvals: true,
          department_id: selectedDepartment || undefined,
        });

        const sortedDepartments = [...(departmentRes?.data?.items || [])].sort(
          (a, b) => b.completed - a.completed
        );

        setDepartmentSummary(sortedDepartments);

        // Toast if no data found for the year based on department matrix
        const deptItems = departmentRes?.data?.items || [];
        const totalKpisInMatrix = deptItems.reduce((acc, current) => acc + Number(current.total_kpis || 0), 0);

        const isActuallyEmpty = deptItems.length === 0 || totalKpisInMatrix === 0;

        // Only notify after the user has actively changed a filter (not on initial page load)
        if (isActuallyEmpty && !isFirstFetch.current) {
          toast({
            title: "No Data Recorded",
            description: `No initiatives or KPIs have been recorded for ${year}${quarter !== "All" ? " " + quarter : ""}. Results across all departments are currently zero.`,
            variant: "warning",
          });
        }
        isFirstFetch.current = false;
      } catch (error) {
        toast({
          title: "Error fetching summary",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      } finally {
        setLoadingSummary(false);
      }
    };

    fetchSummary();
  }, [year, quarter, selectedDepartment]);

  // useEffect(() => {
  //   if (quarter === "All") {
  //     setQuarterMonthsData([]);
  //     return;
  //   }

  //   // Simulate network delay for realism
  //   const timeout = setTimeout(() => {
  //     setQuarterMonthsData(MOCK_QUARTER_MONTH_DATA[quarter] || []);
  //   }, 400);

  //   return () => clearTimeout(timeout);
  // }, [quarter]);


  // Fetch Impact Metrics (KPI Progress for carousel)
  useEffect(() => {
    const fetchImpactMetrics = async () => {
      setLoadingImpactMetrics(true);
      try {
        const response = await getKpiProgressApi({
          year,
          period_type: quarter === "All" ? "annual" : "quarterly",
          quarter: quarter !== "All" ? quarter : undefined,
          department_id: selectedDepartment || undefined,
        });

        setImpactMetrics(response?.data?.kpis || []);
      } catch (error) {
        toast({
          title: "Error fetching impact metrics",
          description: getErrorMessage(error),
          variant: "destructive",
        });
        setImpactMetrics([]);
      } finally {
        setLoadingImpactMetrics(false);
      }
    };

    fetchImpactMetrics();
  }, [year, quarter, selectedDepartment]);

  // // Top of the component
  const pillarIcons = [
    <Pillar1 />,
    <Pillar2 />,
    <Pillar3 />,
    <Pillar4 />,
    <Pillar5 />,
    <Pillar6 />,
    <Pillar7 />,
    <Pillar8 />,
  ];

  const [visibleMetrics, setVisibleMetrics] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setVisibleMetrics(1);
      else if (window.innerWidth < 1024) setVisibleMetrics(2);
      else setVisibleMetrics(4);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const maxIndex = Math.max(0, impactMetrics.length - visibleMetrics);

  const handleCarouselPrev = () => {
    setCarouselIndex((prev) => Math.max(0, prev - 1));
  };

  const handleCarouselNext = () => {
    setCarouselIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const { years: yearsList } = useYears();

  const years = yearsList.map((item) => ({
    value: item.year,
    label: ` ${item.year}`,
  }));

  const ByQuater = [
    { value: "All", label: "All" },
    { value: "1", label: "Q1" },
    { value: "2", label: "Q2" },
    { value: "3", label: "Q3" },
    { value: "4", label: "Q4" },
  ];

  const selectedQuarter = quarter;
  const selectedYear = 2025;

  const gradeColors = {
    "A+": { bg: "bg-green-100", text: "text-green-700" },
    A: { bg: "bg-green-100", text: "text-green-700" },
    B: { bg: "bg-yellow-100", text: "text-yellow-700" },
    C: { bg: "bg-orange-100", text: "text-orange-700" },
    D: { bg: "bg-red-100", text: "text-red-700" },
    E: { bg: "bg-red-200", text: "text-red-800" },
  };

  // NOTE: React-Select styles are JS-based. Ideally, move these to classes, 
  // but for now, we leave them as is. They may look light in dark mode.
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: "transparent",
      borderColor: state.isFocused ? "#155535" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #155535" : "none",
      "&:hover": {
        borderColor: "#155535",
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#155535"
        : state.isFocused
          ? "#f0fdf4" // green-50
          : "#fff",
      color: state.isSelected
        ? "#fff"
        : state.isFocused
          ? "#155535"
          : "#374151",
      cursor: "pointer",
      "&:active": {
        backgroundColor: "#155535",
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "#fff",
      zIndex: 50,
      border: "1px solid #e5e7eb",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#111827",
      fontWeight: "500",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#6b7280",
    }),
  };

  const chartData = pillarSummary?.map((pillar) => ({
    name: pillar.pillar_name,
    progress: Number(pillar.progress_percentage ?? 0),
  }));

  // Pillar icons (simple colored boxes)
  const pillarIconColors = [
    "bg-purple-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-orange-500",
    "bg-red-500",
    "bg-pink-500",
    "bg-indigo-500",
  ];

  const getGrade = (percentage) => {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C";
    if (percentage >= 50) return "D";
    return "E";
  };

  const { overallPercentage, totalKpis, gradeDistribution } = useMemo(() => {
    if (!pillarSummary || pillarSummary.length === 0) {
      return {
        overallPercentage: 0,
        totalKpis: 0,
        gradeDistribution: { "A+": 0, A: 0, B: 0, C: 0, D: 0, E: 0 },
      };
    }

    let totalProgress = 0;
    let kpiCount = 0;
    const distribution = { "A+": 0, A: 0, B: 0, C: 0, D: 0, E: 0 };

    pillarSummary.forEach((pillar) => {
      const progress = Number(pillar.progress_percentage || 0);
      const count = Number(pillar.kpi_count || 0);

      totalProgress += progress;
      kpiCount += count;

      // Calculate grade for this pillar
      const grade = getGrade(progress);
      if (distribution[grade] !== undefined) {
        distribution[grade]++;
      }
    });

    const avgProgress = totalProgress / pillarSummary.length;

    return {
      overallPercentage: parseFloat(avgProgress.toFixed(2)),
      totalKpis: kpiCount,
      gradeDistribution: distribution,
    };
  }, [pillarSummary]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Reusable skeleton shimmer block
  const Skeleton = ({ className = "" }) => (
    <div className={`animate-pulse bg-muted rounded-lg ${className}`} />
  );

  const SectionSkeleton = ({ rows = 1, height = "h-32" }) => (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className={height} />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            SRAP 2.0 Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Strategic Roadmap and Action Plan (2.0)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-2 lg:mt-0">
          {/* Year Filter */}
          <div className="w-full sm:w-40">
            <Select
              options={years}
              value={years.find((y) => y.value === year)}
              onChange={(selected) => {
                setYear(selected.value);
                dispatch(setGlobalFilters({ year: String(selected.value) }));
                saveFilterCookie({ year: String(selected.value) });
              }}
              styles={customStyles}
              placeholder="Year"
            />
          </div>

          <div className="w-full sm:w-40">
            <Select
              options={ByQuater}
              value={ByQuater.find((q) => q.value === quarter)}
              onChange={(selected) => {
                setQuarter(selected.value);
                dispatch(setGlobalFilters({ quarter: selected.value }));
                saveFilterCookie({ quarter: selected.value });
              }}
              styles={customStyles}
              placeholder="Quarter"
            />
          </div>

          {/* Department Filter */}
          <div className="w-full sm:w-56">
            <DepartmentSelect
              value={selectedDepartment}
              onChange={(val) => {
                setSelectedDepartment(val);
                dispatch(setGlobalFilters({ department: val }));
                saveFilterCookie({ department: val });
              }}
              type="nitda"
              className="w-full"
            />
          </div>

          {/* <Button className="nitda-button-primary w-full sm:w-auto">Generate Report</Button> */}
        </div>
      </div>

      {/* Container for Summary and Breakdown Side-by-Side */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6" id="home-quarterly-summary">
        {loadingSummary ? (
          <div className="flex flex-col lg:flex-row gap-4 w-full">
            <div className="animate-pulse h-48 bg-muted rounded-lg lg:w-1/4" />
            <div className="animate-pulse h-48 bg-muted rounded-lg lg:flex-1" />
          </div>
        ) : (
          <>
        {/* Left Side: Quarter Summary Card(s) */}
        {(quaterlyData || [])
          .filter((item) => {
            if (quarter === "All") return true;
            return item.quarter === parseInt(quarter);
          })
          .map((item) => (
            <Card
              key={item.quarter}
              className="nitda-card rounded-lg p-5 shadow-sm lg:w-1/4 flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow border-2 border-transparent hover:border-[#155535]/20"
              onClick={() => setSelectedQuarterDetail(item)}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    Q{item.quarter} Summary
                  </h3>
                  <span className="text-[10px] text-[#155535] font-medium bg-[#155535]/10 px-2 py-0.5 rounded-full">View Details</span>
                </div>

                <div className="mb-4">
                  {(item?.summary?.avg_completion_percentage == null || item?.summary?.avg_completion_percentage === 0) ? (
                    <p className="text-3xl font-bold text-muted-foreground">—</p>
                  ) : (
                    <p className="text-3xl font-bold" style={{ color: getGradeHex(item.summary.avg_completion_percentage) }}>
                      {item.summary.avg_completion_percentage}%
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">Avg Completion</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {item?.summary?.kpis_completed ?? 0} KPIs Completed
                    </span>
                    <CheckCircle className="w-4 h-4 text-[#10B981]" />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {item?.summary?.underperforming_kpis ?? 0} Underperforming KPIs
                    </span>
                    <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
                  </div>

                  {/* <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Top Pillar: {item?.summary?.top_pillar?.pillar_name || "-"}
                    </span>
                    <CheckCircle className="w-4 h-4 text-[#10B981]" />
                  </div> */}
                </div>
              </div>
            </Card>
          ))}

        {/* Right Side: Monthly Breakdown from monthly_breakdown array */}
        {quarter !== "All" && (() => {
          const activeQuarter = (quaterlyData || []).find(
            (item) => item.quarter === parseInt(quarter)
          );
          const monthlyBreakdown = activeQuarter?.monthly_breakdown || [];

          return (
            <Card className="nitda-card rounded-lg p-4 sm:p-6 lg:w-3/4 flex flex-col" id="home-monthly-breakdown">
              <h2 className="text-base sm:text-lg font-semibold text-foreground mb-4">
                Q{quarter} Monthly Breakdown ({year})
              </h2>

              {monthlyBreakdown.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground flex-grow flex items-center justify-center">
                  No monthly data available
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-grow">
                  {monthlyBreakdown.map((item) => (
                    <div
                      key={item.month_number}
                      className="bg-muted/50 dark:bg-muted/30 rounded-lg p-4 border border-border flex flex-col justify-between h-full"
                    >
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">
                          {item.month}
                        </h3>

                        {(item?.avg_completion == null || item?.avg_completion === 0) ? (
                          <p className="text-2xl font-bold text-muted-foreground">—</p>
                        ) : (
                          <p className="text-2xl font-bold" style={{ color: getGradeHex(item.avg_completion) }}>
                            {item.avg_completion}%
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mb-3">Avg Completion</p>

                        <div className="space-y-1 text-xs text-foreground/80">
                          <p>✔ {item?.kpis_completed ?? 0} KPIs Completed</p>
                          <p>⚠ {item?.underperforming ?? 0} Underperforming</p>
                          <p>🏆 Top Pillar: {item?.top_pillar || "—"}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })()}
          </>
        )}
      </div>
      <Card className="nitda-card relative p-4 sm:p-6" id="home-eight-pillars">
        <CardHeader className="flex flex-col items-center text-center">
          <CardTitle className="text-[#10542E] dark:text-green-500 text-[40px] font-[600]">
            The Eight Pillars
          </CardTitle>
          <CardTitle className="text-[#008000] dark:text-green-400 text-[20px] font-[400] max-w-[739px]">
            Foundational pillars driving Nigeria's digital transformation
            journey towards a technology empowered future
          </CardTitle>
        </CardHeader>

        {/* Strategic Pillar Columns */}
        <div className="px-4 py-8">
          {loadingSummary ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-4 py-8">
              {Array.from({length: 8}).map((_,i) => <div key={i} className="animate-pulse h-24 bg-muted rounded-lg" />)}
            </div>
          ) : (
          <StrategicPillarColumns
            pillars={pillarSummary?.map((p, index) => ({
              id: p.pillar_id,
              name: p.pillar_name,
              completion: Number(p.progress_percentage ?? 0),
            })) || []}
            showHeader={false}
            onPillarClick={(id) => navigate(`/dashboard/pillar/${id}`)}
          />
          )}
        </div>
      </Card>

      <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-lg font-semibold text-foreground">
            Strategic Pillar Performance
          </h2>
          <Info className="w-4 h-4 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Completion rate across all strategic pillars
        </p>

        {/* Grade colour legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-6">
          {GRADE_SCALE.slice().reverse().map((seg) => (
            <div key={seg.grade} className="flex items-center gap-1.5">
              <span
                className="inline-block w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: seg.hex }}
              />
              <span className="text-[11px] font-semibold" style={{ color: seg.hex }}>
                {seg.grade}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {seg.min}–{seg.max}%
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="home-pillar-perf-cards">
          {loadingSummary ? (
            Array.from({length: 8}).map((_,i) => <div key={i} className="animate-pulse h-40 bg-muted rounded-xl" />)
          ) : (
          pillarSummary?.map((pillar, index) => {
            const progress = Number(pillar.progress_percentage ?? 0);
            const grade = getGrade(progress);
            const kpiCount = pillar.kpi_count ?? 0;

            return (
              <div
                key={pillar.pillar_id}
                // UPDATED: bg-muted/40 for clearer cards in dark mode
                className="bg-muted/40 dark:bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all cursor-pointer"
                onClick={() =>
                  navigate(`/dashboard/pillar/${pillar.pillar_id}`)
                }
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 ${pillarIconColors[index % pillarIconColors.length]
                      } rounded-xl flex items-center justify-center`}
                  >
                    <FileText className="w-6 h-6 text-white" />
                  </div>

                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${getGradeBadgeClasses(grade).bg} ${getGradeBadgeClasses(grade).text}`}
                  >
                    {grade}
                  </span>
                </div>

                {/* Pillar name */}
                <h3 className="font-medium text-foreground mb-2 line-clamp-2 min-h-[48px]">
                  {pillar.pillar_name}
                </h3>

                {/* Progress */}
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-3xl font-bold" style={{ color: getGradeHex(progress) }}>
                    {progress.toFixed(2)}%
                  </span>
                </div>

                {/* KPI + CTA */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {kpiCount} KPI{kpiCount !== 1 && "s"}
                  </span>

                  <button className="text-green-600 hover:text-green-700 flex items-center gap-1 text-xs font-medium">
                    View more
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
          )}
        </div>
      </div>
      <div className="">
        <div className="flex flex-col lg:flex-row items-start gap-6 mb-6">
          {/* Overall Progress — grade-colored */}
          <div className="bg-card rounded-xl shadow-sm p-6 border border-border w-full lg:w-1/3" id="home-overall-progress">
            {loadingSummary ? (
              <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="w-48 h-48 bg-muted rounded-full" />
                <div className="h-4 bg-muted rounded w-32" />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <h2 className="text-lg font-semibold text-foreground self-start">Overall Progress</h2>

                {/* Donut */}
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" className="text-muted/30" strokeWidth="12" />
                    <circle
                      cx="50" cy="50" r="40" fill="none"
                      stroke={getGradeHex(overallPercentage)}
                      strokeWidth="12"
                      strokeDasharray={`${overallPercentage * 2.51} 251`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold" style={{ color: getGradeHex(overallPercentage) }}>
                      {overallPercentage}%
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wide mt-0.5" style={{ color: getGradeHex(overallPercentage) }}>
                      {gradeFromPct(overallPercentage)}
                    </span>
                    <span className="text-sm text-muted-foreground mt-1">{totalKpis} KPIs</span>
                  </div>
                </div>

                <div className="w-full max-w-[200px]">
                  <div className="flex rounded-full overflow-hidden h-2.5 w-full">
                    {GRADE_SCALE.map((seg) => (
                      <div
                        key={seg.grade}
                        className="flex-1 transition-opacity"
                        style={{ backgroundColor: seg.hex, opacity: overallPercentage >= seg.min ? 1 : 0.2 }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-1">
                    {GRADE_SCALE.map((seg) => (
                      <span key={seg.grade} className="text-[9px] font-bold" style={{ color: seg.hex }}>{seg.grade}</span>
                    ))}
                  </div>
                </div>

                {/* Grade distribution badges */}
                <div className="flex flex-wrap justify-center gap-2">
                  {Object.entries(gradeDistribution).map(([grade, count]) => {
                    const cls = getGradeBadgeClasses(grade);
                    return (
                      <span key={grade} className={`px-3 py-1 rounded-full text-sm font-medium ${cls.bg} ${cls.text}`}>
                        {grade} ({count})
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Q2 Summary Snapshot */}
          <div className="bg-card rounded-xl shadow-sm p-6 w-full" id="home-summary-snapshot">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {selectedQuarter} Summary Snapshot
            </h2>

            {loadingSummary ? (
              <div className="animate-pulse space-y-2">
                {Array.from({length: 4}).map((_,i) => <div key={i} className="h-12 bg-muted rounded-lg" />)}
              </div>
            ) : (
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Top Performing KPIs */}
              <div className="mb-4 w-full md:w-1/2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-foreground">
                    Top Performing KPIs
                  </span>
                </div>
                <div className="space-y-2">
                  {kPIPerformance?.top_performing?.map((kpi, index) => (
                    <div
                      key={index}
                      // UPDATED: Added dark mode classes so green background isn't too bright
                      className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {kpi.kpi_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {/* {kpi.department} */}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          {kpi.percentage}%
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${getGradeBadgeClasses(kpi.grade).bg} ${getGradeBadgeClasses(kpi.grade).text}`}
                        >
                          {kpi.grade}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Underperforming KPIs */}
              <div className="mb-4 w-full md:w-1/2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-6 bg-red-500 rounded-full"></div>
                  <span className="font-medium text-foreground">
                    Underperforming KPIs
                  </span>
                </div>
                <div className="space-y-2">
                  {kPIPerformance?.underperforming?.map((kpi, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/50"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {kpi.kpi_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {/* {kpi.department} */}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          {kpi.percentage}%
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${getGradeBadgeClasses(kpi.grade).bg} ${getGradeBadgeClasses(kpi.grade).text}`}
                        >
                          {kpi.grade}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            )}
          </div>
        </div>

        {/* Top Section */}
        {/* <PillarProgres summary={pillarSummary} year={2025} quarter={1} /> */}

        <div className="overflow-x-auto mb-4 max-w-full scrollbar-thin scrollbar-thumb-border scrollbar-track-muted/30 hover:scrollbar-thumb-muted-foreground/30 pb-2" ref={carouselRef} id="home-impact-carousel">
          <div
            className="flex gap-4 w-max"
          >
            {loadingImpactMetrics ? (
              <div className="flex-shrink-0 w-[calc(25%-12px)] min-w-[220px] bg-card border border-border rounded-xl p-4">
                <div className="text-center py-4 text-muted-foreground">
                  Loading metrics...
                </div>
              </div>
            ) : impactMetrics.length > 0 ? (
              impactMetrics.map((metric, index) => {
                const formatNumber = (num) =>
                  new Intl.NumberFormat("en-US").format(num || 0);
                const percentage = metric.completion_percentage || 0;
                const trend =
                  percentage > 0 ? `+${percentage}%` : `${percentage}%`;

                return (
                  <div
                    key={metric.kpi_id || index}
                    className="bg-card flex-shrink-0 w-full sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)] min-w-[200px] max-w-[200px bg-gradient-to-br from-muted/30 to-card border border-border rounded-xl p-4 overflow-x-auto"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {metric.pillar_name || "Impact Metric"}
                      </span>
                      <span
                        className={`text-xs font-medium flex items-center gap-1 ${percentage > 0 ? "text-green-600" : "text-muted-foreground"
                          }`}
                      >
                        {percentage > 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {trend}
                      </span>
                    </div>
                    <p className="text-sm text-foreground mb-2">
                      {metric.kpi_name}
                    </p>
                    <div className="flex items-baseline gap-1 mb-3">
                      <span className="text-2xl font-bold text-foreground">
                        {formatNumber(metric.actual)}
                      </span>
                      <span className="text-muted-foreground">
                        / {formatNumber(metric.target)}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 mb-1">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-muted-foreground">{percentage}%</span>
                  </div>
                );
              })
            ) : (
              <div className="bg-card flex-shrink-0 w-[calc(25%-12px)] min-w-[220px] border border-border rounded-xl p-4">
                <div className="text-center py-4 text-muted-foreground">
                  No impact metrics available
                </div>
              </div>
            )}
          </div>
        </div>

        {
          isAdmin && (
            <Card className="nitda-card rounded-lg p-6 shadow-sm mb-6" id="home-dept-matrix">
              <h2 className="text-lg font-semibold text-foreground mb-1">
                Department Accountability Matrix
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Monitor performance across departments
              </p>

              {loadingSummary ? (
                <div className="animate-pulse space-y-3">
                  {Array.from({length: 5}).map((_,i) => <div key={i} className="h-10 bg-muted rounded" />)}
                </div>
              ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      {/* UPDATED: Text color to text-muted-foreground */}
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground whitespace-nowrap">
                        Department
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-muted-foreground whitespace-nowrap">
                        Approved KPIs
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-muted-foreground whitespace-nowrap">
                        Target Completed
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-muted-foreground whitespace-nowrap">
                        Ongoing
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-muted-foreground whitespace-nowrap">
                        Underperforming
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-muted-foreground whitespace-nowrap">
                        AVG. Completion %
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-muted-foreground whitespace-nowrap">
                        Performance
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {departmentSummary?.map((dept, idx) => (
                      <tr
                        key={idx}
                        onClick={() => {
                          // Find the department ID by matching name against the departments list
                          const matched = departments.find(
                            (d) => d.name === dept.department
                          );
                          const deptId = dept.department_id
                            ? String(dept.department_id)
                            : matched?.id
                            ? String(matched.id)
                            : "";
                          if (deptId) {
                            dispatch(setGlobalFilters({ department: deptId }));
                            saveFilterCookie({ department: deptId });
                          }
                          navigate("/dashboard/dg-kpi-scorecard");
                        }}
                        className={`border-b border-border hover:bg-muted/50 transition-colors cursor-pointer ${dept.avg_completion_percentage < 50 ? "bg-red-50 dark:bg-red-900/10" : ""
                          }`}
                      >
                        <td className="py-4 px-4 text-foreground">
                          {dept.department}
                        </td>

                        <td className="py-4 px-4 text-center text-muted-foreground">
                          {dept.total_kpis}
                        </td>

                        <td className="py-4 px-4 text-center text-muted-foreground">
                          {dept.completed}
                        </td>

                        <td className="py-4 px-4 text-center text-muted-foreground">
                          {dept.ongoing}
                        </td>

                        <td className="py-4 px-4 text-center text-muted-foreground">
                          {dept.not_started}
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#22C55E] rounded-full"
                                style={{
                                  width: `${dept.avg_completion_percentage}%`,
                                }}
                              />
                            </div>
                            <span className="text-muted-foreground min-w-[32px]">
                              {dept.avg_completion_percentage}%
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-center">
                          {dept.performance_threshold ? (
                            <span
                              className={`inline-block px-2 py-1 rounded font-semibold text-sm ${getGradeBadgeClasses(dept.performance_threshold).bg} ${getGradeBadgeClasses(dept.performance_threshold).text}`}
                            >
                              {dept.performance_threshold}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              )}
            </Card>

          )
        }


        {/* Pillars & Objectives & KPIs */}
        {/* <PillarProgressTable summary={pillarSummary} /> */}
      </div >

      {/* Quarter Detail Modal */}
      {selectedQuarterDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setSelectedQuarterDetail(null)}
        >
          <div
            className="bg-card rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-[#155535] rounded-t-xl">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Q{selectedQuarterDetail.quarter} Pillar Details — {year}
                </h2>
                <p className="text-xs text-white/70 mt-0.5">
                  Overall: {selectedQuarterDetail.details?.overall?.progress_percentage ?? 0}% ·
                  Grade: {selectedQuarterDetail.details?.overall?.performance_threshold || "—"}
                </p>
              </div>
              <button
                onClick={() => setSelectedQuarterDetail(null)}
                className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Pillar table */}
            <div className="flex-1 overflow-auto px-6 py-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pillar</th>
                    <th className="text-center py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">KPIs</th>
                    <th className="text-right py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Target</th>
                    <th className="text-right py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Actual</th>
                    <th className="text-center py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Progress</th>
                    <th className="text-center py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedQuarterDetail.details?.pillars || []).map((pillar) => {
                    const pct = Number(pillar.progress_percentage ?? 0);
                    const hasData = pillar.kpi_count > 0;
                    const cls = getGradeBadgeClasses(pillar.performance_threshold);
                    return (
                      <tr
                        key={pillar.pillar_id}
                        className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => { setSelectedQuarterDetail(null); navigate(`/dashboard/pillar/${pillar.pillar_id}`); }}
                      >
                        <td className="py-3 px-3 font-medium text-foreground text-xs max-w-[220px]">
                          <span className="line-clamp-2 leading-snug" title={pillar.pillar_name}>
                            {pillar.pillar_name}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center text-muted-foreground text-xs">{pillar.kpi_count}</td>
                        <td className="py-3 px-3 text-right text-muted-foreground text-xs">
                          {hasData ? Number(pillar.total_target).toLocaleString() : "—"}
                        </td>
                        <td className="py-3 px-3 text-right text-xs font-semibold" style={{ color: hasData ? getGradeHex(pct) : undefined }}>
                          {hasData ? Number(pillar.total_actual).toLocaleString() : "—"}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {hasData ? (
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-xs font-bold" style={{ color: getGradeHex(pct) }}>{pct.toFixed(1)}%</span>
                              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: getGradeHex(pct) }} />
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {hasData ? (
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${cls.bg} ${cls.text}`}>
                              {pillar.performance_threshold}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer summary */}
            <div className="px-6 py-3 border-t border-border bg-muted/20 flex items-center justify-between text-xs text-muted-foreground rounded-b-xl">
              <span>{selectedQuarterDetail.details?.pillars?.length ?? 0} pillars</span>
              <span>
                Total: {Number(selectedQuarterDetail.details?.overall?.total_actual ?? 0).toLocaleString()} /
                {Number(selectedQuarterDetail.details?.overall?.total_target ?? 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div >
  );
};

export default Index;