import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  TrendingUp,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  Sun,
  Moon,
  Bell,
  Calendar,
  ChevronDown,
  Download,
  Columns,
  FileText,
  Target,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  Filter,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/Slices/Utils/axiosInstance";
import { useYears } from "@/hooks/use-years";
import { useDispatch, useSelector } from "react-redux";
import { fetchStakeholderActivityDashboard, fetchStakeholderActivityValues } from "@/Slices/stakeholderActivitiesSlice";
import { formatNumberWithCommas, getAbsoluteFileUrl, isPreviewableFile } from "@/lib/utils";
import DocumentViewer from "@/components/DocumentViewer";

function StakeHoldersDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { years: yearsList } = useYears();
  const { user } = useSelector((state) => state.authSlice);
  const { dashboardData, loading } = useSelector((state) => state.stakeholderActivities);
  const [docViewer, setDocViewer] = useState({ isOpen: false, url: "", name: "" });
  const [unreadCount, setUnreadCount] = useState(0);

  const now = new Date();
  const currentYear = now.getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedQuarter, setSelectedQuarter] = useState("all");

  useEffect(() => {
    axiosInstance.get("/notifications?unread=1&per_page=1")
      .then((res) => setUnreadCount(res.data?.meta?.pagination?.total || 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const departmentId = user?.department?.id || user?.department_id;

    if (departmentId) {
      dispatch(fetchStakeholderActivityDashboard({
        department_id: departmentId,
        year: selectedYear,
        quarter: selectedQuarter !== "all" ? selectedQuarter : undefined,
      }));
    }
  }, [dispatch, user, selectedYear, selectedQuarter]);

  const getGradeColor = (grade) => {
    const colorMap = {
      "A+": "bg-purple-600",
      "A": "bg-blue-600",
      "B": "bg-green-600",
      "C": "bg-yellow-500",
      "D": "bg-orange-500",
      "E": "bg-red-500",
      "NIL": "bg-gray-500"
    };
    return colorMap[grade] || "bg-gray-400";
  };

  const submissions = (dashboardData?.submission_history || []).map((sub, idx) => {
    return {
      id: `${sub.activity_id}-${idx}`,
      activityName: sub.activity_name || "Unknown Activity",
      quarter: sub.quarter,
      valueSubmitted: formatNumberWithCommas(sub.value_submitted),
      status: sub.status,
      grade: sub.grade || "-",
      remarks: sub.review_comment || "No remarks",
      submissionDate: sub.submission_date,
      validationDate: sub.status === "approved" ? sub.submission_date : "-",
      evidence: sub.evidence_path ? getAbsoluteFileUrl(sub.evidence_path) : null,
      evidenceName: sub.evidence_path ? sub.evidence_path.split("/").pop() : "Evidence",
    };
  });

  const handleViewFile = (url, name) => {
    setDocViewer({ isOpen: true, url, name });
  };

  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [distributionTab, setDistributionTab] = useState("quarter"); // "grade" | "quarter"
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    if (dashboardData?.performance_distribution) {
      setAnimationProgress(0);
      let start = null;
      const duration = 1200; // 1.2s animation

      const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 4); // Quartic ease-out
        setAnimationProgress(easedProgress);
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }
  }, [dashboardData]);

  const getChartSegments = () => {
    const distribution = dashboardData?.performance_distribution || [];
    const colorMapHex = {
      "A+": "#a855f7", "A": "#2563eb", "B": "#16a34a",
      "C": "#eab308", "D": "#f97316", "E": "#ef4444",
      "NIL": "#6b7280"
    };

    if (distribution.length === 0) return [];

    const baseSliver = 2; // 2% minimum
    const totalBase = distribution.length * baseSliver;
    const remainingPercent = 100 - totalBase;

    let currentAngle = -90; // Start from top
    return distribution.map((item) => {
      const actualContribution = (item.percentage / 100) * remainingPercent;
      const finalAngle = ((baseSliver + actualContribution) / 100) * 360;
      // Apply animation progress to the angle
      const animatedAngle = finalAngle * animationProgress;

      const startAngle = currentAngle;
      const endAngle = currentAngle + animatedAngle;
      currentAngle = currentAngle + finalAngle; // Keep track of the "final" currentAngle for stacking even during animation

      // SVG path calculation for donut segment
      const radius = 80;
      const x1 = 100 + radius * Math.cos((Math.PI * startAngle) / 180);
      const y1 = 100 + radius * Math.sin((Math.PI * startAngle) / 180);
      const x2 = 100 + radius * Math.cos((Math.PI * endAngle) / 180);
      const y2 = 100 + radius * Math.sin((Math.PI * endAngle) / 180);
      const largeArc = animatedAngle > 180 ? 1 : 0;

      const pathData = animatedAngle <= 0 ? "" : `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;

      return {
        ...item,
        pathData,
        color: colorMapHex[item.threshold] || "#9ca3af"
      };
    });
  };

  const chartSegments = getChartSegments();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-700 w-full min-w-0 overflow-x-hidden">
      <style>{`
        .segment-path {
          transition: stroke-width 0.3s ease, filter 0.3s ease;
          stroke-width: 15;
          fill: none;
          cursor: pointer;
          stroke-linecap: round;
        }
        .segment-path:hover {
          stroke-width: 22;
          filter: brightness(1.1);
        }
      `}</style>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
          External Stakeholders Dashboard
          </h1>
          <p className="text-base text-gray-500 mt-1">
            Real-time monitoring of Nigeria's Digital Transformation Initiatives
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Notification Bell */}
          <button
            onClick={() => navigate("/dashboard/notifications")}
            className="relative p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
            title="Notifications"
          >
            <Bell className="h-5 w-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          <div className="relative">
            <select
              className="appearance-none bg-white border border-gray-300 text-gray-700 py-2.5 pl-10 pr-10 rounded-lg text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              id="sh-year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {yearsList?.map((y) => (
                <option key={y.id} value={y.year}>
                  {y.year}{y.year.toString() === currentYear ? " (Current Year)" : ""}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 text-gray-500">
              <Calendar className="h-4 w-4" />
            </div>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
          <div className="relative">
            <select
              className="appearance-none bg-white border border-gray-300 text-gray-700 py-2.5 pl-10 pr-10 rounded-lg text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
            >
              <option value="">All Quarters</option>
              <option value="1">Q1</option>
              <option value="2">Q2</option>
              <option value="3">Q3</option>
              <option value="4">Q4</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 text-gray-500">
              <Filter className="h-4 w-4" />
            </div>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
          {/* <button
            id="btn-sh-generate-report"
            className="inline-flex items-center justify-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors"
          >
            <Download className="h-4 w-4" />
            Generate Report
          </button> */}
        </div>
      </div>

      {/* Activity Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6" id="sh-stats-cards">
        <div className="bg-[#0f392b] rounded-xl p-6 text-white shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-green-200 text-sm font-medium mb-1">Total Activities</p>
            <h3 className="text-4xl font-semibold tracking-tight">
              {dashboardData?.key_metrics?.total_activities || 0}
            </h3>
            <div className="flex items-center gap-1 mt-2 text-green-300 text-xs">
              <TrendingUp className="h-3 w-3" />
              <span>Total Activities Uploaded</span>
            </div>
          </div>
          <Columns className="absolute top-6 right-6 h-6 w-6 text-green-400 opacity-80" strokeWidth={1.5} />
        </div>

        <div className="bg-[#0f392b] rounded-xl p-6 text-white shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-green-200 text-sm font-medium mb-1">Total Approved</p>
            <h3 className="text-4xl font-semibold tracking-tight">
              {/* {Math.round(dashboardData?.key_metrics?.average_completion || 0)}% */}
                {dashboardData?.key_metrics?.validation_status?.verified || 0}
            </h3>
            <div className="flex items-center gap-1 mt-2 text-green-300 text-xs">
              <TrendingUp className="h-3 w-3" />
              <span>Total Activities Approved</span>
            </div>
          </div>
          <FileText className="absolute top-6 right-6 h-6 w-6 text-green-400 opacity-80" strokeWidth={1.5} />
        </div>

       

        <div className="bg-[#0f392b] rounded-xl p-6 text-white shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-green-200 text-sm font-medium mb-1">Total Pending</p>
            <h3 className="text-4xl font-semibold tracking-tight">
              {dashboardData?.key_metrics?.validation_status?.pending || 0} 
            </h3>
            <div className="flex items-center gap-1 mt-2 text-green-300 text-xs">
              <span>Awaiting approval</span>
            </div>
          </div>
          <Target className="absolute top-6 right-6 h-6 w-6 text-green-400 opacity-80" strokeWidth={1.5} />
        </div>
         <div className="bg-[#0f392b] rounded-xl p-6 text-white shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-green-200 text-sm font-medium mb-1">Total Rejected</p>
            <h3 className="text-4xl font-semibold tracking-tight">
              {dashboardData?.key_metrics?.total_disapproved || "0/0"}
            </h3>
            <div className="flex items-center gap-1 mt-2 text-green-300 text-xs">
              <span>Rejected Activities</span>
            </div>
          </div>
          <Target className="absolute top-6 right-6 h-6 w-6 text-green-400 opacity-80" strokeWidth={1.5} />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activities Performance Snapshot */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col min-w-0" id="sh-performance-snapshot">
          <div className="flex justify-between items-start mb-6">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                Activities and their pillars
                </h3>
                <Info className="h-4 w-4 text-gray-400 shrink-0" />
              </div>
              <p className="text-sm text-gray-500 mt-1 truncate">
             Contributions to Digital Literacy
              </p>
            </div>
            {/* <button className="text-xs font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded uppercase tracking-wider border border-gray-100 hover:bg-gray-100 transition-colors shrink-0 ml-4">
              View Full Report
            </button> */}
          </div>

          {(() => {
            const top5 = dashboardData?.top_5_activities || [];
            const maxValue = top5.length > 0 ? Math.max(...top5.map(a => a.value || 0)) : 1;
            const barColors = ["bg-emerald-500", "bg-blue-500", "bg-amber-500", "bg-purple-500", "bg-rose-500"];
            const textColors = ["text-emerald-600", "text-blue-600", "text-amber-600", "text-purple-600", "text-rose-600"];
            const bgColors = ["bg-emerald-50", "bg-blue-50", "bg-amber-50", "bg-purple-50", "bg-rose-50"];

            if (top5.length === 0) {
              return (
                <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400">
                  <Target className="h-10 w-10 mb-2 opacity-20" />
                  <p className="text-sm">No activity data available</p>
                </div>
              );
            }

            return (
              <div className="flex-1 w-full space-y-5 mt-2 overflow-y-auto max-h-[500px] pr-2 min-w-0">
                {top5.map((item, idx) => {
                  const percent = maxValue > 0 ? Math.round((item.value / maxValue) * 100) : 0;
                  return (
                    <div key={idx} className="group min-w-0">
                      <div className="flex justify-between items-end mb-1.5 min-w-0 gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-800 group-hover:text-gray-900 transition-colors truncate">
                            {item.name}
                          </h4>
                          <p className="text-xs text-gray-400 truncate mt-0.5">
                            {item.pillar?.name || "—"}
                          </p>
                        </div>
                        <div className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${bgColors[idx]} ${textColors[idx]}`}>
                          {formatNumberWithCommas(item.value)}
                        </div>
                      </div>
                      <div className="relative h-2 w-full rounded-full bg-gray-100">
                        <div
                          className={`absolute top-0 left-0 h-full ${barColors[idx]} rounded-full transition-all duration-1000 ease-out`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* KPI Distribution Donut */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col min-w-0" id="sh-distribution-chart">
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-gray-900 truncate">
                Activities Performance Distribution
              </h3>
              <Info className="h-4 w-4 text-gray-400 shrink-0" />
            </div>
            <p className="text-xs text-gray-500 mt-1 truncate">
              Distribution across threshold categories
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1 self-start">
            {/* <button
              onClick={() => setDistributionTab("grade")}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${distributionTab === "grade" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              By Grade
            </button> */}
            <button
              onClick={() => setDistributionTab("quarter")}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${distributionTab === "quarter" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              By Quarter
            </button>
          </div>

          <div className="flex justify-center mb-6 relative shrink-0">
            <svg width="200" height="200" viewBox="0 0 200 200" className="animate-chart-svg">
              {chartSegments.map((seg, i) => (
                <path
                  key={i}
                  d={seg.pathData}
                  stroke={seg.color}
                  className="segment-path"
                  onMouseEnter={() => setHoveredSegment(seg)}
                  onMouseLeave={() => setHoveredSegment(null)}
                />
              ))}
            </svg>
            <div className="absolute inset-0 m-auto w-32 h-32 bg-white rounded-full flex flex-col items-center justify-center pointer-events-none">
              {hoveredSegment ? (
                <>
                  <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                    Grade {hoveredSegment.threshold}
                  </span>
                  <span className="text-2xl font-bold text-gray-900">
                    {hoveredSegment.count}
                  </span>
                  <span className="text-xs text-gray-500">
                    {Math.round(hoveredSegment.percentage)}% of total
                  </span>
                </>
              ) : (
                <>
                  <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                    Total
                  </span>
                  <span className="text-2xl font-bold text-gray-900">
                    {dashboardData?.key_metrics?.total_activities || 0}
                  </span>
                  <span className="text-xs text-gray-500">
                    Activities
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Grade distribution legend */}
          {distributionTab === "grade" && (
            <div className="space-y-3">
              {(() => {
                const distribution = dashboardData?.performance_distribution || [];
                const colorMap = {
                  "A+": "bg-purple-500", "A": "bg-blue-600", "B": "bg-green-600",
                  "C": "bg-yellow-500", "D": "bg-orange-500", "E": "bg-red-500",
                  "NIL": "bg-gray-500"
                };

                return distribution.map((item, i) => (
                  <div key={i} className={`flex items-center justify-between text-sm ${i === 0 ? "bg-gray-100/50 p-1.5 rounded pr-3" : "px-1.5"}`}>
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-6 flex items-center justify-center ${colorMap[item.threshold] || "bg-gray-500"} text-white text-[10px] font-bold rounded`}>
                        {item.threshold}
                      </span>
                      <span className="text-gray-700 font-medium truncate">
                        {item.count} Activities
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900 shrink-0">
                      {Math.round(item.percentage)}%
                    </span>
                  </div>
                ));
              })()}
            </div>
          )}

          {/* Quarterly breakdown */}
          {distributionTab === "quarter" && (
            <div className="space-y-3">
              {(() => {
                const byQuarter = dashboardData?.activities_performance_distribution?.by_quarter || [];

                if (byQuarter.length === 0) {
                  return (
                    <p className="text-xs text-gray-400 text-center py-4">No quarterly data available</p>
                  );
                }

                return byQuarter.map((q, i) => {
                  const pct = Math.round(q.percentage || 0);
                  return (
                    <div key={q.quarter} className="px-1.5">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <div className="flex items-center gap-3">
                          <span
                            className="w-8 h-6 flex items-center justify-center text-white text-[10px] font-bold rounded"
                            style={{ backgroundColor: q.color }}
                          >
                            {q.quarter}
                          </span>
                          <span className="text-gray-700 font-medium">
                            {`${q.top_performing_count ?? 0} top · ${q.underperforming_count ?? 0} under`}
                          </span>
                        </div>
                        <span className="font-semibold text-gray-900 shrink-0">{pct}%</span>
                      </div>
                      <div className=" bg-gray-100 rounded-full h-1.5 ml-11">
                        <div
                          className="h-1.5 rounded-full max-w-full transition-all duration-500"
                          style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: q.color }}
                        />
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Quarterly Summaries */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6" id="sh-quarterly-summaries">
        {(dashboardData?.quarterly_summaries || []).map((q, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 min-w-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900 truncate">{q.quarter} Summary</h3>
              <button className="text-green-600 text-xs font-semibold hover:text-green-700 shrink-0 ml-2">Details</button>
            </div>
            <div className="mb-4">
              <span className="text-4xl font-semibold text-gray-900 tracking-tight">{Math.round(q.avg_completion || 0)}%</span>
              <p className="text-sm text-gray-500 mt-1">Avg Completion</p>
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <TrendingUp className="h-3 w-3 text-green-500 shrink-0" />
                <span className="truncate">{q.top_performing_count || 0} Top performing Metrics</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <AlertTriangle className="h-3 w-3 text-red-500 shrink-0" />
                <span className="truncate">{q.underperforming_count || 0} Underperforming Metrics</span>
              </div>
            </div>
          </div>
        ))}
      </div> */}

      {/* KPI Submission History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" id="sh-submission-history">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold text-gray-900">Activities Submission history</h3>
            <Info className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 mt-1">Track and review activity submissions</p>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[800px]">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold tracking-wider">
              <tr>
                <th className="px-3 sm:px-6 py-4">Activity Name</th>
                <th className="px-3 sm:px-6 py-4">Quarter</th>
                <th className="px-3 sm:px-6 py-4">Value Submitted</th>
                <th className="px-3 sm:px-6 py-4">Evidence</th>
                <th className="px-3 sm:px-6 py-4">Status</th>
                {/* <th className="px-3 sm:px-6 py-4">Grade</th> */}
                <th className="px-3 sm:px-6 py-4">Review Comment</th>
                <th className="px-3 sm:px-6 py-4">Submission Date</th>
                <th className="px-3 sm:px-6 py-4">Validation Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {submissions.length > 0 ? (
                submissions.map((sub, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 sm:px-6 py-4 font-medium text-gray-900 whitespace-normal min-w-[200px]">
                      {sub.activityName}
                    </td>
                    <td className="px-3 sm:px-6 py-4">{sub.quarter}</td>
                    <td className="px-3 sm:px-6 py-4 text-gray-900">{sub.valueSubmitted}</td>
                    <td className="px-3 sm:px-6 py-4">
                      {sub.evidence ? (
                        <button
                          onClick={() => handleViewFile(sub.evidence, sub.evidenceName)}
                          className="flex items-center gap-1.5 font-medium text-gray-900 hover:text-green-700 hover:underline transition-colors"
                        >
                          <FileText className="h-4 w-4" /> View
                        </button>
                      ) : (
                        <span className="text-gray-400">No evidence</span>
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sub.status === "approved" ? "bg-green-50 text-green-700 border border-green-200" : sub.status === "disapproved" ? "bg-red-50 text-red-700 border border-red-200" : "bg-yellow-50 text-yellow-700 border border-yellow-200"}`}>
                        {sub.status === "approved" ? <CheckCircle className="h-3 w-3" /> : sub.status === "disapproved" ? <XCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {sub.status}
                      </span>
                    </td>
                    {/* <td className="px-3 sm:px-6 py-4">
                      <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded font-bold text-white text-xs ${getGradeColor(sub.grade)}`}>
                        {sub.grade}
                      </span>
                    </td> */}
                    <td className="px-3 sm:px-6 py-4 text-gray-600 max-w-xs truncate">{sub.remarks}</td>
                    <td className="px-3 sm:px-6 py-4">{sub.submissionDate}</td>
                    <td className="px-3 sm:px-6 py-4">{sub.validationDate}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="9" className="px-6 py-10 text-center text-gray-400 italic">No submission history found for the selected period.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <DocumentViewer
        isOpen={docViewer.isOpen}
        onClose={() => setDocViewer({ ...docViewer, isOpen: false })}
        fileUrl={docViewer.url}
        filename={docViewer.name}
      />
    </div>
  );
}

export default StakeHoldersDashboard;
