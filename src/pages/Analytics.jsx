import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchPillars } from "../Slices/pillarSlice";
import {
  getQuarterSummary,
  getPillarPerformanceSummary,
  getDepartmentSummary,
} from "../Slices/Utils/Api/pillarQuarterlySumary";
import { useYears } from "@/hooks/use-years";
import {
  ChevronLeft,
  ChevronRight,
  Info,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  FileText,
  Download,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";

// Grade color mapping
const gradeColors = {
  "A+": {
    bg: "bg-[#155535]/10",
    text: "text-[#155535]",
    border: "border-[#155535]/30",
  },
  A: {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-300",
  },
  B: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    border: "border-emerald-300",
  },
  C: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    border: "border-yellow-300",
  },
  D: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-300",
  },
  E: { bg: "bg-red-100", text: "text-red-700", border: "border-red-300" },
};

// Pillar icons (simple colored boxes)
const pillarIconColors = [
  "bg-emerald-600",
  "bg-green-600",
  "bg-[#155535]",
  "bg-yellow-500",
  "bg-orange-500",
  "bg-red-500",
  "bg-emerald-500",
  "bg-green-500",
];

const getGrade = (percentage) => {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  return "E";
};

const Analytics = () => {
  const dispatch = useDispatch();
  const { list: pillars = [] } = useSelector((state) => state.pillars || {});
  const { toast } = useToast();

  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedQuarter, setSelectedQuarter] = useState("Q2");
  const [quarterSummary, setQuarterSummary] = useState(null);
  const [pillarPerformance, setPillarPerformance] = useState(null);
  const [departmentSummary, setDepartmentSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselRef = useRef(null);

  const { years: yearsList } = useYears();
  const years = yearsList.length > 0 ? yearsList.map(y => y.year.toString()) : ["2024", "2025", "2026", "2027"];
  const quarters = ["1", "2", "3", "4"];

  const ByQuater = [
    { value: "All", label: "All" },
    { value: "1", label: "QI " },
    { value: "2,", label: "Q2 " },
    { value: "3", label: "Q3 " },
    { value: "4", label: "Q4 " },
  ];

  useEffect(() => {
    dispatch(fetchPillars());
  }, [dispatch]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const quarterNum = selectedQuarter.replace("Q", "");

        const [qSummary, pPerformance, dSummary] = await Promise.all([
          getQuarterSummary({
            quarter: quarterNum,
            year: selectedYear,
            all_quarters: "false",
            use_approvals: "true",
          }),
          getPillarPerformanceSummary({
            quarter: quarterNum,
            year: selectedYear,
            period_type: "annual",
            use_approvals: "true",
          }),
          getDepartmentSummary({
            quarter: quarterNum,
            year: selectedYear,
            period_type: "annual",
            use_approvals: "true",
            department_type: "nitda",
          }),
        ]);

        setQuarterSummary(qSummary || null);
        setPillarPerformance(pPerformance || null);
        setDepartmentSummary(dSummary || null);
      } catch (error) {
        toast({
          title: "Error fetching analytics",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear, selectedQuarter]);


  // Sample impact metrics for carousel
  const impactMetrics = [
    {
      category: "DIGITAL LITERACY",
      trend: "+12%",
      title: "Citizens Trained",
      value: 234,
      target: 400,
      percentage: 58,
    },
    {
      category: "CYBER SECURITY",
      trend: "+8%",
      title: "Incidents Resolved",
      value: 156,
      target: 200,
      percentage: 78,
    },
    {
      category: "DIGITAL ECONOMY",
      trend: "+15%",
      title: "Startups Supported",
      value: 89,
      target: 120,
      percentage: 74,
    },
    {
      category: "E-GOVERNANCE",
      trend: "+5%",
      title: "Services Digitized",
      value: 45,
      target: 80,
      percentage: 56,
    },
    {
      category: "INFRASTRUCTURE",
      trend: "+20%",
      title: "Projects Completed",
      value: 32,
      target: 50,
      percentage: 64,
    },
    {
      category: "DATA PROTECTION",
      trend: "+10%",
      title: "Compliance Rate",
      value: 92,
      target: 100,
      percentage: 92,
    },
  ];

  const visibleMetrics = 4;
  const maxIndex = Math.max(0, impactMetrics.length - visibleMetrics);

  const handleCarouselPrev = () => {
    setCarouselIndex((prev) => Math.max(0, prev - 1));
  };

  const handleCarouselNext = () => {
    setCarouselIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  // Calculate overall stats
  const totalKpis = pillarPerformance?.total_kpis || 100;
  const overallPercentage = pillarPerformance?.overall_progress || 66;

  // Grade distribution (sample data - would come from API)
  const gradeDistribution = {
    "A+": pillarPerformance?.grade_distribution?.["A+"] || 11,
    A: pillarPerformance?.grade_distribution?.A || 25,
    B: pillarPerformance?.grade_distribution?.B || 30,
    C: pillarPerformance?.grade_distribution?.C || 18,
    D: pillarPerformance?.grade_distribution?.D || 9,
    E: pillarPerformance?.grade_distribution?.E || 7,
  };

  // Top/underperforming KPIs (sample data)
  const topKpis = quarterSummary?.top_kpis || [
    {
      name: "Digital Skills Training Completion",
      department: "DLIT",
      percentage: 98,
      grade: "A+",
    },
    {
      name: "Cybersecurity Compliance Rate",
      department: "CSIRT",
      percentage: 95,
      grade: "A+",
    },
    {
      name: "E-Government Portal Adoption",
      department: "DGov",
      percentage: 92,
      grade: "A+",
    },
  ];

  const underperformingKpis = quarterSummary?.underperforming_kpis || [
    {
      name: "Rural Internet Connectivity",
      department: "DInfra",
      percentage: 42,
      grade: "D",
    },
    {
      name: "SME Digital Transformation",
      department: "DEcon",
      percentage: 38,
      grade: "E",
    },
  ];

  // Top/underperforming departments
  const topDepartment = departmentSummary?.top_department || {
    name: "DLIT",
    percentage: 89,
    grade: "A",
  };
  const underperformingDepartment =
    departmentSummary?.underperforming_department || {
      name: "DInfra",
      percentage: 45,
      grade: "D",
    };

  return (
    <div className="space-y-6 bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <span>Dashboard</span>
          <span>/</span>
          <span className="text-gray-900">Analytics</span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              SRAP 2.0 Executive Dashboard
            </h1>
            <p className="text-gray-500 text-sm">
              Strategic Reform Agenda Program Performance Analytics
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Last Updated: {new Date().toLocaleDateString()}</span>
              <span className="flex items-center gap-1 text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Live Data
              </span>
            </div>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-24 bg-white">
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
            <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
              <SelectTrigger className="w-24 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {quarters.map((q) => (
                  <SelectItem key={q} value={q}>
                    {q}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Info className="w-4 h-4" />
              Grade Guide
            </Button>
            {/* <Button className="gap-2 bg-green-600 hover:bg-green-700">
              <Download className="w-4 h-4" />
              Generate Report
            </Button> */}
          </div>
        </div>
      </div>

      {/* National Impact Metrics Carousel */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            National Impact Metrics
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCarouselPrev}
              disabled={carouselIndex === 0}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleCarouselNext}
              disabled={carouselIndex >= maxIndex}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-hidden" ref={carouselRef}>
          <div
            className="flex gap-4 transition-transform duration-300"
            style={{
              transform: `translateX(-${carouselIndex * (100 / visibleMetrics)
                }%)`,
            }}
          >
            {impactMetrics.map((metric, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-[calc(25%-12px)] min-w-[220px] bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {metric.category}
                  </span>
                  <span
                    className={`text-xs font-medium flex items-center gap-1 ${metric.trend.startsWith("+")
                      ? "text-green-600"
                      : "text-red-600"
                      }`}
                  >
                    {metric.trend.startsWith("+") ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {metric.trend}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{metric.title}</p>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-2xl font-bold text-gray-900">
                    {metric.value}
                  </span>
                  <span className="text-gray-400">/ {metric.target}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${metric.percentage}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500">
                  {metric.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination dots */}
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCarouselIndex(i)}
              className={`w-2 h-2 rounded-full transition-colors ${i === carouselIndex ? "bg-green-600" : "bg-gray-300"
                }`}
            />
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex items-start gap-6 mb-6">
        {/* Overall Progress */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Overall Progress
              </h2>
              <p className="text-sm text-gray-500">On Track (A+, A, B)</p>
            </div>
            <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              +6.2%
            </span>
          </div>

          {/* Donut Chart */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-48 h-48">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="12"
                  strokeDasharray={`${overallPercentage * 2.51} 251`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-gray-900">
                  {overallPercentage}%
                </span>
                <span className="text-sm text-gray-500">{totalKpis} KPIs</span>
              </div>
            </div>
          </div>

          {/* Grade Distribution */}
          {/* <div className="flex flex-wrap justify-center gap-2 mb-4">
            {Object.entries(gradeDistribution).map(([grade, count]) => (
              <span
                key={grade}
                className={`px-3 py-1 rounded-full text-sm font-medium ${gradeColors[grade]?.bg} ${gradeColors[grade]?.text}`}
              >
                {grade} ({count})
              </span>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <span>
              vs {selectedQuarter} {selectedYear} Target
            </span>
            <button className="text-green-600 hover:underline">
              View Details
            </button>
          </div> */}
        </div>

        {/* Q2 Summary Snapshot */}
        <div className="bg-white rounded-xl shadow-sm p-6 w-full">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedQuarter} Summary Snapshot
          </h2>

          <div className="flex items-start gap-6">
            {/* Top Performing KPIs */}
            <div className="mb-4 w-1/2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                <span className="font-medium text-gray-700">
                  Top Performing KPIs
                </span>
              </div>
              <div className="space-y-2">
                {topKpis.slice(0, 3).map((kpi, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {kpi.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {kpi.department}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {kpi.percentage}%
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${gradeColors[kpi.grade]?.bg
                          } ${gradeColors[kpi.grade]?.text}`}
                      >
                        {kpi.grade}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-100 mt-3">
                <p className="text-xs text-gray-500 mb-1">Top Department</p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">
                    {topDepartment.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-green-600">
                      {topDepartment.percentage}%
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${gradeColors[topDepartment.grade]?.bg
                        } ${gradeColors[topDepartment.grade]?.text}`}
                    >
                      {topDepartment.grade}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Underperforming KPIs */}
            <div className="mb-4 w-1/2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-6 bg-red-500 rounded-full"></div>
                <span className="font-medium text-gray-700">
                  Underperforming KPIs
                </span>
              </div>
              <div className="space-y-2">
                {underperformingKpis.slice(0, 2).map((kpi, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {kpi.name}
                      </p>
                      <p className="text-xs text-gray-500">{kpi.department}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {kpi.percentage}%
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${gradeColors[kpi.grade]?.bg
                          } ${gradeColors[kpi.grade]?.text}`}
                      >
                        {kpi.grade}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-100 mt-4">
                <p className="text-xs text-gray-500 mb-1">
                  Underperforming Department
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">
                    {underperformingDepartment.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-red-600">
                      {underperformingDepartment.percentage}%
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${gradeColors[underperformingDepartment.grade]?.bg
                        } ${gradeColors[underperformingDepartment.grade]?.text}`}
                    >
                      {underperformingDepartment.grade}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Pillar Performance */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-lg font-semibold text-gray-900">
            Strategic Pillar Performance
          </h2>
          <Info className="w-4 h-4 text-gray-400" />
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Completion rate across 8 strategic pillars
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {pillars.slice(0, 8).map((pillar, index) => {
            const progress =
              pillar.progress || Math.floor(Math.random() * 40) + 50;
            const grade = getGrade(progress);
            const trend =
              Math.random() > 0.5
                ? `+${(Math.random() * 5).toFixed(1)}%`
                : `-${(Math.random() * 3).toFixed(1)}%`;
            const kpiCount =
              pillar.kpi_count || Math.floor(Math.random() * 15) + 5;

            return (
              <div
                key={pillar.id || index}
                className="bg-gray-50 rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 ${pillarIconColors[index % pillarIconColors.length]
                      } rounded-xl flex items-center justify-center`}
                  >
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${gradeColors[grade]?.bg} ${gradeColors[grade]?.text}`}
                  >
                    {grade}
                  </span>
                </div>

                <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 min-h-[48px]">
                  {pillar.name || `Pillar ${index + 1}`}
                </h3>

                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {progress}%
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`text-xs flex items-center gap-1 ${trend.startsWith("+") ? "text-green-600" : "text-red-600"
                      }`}
                  >
                    {trend.startsWith("+") ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {trend}
                  </span>
                  <span className="text-xs text-gray-400">vs last quarter</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{kpiCount} KPIs</span>
                  <button className="text-green-600 hover:text-green-700 flex items-center gap-1 text-xs font-medium">
                    view more
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
