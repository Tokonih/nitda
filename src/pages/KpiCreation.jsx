import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip as UITooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Filter,
  TrendingUp,
  Upload,
  Eye,
  Download,
  X as XIcon,
  Save,
  Pencil,
  ChevronLeft,
  Loader2,
  FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchAllKpi,
  createKpiValueUploadMonth,
  fetchKpiValues,
  fetchAllKpiOpenPeriod,
  updateKpiValue,
} from "../Slices/kpiSlice";
import {
  fetchStakeholderActivityValues,
  createStakeholderActivityValueUploadMonth,
  updateStakeholderActivityValue,
} from "../Slices/stakeholderActivitiesSlice";
import { fetchPillars } from "../Slices/pillarSlice";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  getKpiLabel,
  getKpiLabelPlural,
  isStakeholder,
} from "@/lib/roleLabels";
import { useYears } from "@/hooks/use-years";
import { readFilterCookie } from "@/lib/filterCookies";
import { formatNumberWithCommas, getFormattedUnit, isPreviewableFile, getAbsoluteFileUrl, forceDownload, getPreviewUrl, stripCommas } from '@/lib/utils';
import DocumentViewer from "@/components/DocumentViewer";
import { DataPagination } from "@/components/ui/data-pagination";
import { getKpiMonthStatusesApi, updateKpiValueDirectApi } from "@/Slices/Utils/Api/kpi";

const isPercentageUnit = (unit = "") =>
  ["percentage_of", "percentage", "percent", "%"].includes(
    String(unit).trim().toLowerCase()
  );

const normalizeNumericInput = (value) =>
  stripCommas(String(value ?? "")).replace(/%/g, "").trim();

const formatNumericInput = (value) =>
  formatNumberWithCommas(normalizeNumericInput(value));

const getErrorMessage = (error) => {
  if (typeof error === "string") return error;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  // Handle plain object rejections from thunks (e.g. { status: 'error', message: '...' })
  if (error?.data?.message) return error.data.message;
  if (typeof error === "object" && error !== null) {
    // Try common API response shapes
    const msg = error.error || error.msg || error.detail || error.errors;
    if (typeof msg === "string") return msg;
    if (Array.isArray(msg)) return msg.join(", ");
  }
  return "An unexpected error occurred. Please try again.";
};

const SrapKpiCreation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const kpiEntryTarget = location.state?.kpiEntry;
  const { user } = useSelector((state) => state.authSlice);
  const userDepartment = user?.department?.id || "";
  const { toast } = useToast();
  const isStakeholderUser = isStakeholder(user);

  const {
    list,
    values,
    openPeriods,
    loading,
    error: kpiError,
  } = useSelector((state) => state.kpi);

  const stakeholderActivityState = useSelector(
    (state) => state.stakeholderActivities
  );
  const stakeholderValues = stakeholderActivityState?.values || [];

  // Period selection state
  const { years: yearsList } = useYears();
  const now = new Date();
  const currentYear = now.getFullYear().toString();
  const reportingYear = kpiEntryTarget?.year || readFilterCookie().year || currentYear;
  const [selectedYear, setSelectedYear] = useState(reportingYear);
  const [selectedQuarter, setSelectedQuarter] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  // KPI data entry state
  const [selectedKpi, setSelectedKpi] = useState(kpiEntryTarget?.kpiId || "");
  const [kpiValue, setKpiValue] = useState("");
  const [remarks, setRemarks] = useState("");
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [existingEvidence, setExistingEvidence] = useState(null); // { name, url, kpiValueId }

  // Submissions filter state
  const [filterYear, setFilterYear] = useState(reportingYear);
  const [filterQuarter, setFilterQuarter] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [submissionsPage, setSubmissionsPage] = useState(1);
  const SUBMISSIONS_PER_PAGE = 10;

  // Non-stakeholder: month-statuses API data (server-side)
  const [monthStatuses, setMonthStatuses] = useState([]);
  const [monthStatusesPagination, setMonthStatusesPagination] = useState(null);
  const [monthStatusesLoading, setMonthStatusesLoading] = useState(false);

  // Modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Edit Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSubmission, setEditSubmission] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [editRemarks, setEditRemarks] = useState("");
  const [editEvidenceFile, setEditEvidenceFile] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editLoadingDetail, setEditLoadingDetail] = useState(false);

  // Document Viewer state
  const [docViewer, setDocViewer] = useState({
    isOpen: false,
    fileUrl: "",
    filename: ""
  });

  const handleViewFile = (fileUrl, filename) => {
    setDocViewer({
      isOpen: true,
      fileUrl,
      filename
    });
  };

  // Fetch KPIs/Activities/Pillars when page loads
  useEffect(() => {
    if (userDepartment) {
      if (isStakeholderUser) {
        // Stakeholders now select pillars instead of activities
        dispatch(fetchPillars({ visible_to_stakeholders: true, per_page: 100 }));
      } else {
        const payload = {
          department_id: userDepartment,
          year: selectedYear,
          approved: true
        };
        dispatch(fetchAllKpi(payload));
      }
    }
  }, [dispatch, userDepartment, isStakeholderUser, selectedYear]);

  // Fetch KPI values when filters change
  useEffect(() => {
    if (userDepartment) {
      const params = { department_id: userDepartment };
      if (filterYear) params.year = filterYear;
      if (filterQuarter !== "all") params.quarter = filterQuarter;

      if (isStakeholderUser) {
        dispatch(fetchStakeholderActivityValues(params));
      } else {
        // Non-stakeholder: use month-statuses endpoint (server-side filter + pagination)
        const fetchMonthStatuses = async () => {
          setMonthStatusesLoading(true);
          try {
            const res = await getKpiMonthStatusesApi({
              year: filterYear,
              quarter: filterQuarter !== "all" ? filterQuarter.replace("Q", "") : undefined,
              // When "all" is selected, don't pass a status filter — but we
              // exclude "submitted" from display (see filteredMonthStatuses below)
              status: filterStatus !== "all" ? filterStatus : undefined,
              department_id: userDepartment,
              page: submissionsPage,
              per_page: 15,
            });
            setMonthStatuses(res?.data || []);
            setMonthStatusesPagination(res?.meta?.pagination || null);
          } catch {
            setMonthStatuses([]);
            setMonthStatusesPagination(null);
          } finally {
            setMonthStatusesLoading(false);
          }
        };
        fetchMonthStatuses();
      }
    }
  }, [dispatch, filterYear, filterQuarter, filterStatus, submissionsPage, userDepartment, isStakeholderUser]);

  useEffect(() => {
    if (selectedKpi && selectedYear) {
      dispatch(
        fetchAllKpiOpenPeriod({ year: selectedYear, period_type: "quarter" })
      );
    }
  }, [dispatch, selectedKpi, selectedYear]);


  // Month key config shared between stakeholder and regular transformers
  const MONTH_KEYS = [
    { key: "jan_value", flag: "jan", num: 1, name: "January" },
    { key: "feb_value", flag: "feb", num: 2, name: "February" },
    { key: "mar_value", flag: "mar", num: 3, name: "March" },
    { key: "apr_value", flag: "apr", num: 4, name: "April" },
    { key: "may_value", flag: "may", num: 5, name: "May" },
    { key: "jun_value", flag: "jun", num: 6, name: "June" },
    { key: "jul_value", flag: "jul", num: 7, name: "July" },
    { key: "aug_value", flag: "aug", num: 8, name: "August" },
    { key: "sep_value", flag: "sep", num: 9, name: "September" },
    { key: "oct_value", flag: "oct", num: 10, name: "October" },
    { key: "nov_value", flag: "nov", num: 11, name: "November" },
    { key: "dec_value", flag: "dec", num: 12, name: "December" },
  ];

  // Transform values data for display
  const submissions = isStakeholderUser
    ? (stakeholderValues || []).flatMap((val) => {
      const stakeholderActivitiesList = stakeholderActivityState?.list || [];
      const kpi = val.stakeholder_activity || stakeholderActivitiesList.find(a => String(a.id) === String(val.stakeholder_activity_id)) || {};
      const activityId = kpi.id || val.stakeholder_activity_id || "";
      const department = val.department?.name || "Unknown Department";
      const objective = val.stakeholder_srap_objective?.name || "No objective";
      const flags = val.month_approval_flags || {};
      const year = val.year || new Date().getFullYear();

      const quarterTargets = {
        Q1: kpi.target_q1,
        Q2: kpi.target_q2,
        Q3: kpi.target_q3,
        Q4: kpi.target_q4,
      };

      return MONTH_KEYS
        .filter(({ key }) => val[key] !== null && val[key] !== undefined)
        .map(({ key, flag, num, name: monthName }) => {
          const quarter = num <= 3 ? "Q1" : num <= 6 ? "Q2" : num <= 9 ? "Q3" : "Q4";
          const monthValue = val[key];
          const target = quarterTargets[quarter] || kpi.target_value;
          const approvedMonths = val.approved_months || [];
          const disapprovedMonths = val.disapproved_months || [];
          const status = approvedMonths.includes(num)
            ? "approved"
            : disapprovedMonths.includes(num)
              ? "disapproved"
              : "pending";

          return {
            id: `${val.id}-${num}`,
            kpiValueId: val.id,
            kpiId: activityId,
            monthNumber: num,
            monthName,
            reportingPeriod: `${year}-${String(num).padStart(2, "0")}-${new Date(year, num, 0).getDate()}`,
            department,
            objective,
            kpi: kpi.name || "Unknown Activity",
            quarter,
            month: monthName,
            year,
            value: monthValue,
            status,
            grade: val.grade || "-",
            target: target || 0,
            achieved: monthValue || 0,
            unit: kpi.unit || "",
            remarks: val.remarks || "No remarks",
            submittedBy: val.uploaded_by?.name || "Unknown",
            submittedDate: new Date(val.created_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            }),
            sortCreatedAt: val.created_at || kpi.created_at || new Date().toISOString(),
            evidence: val.evidence_path ? val.evidence_path.split('/').pop() : null,
            evidenceSize: null,
            evidenceUrl: val.evidence_url || null,
          };
        });
    })
    : (values || []).flatMap((val) => {
      const kpi = val.kpi || {};
      const department = val.department?.name || "Unknown Department";
      const objective = val.srap_objective?.name || "No objective";
      const evidences = val.evidences || [];

      return evidences.map((evidence) => {
        const { month, year, remarks, user: submittedBy, created_at } = evidence;
        const quarter = month <= 3 ? "Q1" : month <= 6 ? "Q2" : month <= 9 ? "Q3" : "Q4";
        const monthName = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December",
        ][month - 1];
        const monthValueKeys = [
          "jan_value", "feb_value", "mar_value", "apr_value", "may_value", "jun_value",
          "jul_value", "aug_value", "sep_value", "oct_value", "nov_value", "dec_value",
        ];
        const monthValue = val[monthValueKeys[month - 1]] || "0.00";
        const quarterTargets = {
          Q1: kpi.target_q1, Q2: kpi.target_q2, Q3: kpi.target_q3, Q4: kpi.target_q4,
        };
        const target = quarterTargets[quarter] || kpi.target_value;
        const isApproved = val.month_approvals?.find((m) => m.month === month);

        return {
          id: evidence.id,
          kpiValueId: val.id,
          kpiId: kpi.id || val.kpi_id || "",
          monthNumber: month,
          monthName,
          reportingPeriod: `${year}-${String(month).padStart(2, "0")}-${new Date(year, month, 0).getDate()}`,
          department,
          objective,
          kpi: kpi.name || "Unknown KPI",
          quarter,
          month: monthName,
          year,
          value: monthValue,
          status: isApproved ? "approved" : "pending",
          grade: val.grade || "-",
          target: target || 0,
          achieved: monthValue || 0,
          unit: kpi.unit || "",
          remarks: remarks || "No remarks",
          submittedBy: submittedBy || "Unknown",
          submittedDate: new Date(created_at).toLocaleDateString("en-US", {
            month: "long", day: "numeric", year: "numeric",
          }),
          evidence: evidence.filename,
          evidenceSize: `${(evidence.size_bytes / 1024).toFixed(1)}kb`,
          evidenceUrl: evidence.url,
          sortCreatedAt: val.created_at || evidence.created_at || new Date().toISOString(),
        };
      });
    });

  // const submissions =
  //   values?.map((val) => {
  //     const kpi = list?.find((k) => k.id === val.kpi_id); // Fixed: find by kpi_id
  //     return {
  //       id: val.id,
  //       quarter: val.quarter || "Q1",
  //       month: val.month || "January",
  //       kpi: kpi?.name || "Unknown KPI",
  //       value: `${val.value}`,
  //       status: val.status || "pending",
  //       grade: val.grade || "-",
  //       target: `${kpi?.target || 5000} participants`,
  //       achieved: `${val.value} participants`,
  //       remarks: val.remarks || "No remarks",
  //       submittedBy: user?.name || "Unknown",
  //       submittedDate: new Date(
  //         val.created_at || Date.now()
  //       ).toLocaleDateString("en-US", {
  //         month: "long",
  //         day: "numeric",
  //         year: "numeric",
  //       }),
  //       evidence: val.evidence_url ? val.evidence_url.split("/").pop() : null,
  //       evidenceSize: val.evidence_size || "0kb",
  //       evidenceUrl: val.evidence_url,
  //     };
  //   }) || [];
  // Get months based on selected quarter
  const getMonthsForQuarter = (quarter) => {
    const monthMap = {
      Q1: ["January", "February", "March"],
      Q2: ["April", "May", "June"],
      Q3: ["July", "August", "September"],
      Q4: ["October", "November", "December"],
    };
    return monthMap[quarter] || [];
  };

  const isQuarterOpen = (quarter) => {
    return openPeriods?.quarters?.some(
      (q) => q.quarter === Number(quarter.replace("Q", "")) && q.is_open
    );
  };

  const isMonthOpen = () => {
    if (!selectedQuarter) return false;
    return isQuarterOpen(selectedQuarter);
  };

  // Returns { monthOpen: bool, quarterOpen: bool } for the selected KPI
  // const getKpiPeriodStatus = () => {
  //   if (!selectedKpi || !openPeriods?.length) {
  //     return { monthOpen: false, quarterOpen: false };
  //   }

  //   const kpiPeriod = openPeriods.find((p) => p.kpi_id === Number(selectedKpi));
  //   if (!kpiPeriod) {
  //     return { monthOpen: false, quarterOpen: false };
  //   }

  //   // Calculate month number (1 = January, 12 = December)
  //   const monthIndex =
  //     getMonthsForQuarter(selectedQuarter).indexOf(selectedMonth);
  //   if (monthIndex === -1) return { monthOpen: false, quarterOpen: false };

  //   const quarterOffset =
  //     {
  //       Q1: 0,
  //       Q2: 3,
  //       Q3: 6,
  //       Q4: 9,
  //     }[selectedQuarter] || 0;

  //   const monthNum = quarterOffset + monthIndex + 1;

  //   const monthObj = kpiPeriod.months.find((m) => m.month === monthNum);
  //   const quarterObj = kpiPeriod.quarters.find(
  //     (q) => q.quarter === Number(selectedQuarter.slice(1))
  //   );

  //   return {
  //     monthOpen: monthObj?.is_open ?? false,
  //     quarterOpen: quarterObj?.is_open ?? false,
  //   };
  // };

  // const { monthOpen, quarterOpen } = getKpiPeriodStatus();

  // Get pillars for stakeholders from pillar slice
  const { list: pillarsList } = useSelector((state) => state.pillars || {});
  
  const departmentKpis = isStakeholderUser
    ? pillarsList || []
    : list || [];
  const entryKpiOption = kpiEntryTarget?.kpiId && kpiEntryTarget?.kpiName
    ? { id: kpiEntryTarget.kpiId, name: kpiEntryTarget.kpiName }
    : null;
  const selectableKpis = entryKpiOption && !departmentKpis.some(
    (kpi) => String(kpi.id) === String(entryKpiOption.id)
  )
    ? [entryKpiOption, ...departmentKpis]
    : departmentKpis;

  // Get selected KPI details
  const selectedKpiDetails = selectableKpis.find(
    (kpi) => (kpi.id?.toString() || "") === selectedKpi
  );

  const selectedKpiIsPercentage = isPercentageUnit(selectedKpiDetails?.unit);

  // Calculate quarter overview stats
  const getQuarterStats = () => {
    return ["Q1", "Q2", "Q3", "Q4"].map((q) => {
      const quarterSubmissions = submissions.filter((s) =>
        s?.quarter === q && (!selectedKpi || (s?.kpiId?.toString() || "") === selectedKpi)
      );
      const approved = quarterSubmissions.filter(
        (s) => s.status === "approved"
      ).length;
      const pending = quarterSubmissions.filter(
        (s) => s.status === "pending"
      ).length;
      return {
        quarter: q,
        total: quarterSubmissions.length,
        approved,
        pending,
      };
    });
  };

  // Calculate quarterly aggregation data
  const getQuarterlyAggregation = () => {
    if (!selectedKpi || !selectedQuarter) return [];

    const months = getMonthsForQuarter(selectedQuarter);
    return months.map((month) => {
      // Find the specific KPI record from values/stakeholderValues
      const kpiRecord = (isStakeholderUser ? stakeholderValues : values)?.find(
        (val) => {
          const kpiId = val.kpi?.id || val.kpi_id || val.stakeholder_activity?.id || val.stakeholder_activity_id;
          return kpiId?.toString() === selectedKpi;
        }
      );

      if (!kpiRecord) return { month, value: 0 };

      // Get month index (0-11)
      const monthsOfYear = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const monthIndex = monthsOfYear.indexOf(month);

      const monthValueKeys = [
        "jan_value", "feb_value", "mar_value", "apr_value", "may_value", "jun_value",
        "jul_value", "aug_value", "sep_value", "oct_value", "nov_value", "dec_value"
      ];

      const monthValue = parseFloat(kpiRecord[monthValueKeys[monthIndex]] || 0);

      return {
        month,
        value: monthValue,
      };
    });
  };

  // Handle quarter selection change
  const handleQuarterChange = (quarter) => {
    setSelectedQuarter(quarter);
    setSelectedMonth(""); // Reset month when quarter changes
    // Clear existing evidence when quarter changes
    setExistingEvidence(null);
    setKpiValue("");
    setRemarks("");
    setEvidenceFile(null);
  };

  // Find a previously submitted entry for the current month/kpi/year/quarter selections
  const existingSubmission = (selectedKpi && selectedQuarter && selectedMonth && selectedYear)
    ? submissions.find(s =>
      s.kpiId?.toString() === selectedKpi &&
      s.quarter === selectedQuarter &&
      s.monthName === selectedMonth &&
      s.year?.toString() === selectedYear
    ) || null
    : null;

  // Auto-populate form when an existing submission is found for the selected period
  useEffect(() => {
    if (existingSubmission) {
      setKpiValue(formatNumberWithCommas(existingSubmission.value));
      setRemarks(existingSubmission.remarks === "No remarks" ? "" : (existingSubmission.remarks || ""));
      setEvidenceFile(null); // clear new file selection
      if (existingSubmission.evidence && existingSubmission.evidenceUrl) {
        setExistingEvidence({
          name: existingSubmission.evidence,
          url: existingSubmission.evidenceUrl,
          kpiValueId: existingSubmission.kpiValueId,
          status: existingSubmission.status,
        });
      } else {
        setExistingEvidence(null);
      }
    } else {
      // Clear form when switching to an unsubmitted month
      setKpiValue("");
      setRemarks("");
      setEvidenceFile(null);
      setExistingEvidence(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKpi, selectedQuarter, selectedMonth, selectedYear]);

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEvidenceFile(file);
    }
  };

  // Handle file drop
  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setEvidenceFile(file);
    }
  };

  // Handle save draft
  const handleSaveDraft = () => {
    toast({
      title: "Draft saved",
      description: "Your KPI entry has been saved as draft.",
    });
  };

  // Handle submit KPI
  const handleSubmitKpi = async () => {
    if (!selectedKpi || !kpiValue || !selectedYear || !selectedQuarter || !selectedMonth) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const normalizedKpiValue = normalizeNumericInput(kpiValue);
    if (!normalizedKpiValue || !Number.isFinite(Number(normalizedKpiValue))) {
      toast({
        title: "Invalid value",
        description: "Enter a valid numeric value. Percentage KPIs may be entered as, for example, 50 or 50%.",
        variant: "destructive",
      });
      return;
    }

    // For new submissions, require an evidence file only when quarter target > 0
    if (!existingSubmission && !evidenceFile && quarterTarget > 0) {
      toast({
        title: "Evidence file required",
        description: "Please upload an evidence file before submitting.",
        variant: "destructive",
      });
      return;
    }

    // Calculate month number and reporting_period
    const monthIndex = getMonthsForQuarter(selectedQuarter).indexOf(selectedMonth);
    const quarterMonthNumber =
      (selectedQuarter === "Q1" ? 0 : selectedQuarter === "Q2" ? 3 : selectedQuarter === "Q3" ? 6 : 9) +
      monthIndex + 1;
    const lastDayOfMonth = new Date(selectedYear, quarterMonthNumber, 0).getDate();
    const reportingPeriod = `${selectedYear}-${String(quarterMonthNumber).padStart(2, "0")}-${lastDayOfMonth}`;

    try {
      setIsSubmitting(true);
      const formData = new FormData();

      // --- CREATE new submission ---
      if (isStakeholderUser) {
        // Stakeholders now submit with pillar_id instead of stakeholder_activity_id
        formData.append("pillar_id", selectedKpi);
        formData.append("department_id", userDepartment);
        formData.append("month", selectedMonth.toLowerCase());
        formData.append("value", normalizedKpiValue);
        formData.append("reporting_period", reportingPeriod);
        formData.append("year", selectedYear);
        if (remarks) formData.append("remarks", remarks);
        if (evidenceFile) formData.append("evidence", evidenceFile);

        await dispatch(createStakeholderActivityValueUploadMonth(formData)).unwrap();
      } else {
        formData.append("kpi_id", selectedKpi);
        formData.append("month", selectedMonth.toLowerCase());
        formData.append("value", normalizedKpiValue);
        formData.append("reporting_period", reportingPeriod);
        formData.append("year", selectedYear);
        formData.append("remarks", remarks || "");
        if (evidenceFile) formData.append("evidence", evidenceFile);

        await dispatch(createKpiValueUploadMonth(formData)).unwrap();
      }

      toast({
        title: `${getKpiLabel(user)} submitted successfully!`,
        description: `Your ${getKpiLabel(user).toLowerCase()} value has been submitted for review.`,
      });

      // Reset form
      setSelectedKpi("");
      setKpiValue("");
      setRemarks("");
      setEvidenceFile(null);
      setExistingEvidence(null);

      // Refresh submissions
      if (userDepartment) {
        const refreshParams = { department_id: userDepartment };
        if (filterYear) refreshParams.year = filterYear;
        if (filterQuarter !== "all") refreshParams.quarter = filterQuarter;
        if (isStakeholderUser) {
          dispatch(fetchStakeholderActivityValues(refreshParams));
        } else {
          dispatch(fetchKpiValues(refreshParams));
        }
      }
    } catch (err) {
      toast({
        title: "Error",
        description: getErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Edit Click
  const handleEditClick = async (submission) => {
    if (!isStakeholderUser && submission.kpi_value_id) {
      // Non-stakeholder: fetch full detail via kpi_value_id param
      setEditLoadingDetail(true);
      setShowEditModal(true);
      setEditSubmission(null);
      try {
        const res = await getKpiMonthStatusesApi({
          kpi_value_id: submission.kpi_value_id,
          year: filterYear,
          per_page: 15,
        });
        const items = res?.data || [];
        // Find the specific month item
        const item = items.find(i => i.month === submission.month) || items[0];
        if (item) {
          setEditSubmission({
            ...item,
            // normalise fields the modal expects
            kpi: item.kpi_name,
            quarter: submission.quarter || (item.month <= 3 ? "Q1" : item.month <= 6 ? "Q2" : item.month <= 9 ? "Q3" : "Q4"),
            month: item.month_name,
            monthNumber: item.month,
            year: filterYear,
            kpiValueId: item.kpi_value_id,
            evidence: item.evidence_path ? item.evidence_path.split('/').pop() : null,
            evidenceUrl: item.evidence_url || null,
            remarks: item.evidences?.[0]?.remarks || item.comment || "",
          });
          setEditValue(formatNumberWithCommas(item.value));
          setEditRemarks(item.evidences?.[0]?.remarks || item.comment || "");
        }
      } catch {
        toast({ title: "Error", description: "Failed to load KPI details", variant: "destructive" });
        setShowEditModal(false);
      } finally {
        setEditLoadingDetail(false);
      }
      return;
    }

    // Stakeholder path (unchanged)
    setEditSubmission(submission);
    setEditValue(formatNumberWithCommas(submission.value));
    setEditRemarks(submission.remarks === "No remarks" ? "" : submission.remarks);
    setEditEvidenceFile(null);
    setShowEditModal(true);
  };

  // Handle Update KPI
  const handleUpdateKpi = async () => {
    if (!editSubmission || !editValue) {
      toast({
        title: "Missing fields",
        description: "Value is required.",
        variant: "destructive",
      });
      return;
    }

    // Evidence is only required if there is no existing evidence on the submission
    if (!editEvidenceFile && !editSubmission.evidence) {
      toast({
        title: "Evidence file required",
        description: "Please upload an evidence file for this submission.",
        variant: "destructive",
      });
      return;
    }

    const normalizedEditValue = normalizeNumericInput(editValue);
    if (!normalizedEditValue || !Number.isFinite(Number(normalizedEditValue))) {
      toast({
        title: "Invalid value",
        description: "Enter a valid numeric value.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUpdating(true);
      const formData = new FormData();

      if (isStakeholderUser) {
        // Stakeholder: use stakeholder-activity-values/{id}/upload-month endpoint (POST)
        // Now using pillar_id instead of stakeholder_activity_id
        formData.append("pillar_id", editSubmission.kpiId);
        formData.append("month", editSubmission.monthName.toLowerCase());
        formData.append("reporting_period", editSubmission.reportingPeriod);
        formData.append("value", normalizedEditValue);
        formData.append("year", editSubmission.year);
        if (editRemarks) formData.append("remarks", editRemarks);
        if (editEvidenceFile) formData.append("evidence", editEvidenceFile);

        await dispatch(
          updateStakeholderActivityValue({ id: editSubmission.kpiValueId, data: formData })
        ).unwrap();
      } else {
        // Non-stakeholder: POST /kpi-values/{kpi_value_id}/upload-month-simple
        // Only send month, value, remarks, evidence — kpi_value_id goes in the URL
        formData.append("month", editSubmission.monthNumber ?? editSubmission.month);
        formData.append("value", normalizedEditValue);
        if (editRemarks) formData.append("remarks", editRemarks);
        if (editEvidenceFile) {
          // User selected a new file — send it
          formData.append("evidence", editEvidenceFile);
        } else if (editSubmission.evidenceUrl) {
          // No new file selected — pass the existing evidence URL so the server retains it
          formData.append("existing_evidence_url", editSubmission.evidenceUrl);
        }

        await updateKpiValueDirectApi(editSubmission.kpiValueId, formData);
      }

      toast({
        title: "Updated successfully",
        description: "Submission has been updated.",
      });

      setShowEditModal(false);
      setEditSubmission(null);
      setEditValue("");
      setEditRemarks("");
      setEditEvidenceFile(null);

      // Refresh submissions
      if (userDepartment) {
        const refreshParams = { department_id: userDepartment };
        if (filterYear) refreshParams.year = filterYear;
        if (filterQuarter !== "all") refreshParams.quarter = filterQuarter;
        if (isStakeholderUser) {
          dispatch(fetchStakeholderActivityValues(refreshParams));
        } else {
          dispatch(fetchKpiValues(refreshParams));
        }
      }
    } catch (err) {
      toast({
        title: "Update failed",
        description: err?.response?.data?.message || err?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle view submission details
  const handleViewDetails = (submission) => {
    setSelectedSubmission(submission);
    setShowDetailsModal(true);
  };

  // Filter submissions based on filters
  const filteredSubmissions = submissions.filter((sub) => {
    if (filterQuarter !== "all" && sub.quarter !== filterQuarter) return false;
    if (filterStatus !== "all" && sub.status !== filterStatus) return false;
    return true;
  }).sort((a, b) => new Date(b.sortCreatedAt) - new Date(a.sortCreatedAt));

  // Paginate filtered submissions
  const totalSubmissionsPages = Math.ceil(filteredSubmissions.length / SUBMISSIONS_PER_PAGE);
  const paginatedSubmissions = filteredSubmissions.slice(
    (submissionsPage - 1) * SUBMISSIONS_PER_PAGE,
    submissionsPage * SUBMISSIONS_PER_PAGE
  );

  const quarterStats = getQuarterStats();
  const quarterlyData = getQuarterlyAggregation();
  const totalSubmitted = quarterlyData.reduce(
    (acc, curr) => acc + curr.value,
    0
  );

  // Determine quarterly target dynamically
  const getQuarterTarget = () => {
    if (!selectedKpiDetails || !selectedQuarter) return 0;
    switch (selectedQuarter) {
      case "Q1":
        return selectedKpiDetails.target_q1 || selectedKpiDetails.target || 0;
      case "Q2":
        return selectedKpiDetails.target_q2 || selectedKpiDetails.target || 0;
      case "Q3":
        return selectedKpiDetails.target_q3 || selectedKpiDetails.target || 0;
      case "Q4":
        return selectedKpiDetails.target_q4 || selectedKpiDetails.target || 0;
      default:
        return selectedKpiDetails.target || 0;
    }
  };

  const quarterTarget = getQuarterTarget();
  const progressPercentage = quarterTarget > 0
    ? ((totalSubmitted / quarterTarget) * 100).toFixed(1)
    : "0.0";

  // Calculate completion status
  const monthsInQuarter = getMonthsForQuarter(selectedQuarter);
  const submittedMonthsForKpi = submissions.filter(s =>
    s.kpiId?.toString() === selectedKpi &&
    s.quarter === selectedQuarter &&
    monthsInQuarter.includes(s.monthName)
  );
  const uniqueMonthsCount = new Set(submittedMonthsForKpi.map(s => s.monthName)).size;
  const isQuarterComplete = uniqueMonthsCount >= 3;

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(isStakeholderUser ? "/dashboard/activity-data" : "/dashboard/kpi-data")}
          className="p-0 text-muted-foreground hover:text-primary hover:bg-transparent flex items-center gap-2 group"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          {isStakeholderUser ? "Go Back to Activity Data" : "Go Back to KPI Data"}
        </Button>
      </div>
      {/* Header */}
      <div id="kpi-creation-header">
        <h1 className="text-3xl font-bold">
          {getKpiLabel(user)} Entry and Monitoring
        </h1>
        <p className="text-muted-foreground mt-2">
          Validate and monitor the quality of{" "}
          {getKpiLabelPlural(user).toLowerCase()} for the Performance Management System Dashboard
        </p>
      </div>

      {/* Top Section: Inputs & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Inputs */}
        <div className="space-y-6">
          {/* KPI Selection Card - NOW FIRST */}
          <Card id="card-select-kpi">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Select {getKpiLabel(user)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Year Selection - Narrower (1/3 of space) */}
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="year" className="text-sm font-semibold text-slate-700">Reporting Year</Label>
                  <p className={"text-xs text-muted-foreground"}>Inherited from SRAP 2.0 Management.</p>
                  <Select
                    value={selectedYear}
                    onValueChange={(val) => setSelectedYear(val)}
                  >
                    <SelectTrigger className="w-full h-12 text-lg font-medium border-emerald-100 bg-emerald-50/30  transition-all">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearsList?.map((yr) => (
                        <SelectItem key={yr.id} value={yr.year?.toString() || ""}>
                          {yr.year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* KPI Selection - Wider (2/3 of space) */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="kpi" className="text-sm font-semibold text-slate-700">{getKpiLabel(user)} *</Label>
                  <Select
                    value={selectedKpi}
                    onValueChange={(val) => setSelectedKpi(val)}
                  >
                    <SelectTrigger className="w-full h-12 text-base font-medium whitespace-normal text-left break-words py-2 border-emerald-100 bg-emerald-50/30  transition-all">
                      <SelectValue
                        className="whitespace-normal"
                        placeholder={
                          getKpiLabel(user).toLowerCase().startsWith('a')
                            ? `Choose an ${getKpiLabel(user).toLowerCase()}`
                            : `Choose a ${getKpiLabel(user).toLowerCase()}`
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {loading || stakeholderActivityState?.loading ? (
                        <div className="flex items-center justify-center p-6 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Loading {getKpiLabelPlural(user).toLowerCase()}...
                        </div>
                      ) : selectableKpis.length === 0 ? (
                        <div className="p-6 text-center">
                          <p className="text-sm font-medium text-red-500 italic">
                            No approved {getKpiLabelPlural(user).toLowerCase()} found for {selectedYear}.
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Please contact your administrator if this is unexpected.
                          </p>
                        </div>
                      ) : (
                        selectableKpis.map((kpi) => (
                          <SelectItem key={kpi.id} value={kpi.id?.toString() || ""} className="whitespace-normal break-words h-auto py-2">
                            {kpi.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Period Selection Card - AFTER KPI */}
          {selectedKpi && (
            <Card id="card-period-selection">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  Period Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Quarter */}
                <div className="space-y-2">
                  <Label htmlFor="quarter">Select Quarter</Label>
                  <Select
                    value={selectedQuarter}
                    onValueChange={(val) => handleQuarterChange(val)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a quarter" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Q1", "Q2", "Q3", "Q4"].map((q) => {
                        const isOpen = isQuarterOpen(q);

                        return (
                          <SelectItem key={q} value={q} disabled={!isOpen}>
                            {q} {!isOpen && "(closed)"}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>

                  {selectedKpi && selectedQuarter && !isQuarterOpen && (
                    <Badge variant="secondary" className="mt-1">
                      This quarter is closed for the selected KPI
                    </Badge>
                  )}
                </div>

                {/* Month */}
                <div className="space-y-2">
                  <Label htmlFor="month">Select Month</Label>
                  <Select
                    value={selectedMonth}
                    onValueChange={(val) => setSelectedMonth(val)}
                    disabled={!selectedQuarter || !isMonthOpen()}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a month" />
                    </SelectTrigger>
                    <SelectContent>
                      {getMonthsForQuarter(selectedQuarter).map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedQuarter && !isMonthOpen() && (
                    <Badge variant="secondary">
                      This quarter is closed — months unavailable
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* KPI Data Entry - ONLY AFTER PERIOD */}
          {selectedKpi && selectedQuarter && selectedMonth && (
            <Card id="card-kpi-entry">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  {getKpiLabel(user)} Data Entry
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Existing submission notice */}
                {existingSubmission && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 flex items-start gap-2 mb-4">
                    <FileText className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                    <div className="text-sm text-yellow-800">
                      <span className="font-semibold">Previously submitted.</span>{" "}
                      Data has been pre-filled from your {selectedMonth} {selectedYear} submission. To make changes, please use the <strong>Edit</strong> button in the history table below.
                    </div>
                  </div>
                )}

                {/* Quarter Target */}
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <p className="text-sm text-green-800">
                    <span className="font-semibold">Quarter Target:</span>{" "}
                    {parseFloat(quarterTarget).toLocaleString()}
                  </p>
                </div>

                {/* Value */}
                <div className="space-y-2">
                  <Label htmlFor="value">Value{selectedKpiIsPercentage ? " (%)" : ""} *</Label>
                  <Input
                    id="value"
                    type="text"
                    inputMode="decimal"
                    placeholder={selectedKpiIsPercentage ? "Enter percentage (e.g. 50%)" : "Enter value (e.g. 1,000)"}
                    value={kpiValue}
                    onChange={(e) => setKpiValue(formatNumericInput(e.target.value))}
                    disabled={!!existingSubmission}
                  />
                </div>

                {/* Remarks */}
                <div className="space-y-2">
                  <Label htmlFor="remarks">Remarks *</Label>
                  <Textarea
                    id="remarks"
                    placeholder="Enter any relevant remarks or comments..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={4}
                    disabled={!!existingSubmission}
                  />
                </div>

                {/* Evidence Upload */}
                <div className="space-y-2">
                  <Label>
                    Evidence Upload
                    {quarterTarget > 0
                      ? <span className="text-red-500 ml-1">*</span>
                      : <span className="text-xs text-muted-foreground ml-1">(optional — target is 0)</span>
                    }
                  </Label>

                  {/* Show existing evidence when a prior submission is found */}
                  {existingEvidence && !evidenceFile && (
                    <div className="border-2 border-amber-200 rounded-lg p-4 bg-amber-50">
                      <p className="text-xs font-semibold text-amber-800 mb-2">Current Evidence File</p>
                      <div className="flex items-center gap-3">
                        <div className="bg-white rounded-lg p-2 shrink-0">
                          <FileText className="h-8 w-8 text-amber-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-900 truncate flex-1" title={existingEvidence.name}>
                          {existingEvidence.name}
                        </p>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <TooltipProvider>
                          <UITooltip>
                            <TooltipTrigger asChild>
                              <span>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  disabled={!isPreviewableFile(existingEvidence.name)}
                                  onClick={() => {
                                    if (isPreviewableFile(existingEvidence.name)) {
                                      handleViewFile(getAbsoluteFileUrl(existingEvidence.url), existingEvidence.name);
                                    }
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-1.5" />
                                  View
                                </Button>
                              </span>
                            </TooltipTrigger>
                            {!isPreviewableFile(existingEvidence.name) && (
                              <TooltipContent className="max-w-xs">
                                <p className="text-xs">Preview not available for this file type. Please download to view.</p>
                              </TooltipContent>
                            )}
                          </UITooltip>
                        </TooltipProvider>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => forceDownload(getAbsoluteFileUrl(existingEvidence.url), existingEvidence.name)}
                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                        >
                          <Download className="h-4 w-4 mr-1.5" />
                          Download
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="ml-auto text-amber-600 border-amber-300 hover:bg-amber-100"
                          onClick={() => document.getElementById("file-upload").click()}
                        >
                          <Upload className="h-4 w-4 mr-1.5" />
                          Replace
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* New file selected confirmation */}
                  {evidenceFile ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-green-600 shrink-0" />
                      <p className="text-sm font-medium text-green-800 truncate flex-1" title={evidenceFile.name}>
                        {evidenceFile.name}
                      </p>
                      <button
                        type="button"
                        onClick={() => setEvidenceFile(null)}
                        className="text-xs text-gray-500 hover:text-red-500 shrink-0"
                      >
                        <XIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (!existingEvidence && !existingSubmission) && (
                    <div
                      className="border-2 border-dashed rounded-md p-8 text-center hover:border-green-500 transition-colors cursor-pointer"
                      onDrop={handleFileDrop}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => document.getElementById("file-upload").click()}
                    >
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF, images, or Excel files</p>
                    </div>
                  )}

                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".pdf,.png,.jpg,.jpeg,.xls,.xlsx,.doc,.docx"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleSaveDraft}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </Button>
                  <Button
                    onClick={handleSubmitKpi}
                    disabled={
                      loading ||
                      stakeholderActivityState?.loading ||
                      isSubmitting ||
                      !!existingSubmission ||
                      (quarterTarget > 0 && !existingEvidence && !evidenceFile) ||
                      !selectedKpi ||
                      !selectedQuarter ||
                      !selectedMonth ||
                      !isMonthOpen()
                    }
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {(loading || stakeholderActivityState?.loading || isSubmitting) ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {existingSubmission ? "Updating..." : "Submitting..."}
                      </>
                    ) : (
                      `Submit ${getKpiLabel(user)}`
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Insights */}
        <div className="space-y-6">
          {/* Quarter Overview */}
          <Card id="card-quarter-overview">
            <CardHeader>
              <CardTitle>Quarter Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {quarterStats.map((stat) => (
                  <div
                    key={stat.quarter}
                    className="border rounded-lg p-4 text-center"
                  >
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      {stat.quarter}
                    </div>
                    <div className="text-3xl font-bold mb-2">{stat.total}</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-center gap-1 text-green-600">
                        <span className="inline-block w-2 h-2 bg-green-600 rounded-full" />
                        {stat.approved} approved
                      </div>
                      {stat.pending > 0 && (
                        <div className="flex items-center justify-center gap-1 text-yellow-600">
                          <span className="inline-block w-2 h-2 bg-yellow-600 rounded-full" />
                          {stat.pending} pending
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quarterly Aggregation */}
          {selectedQuarter && quarterlyData.length > 0 && (
            <Card id="card-quarterly-aggregation">
              <CardHeader>
                <CardTitle>
                  Quarterly Aggregation - {selectedQuarter} {selectedYear}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Quarterly Progress
                    </span>
                    <span className="font-semibold">
                      {totalSubmitted} / {quarterTarget} ({progressPercentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    />
                  </div>
                  <p className={`text-sm ${isQuarterComplete ? 'text-green-600' : 'text-orange-600'}`}>
                    {uniqueMonthsCount} of 3
                    months submitted{" "}
                    <span className="font-semibold">
                      ({isQuarterComplete ? "Complete Quarter" : "Incomplete Quarter"})
                    </span>
                  </p>
                </div>
                <div className="w-full h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={quarterlyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" hide={window.innerWidth < 640} />
                      <YAxis
                        domain={[0, (dataMax) => Math.max(dataMax, quarterTarget)]}
                        tickCount={5}
                        width={60}
                        tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                        fontSize={12}
                        tick={{ fill: '#64748b' }}
                      />
                      <Tooltip
                        formatter={(value) => [new Intl.NumberFormat('en-US').format(value), 'Value']}
                        cursor={{ fill: 'transparent' }}
                      />
                      <Bar dataKey="value" fill="#008000" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Bottom Section: Submissions Table */}
      <div className="space-y-6">
        {/* My KPI Submissions Card */}
        <Card id="card-submissions-history">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-green-600" />
              {isStakeholderUser ? "My Activity Submissions" : "My KPI Submissions"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filter-year">Filter Year</Label>
                <Select
                  value={filterYear}
                  onValueChange={(val) => { setFilterYear(val); setSubmissionsPage(1); }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearsList?.map((yr) => (
                      <SelectItem key={yr.id} value={yr.year.toString()}>
                        {yr.year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter-quarter">Filter Quarter</Label>
                <Select
                  value={filterQuarter}
                  onValueChange={(val) => { setFilterQuarter(val); setSubmissionsPage(1); }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Quarters" />
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
              <div className="space-y-2">
                <Label htmlFor="filter-status">Filter Status</Label>
                <Select
                  value={filterStatus}
                  onValueChange={(val) => { setFilterStatus(val); setSubmissionsPage(1); }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    {isStakeholderUser ? (
                      <SelectItem value="pending">Pending</SelectItem>
                    ) : null}
                    <SelectItem value="disapproved">Disapproved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Combined Submissions Table */}
            <div className="border rounded-md overflow-x-auto w-full" id="kpi-data-table">
              <table className="w-full min-w-[800px]">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium">Quarter</th>
                    <th className="text-left p-3 text-sm font-medium">Month</th>
                    <th className="text-left p-3 text-sm font-medium">{isStakeholderUser ? "Activity" : "KPI"}</th>
                    <th className="text-left p-3 text-sm font-medium">Value</th>
                    <th className="text-left p-3 text-sm font-medium">Status</th>
                    <th className="text-left p-3 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isStakeholderUser ? (
                    filteredSubmissions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center p-6 text-muted-foreground">
                          No submissions found
                        </td>
                      </tr>
                    ) : (
                      paginatedSubmissions.map((sub) => (
                        <tr key={sub.id} className="border-t hover:bg-muted/50">
                          <td className="p-3 text-sm">{sub.quarter}</td>
                          <td className="p-3 text-sm">{sub.month}</td>
                          <td className="p-3 text-sm">{sub.kpi}</td>
                          <td className="p-3 text-sm font-medium">{formatNumberWithCommas(sub.value)}</td>
                          <td className="p-3 text-sm">
                            <Badge
                              variant={sub.status === "approved" ? "default" : "secondary"}
                              className={
                                sub.status === "approved"
                                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                                  : sub.status === "disapproved"
                                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                                  : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                              }
                            >
                              {sub.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm">
                            <div className="flex items-center gap-3">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewDetails(sub)}
                                className="h-8 px-3 text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all"
                              >
                                <Eye className="h-3.5 w-3.5 mr-1.5" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={sub.status === "approved"}
                                onClick={() => handleEditClick(sub)}
                                className="h-8 px-3 text-[#155535] border-[#155535]/30 bg-[#155535]/5 hover:bg-[#155535] hover:text-white disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 shadow-sm transition-all"
                              >
                                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                                Edit
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )
                  ) : monthStatusesLoading ? (
                    <tr>
                      <td colSpan={6} className="text-center p-6">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
                      </td>
                    </tr>
                  ) : monthStatuses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-6 text-muted-foreground">
                        No submissions found
                      </td>
                    </tr>
                  ) : (
                    monthStatuses
                      // When "all" is selected, exclude submitted items — they
                      // belong in the KPI review queue, not the submissions history
                      .filter((item) => filterStatus !== "all" || item.status !== "not_submitted")
                      .map((item) => {
                      const quarter = item.month <= 3 ? "Q1" : item.month <= 6 ? "Q2" : item.month <= 9 ? "Q3" : "Q4";
                      return (
                        <tr key={`${item.kpi_value_id}-${item.month}`} className="border-t hover:bg-muted/50">
                          <td className="p-3 text-sm">{quarter}</td>
                          <td className="p-3 text-sm">{item.month_name}</td>
                          <td className="p-3 text-sm">{item.kpi_name}</td>
                          <td className="p-3 text-sm font-medium">{formatNumberWithCommas(item.value)}</td>
                          <td className="p-3 text-sm">
                            <Badge
                              variant={item.status === "approved" ? "default" : "secondary"}
                              className={
                                item.status === "approved"
                                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                                  : item.status === "disapproved"
                                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                                  : item.status === "not_submitted"
                                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                  : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                              }
                            >
                              {item.status.replace("_", " ")}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm">
                            <div className="flex items-center gap-3">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={!item.has_evidence}
                                onClick={() => item.has_evidence && handleViewFile(item.evidence_url, item.evidence_path?.split('/').pop())}
                                className="h-8 px-3 text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all"
                              >
                                <Eye className="h-3.5 w-3.5 mr-1.5" />
                                View
                              </Button>
                              {item.status === "disapproved" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditClick({ ...item, quarter: item.month <= 3 ? "Q1" : item.month <= 6 ? "Q2" : item.month <= 9 ? "Q3" : "Q4" })}
                                  className="h-8 px-3 text-[#155535] border-[#155535]/30 bg-[#155535]/5 hover:bg-[#155535] hover:text-white shadow-sm transition-all"
                                >
                                  <Pencil className="h-3.5 w-3.5 mr-1.5" />
                                  Edit
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {isStakeholderUser ? (
              totalSubmissionsPages > 1 && (
                <DataPagination
                  currentPage={submissionsPage}
                  totalPages={totalSubmissionsPages}
                  onPageChange={(page) => setSubmissionsPage(page)}
                />
              )
            ) : (
              monthStatusesPagination?.last_page > 1 && (
                <DataPagination
                  currentPage={monthStatusesPagination.current_page || submissionsPage}
                  totalPages={monthStatusesPagination.last_page}
                  onPageChange={(page) => setSubmissionsPage(page)}
                />
              )
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Submission Modal */}
      {showEditModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowEditModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold">Edit Submission</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowEditModal(false)}
                  className="hover:bg-gray-100"
                >
                  <XIcon className="h-5 w-5" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                {editLoadingDetail ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : editSubmission && (
                  <>
                    {/* Disapproval reason banner */}
                    {editSubmission.status === "disapproved" && editSubmission.comment && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-xs font-semibold text-red-700 mb-1">Disapproval Reason</p>
                        <p className="text-sm text-red-800">{editSubmission.comment}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label>{isStakeholderUser ? "Activity Name" : "KPI Name"}</Label>
                        <p className="font-medium">{editSubmission.kpi}</p>
                      </div>
                      <div>
                        <Label>Period</Label>
                        <p className="font-medium">
                          {editSubmission.quarter} {editSubmission.year} -{" "}
                          {editSubmission.month}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-value">Value *</Label>
                      <Input
                        id="edit-value"
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(formatNumericInput(e.target.value))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-remarks">Remarks</Label>
                      <Textarea
                        id="edit-remarks"
                        value={editRemarks}
                        onChange={(e) => setEditRemarks(e.target.value)}
                        rows={4}
                      />
                    </div>

                    {/* Always-present hidden file input for all user types */}
                    <input
                      id="edit-file-upload"
                      type="file"
                      className="hidden"
                      onChange={(e) => setEditEvidenceFile(e.target.files[0] || null)}
                      accept=".pdf,.png,.jpg,.jpeg,.xls,.xlsx,.doc,.docx"
                    />

                    <div className="space-y-2">
                      <Label>Evidence File {editSubmission.evidence ? "(optional — replace if needed)" : "(Required) *"}</Label>
                      {editSubmission.evidence && !editEvidenceFile && (
                        <div className="border-2 border-amber-200 rounded-lg p-6 bg-amber-50 mt-2">
                          <div className="mb-3">
                            <p className="text-sm font-semibold text-amber-800 mb-1">
                              Current Evidence
                            </p>
                            <p className="text-xs text-amber-700">
                              Existing evidence will be kept. You can optionally replace it with a new file.
                            </p>
                          </div>
                          <div className="flex items-center gap-4 mb-3">
                            <div className="bg-white p-4 rounded-lg">
                              <svg
                                className="h-10 w-10 text-amber-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-500 mb-0.5">Existing Evidence:</p>
                              <p className="font-medium text-gray-900 truncate" title={editSubmission.evidence}>
                                {editSubmission.evidence}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <TooltipProvider>
                              <UITooltip>
                                <TooltipTrigger asChild>
                                  <span>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      disabled={!isPreviewableFile(editSubmission.evidence)}
                                      onClick={() => {
                                        if (isPreviewableFile(editSubmission.evidence)) {
                                          handleViewFile(
                                            getAbsoluteFileUrl(editSubmission.evidenceUrl),
                                            editSubmission.evidence
                                          );
                                        }
                                      }}
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Document
                                    </Button>
                                  </span>
                                </TooltipTrigger>
                                {!isPreviewableFile(editSubmission.evidence) && (
                                  <TooltipContent className="max-w-xs">
                                    <p className="text-xs">
                                      <span className="font-semibold">Preview not available for {editSubmission.evidence?.split(".").pop()?.toUpperCase()} files.</span>{" "}
                                      In-app preview supports PDF, PNG, JPG, and JPEG only. Please download to view this file.
                                    </p>
                                  </TooltipContent>
                                )}
                              </UITooltip>
                            </TooltipProvider>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => forceDownload(getAbsoluteFileUrl(editSubmission.evidenceUrl), editSubmission.evidence)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-300"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="ml-auto text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-300"
                              onClick={() => document.getElementById("edit-file-upload").click()}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Replace Evidence
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* New file selected confirmation */}
                    {editEvidenceFile ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 max-w-full overflow-hidden">
                        <FileText className="h-4 w-4 text-green-600 shrink-0" />
                        <p className="text-sm font-medium text-green-800 truncate" title={editEvidenceFile.name}>
                          New file selected: {editEvidenceFile.name}
                        </p>
                      </div>
                    ) : !editSubmission.evidence && (
                      <div className="mt-2">
                        <p className="text-sm text-amber-600 italic font-medium">
                          Note: No existing evidence — please upload a file.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 w-full border-dashed border-2 hover:bg-amber-50"
                          onClick={() => document.getElementById("edit-file-upload").click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Select Evidence File
                        </Button>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowEditModal(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleUpdateKpi}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
                        disabled={isUpdating || (!editEvidenceFile && !editSubmission?.evidence)}
                      >
                        {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
                        {isUpdating ? "Updating..." : "Update Submission"}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Submission Details Modal */}
      {
        showDetailsModal && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowDetailsModal(false)}
            />

            {/* Modal Card */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="bg-card rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <h2 className="text-2xl font-bold text-foreground">Submission Details</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowDetailsModal(false)}
                    className="hover:bg-muted"
                  >
                    <XIcon className="h-5 w-5" />
                  </Button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                  {selectedSubmission && (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Period</p>
                          <p className="font-semibold text-lg">
                            {selectedSubmission.quarter} {selectedSubmission.year} -{" "}
                            {selectedSubmission.month}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Status</p>
                          <Badge
                            variant={
                              selectedSubmission.status === "approved"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              selectedSubmission.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : selectedSubmission.status === "disapproved"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                            }
                          >
                            {selectedSubmission.status}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {isStakeholderUser ? "Activity Name" : "KPI Name"}
                        </p>
                        <p className="font-semibold text-foreground">{selectedSubmission.kpi}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-4 bg-muted/50 dark:bg-muted/30 rounded-lg px-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Target</p>
                          <p className="font-bold text-lg text-foreground">
                            {formatNumberWithCommas(selectedSubmission.target)}
                            <span className="text-xs font-normal text-muted-foreground ml-1">
                              {getFormattedUnit(selectedSubmission.unit, selectedSubmission.kpi)}
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Achieved
                          </p>
                          <p className="font-bold text-lg text-green-600 dark:text-green-400">
                            {formatNumberWithCommas(selectedSubmission.achieved)}
                            <span className="text-xs font-normal text-muted-foreground ml-1">
                              {getFormattedUnit(selectedSubmission.unit, selectedSubmission.kpi)}
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Grade</p>
                          <p className="font-bold text-lg text-foreground">
                            {selectedSubmission.grade}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Remarks
                        </p>
                        <div className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap">
                          {selectedSubmission.remarks || "No remarks provided"}
                        </div>
                      </div>

                      <div className="text-sm">
                        <span className="text-muted-foreground">
                          Submitted by{" "}
                        </span>
                        <span className="font-medium">
                          {selectedSubmission.submittedBy}
                        </span>
                        <span className="text-muted-foreground"> on </span>
                        <span>{selectedSubmission.submittedDate}</span>
                      </div>

                      {selectedSubmission.evidence ? (
                        <div className="border border-border rounded-lg p-4 md:p-6 bg-muted/50 dark:bg-muted/30">
                          <p className="text-sm font-medium text-muted-foreground mb-4">
                            Evidence
                          </p>
                          <div className="flex items-center gap-3 md:gap-4 mb-4">
                            <div className="bg-muted p-3 md:p-4 rounded-lg flex-shrink-0">
                              <FileText className="h-6 w-6 md:h-10 md:w-10 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate text-sm md:text-base text-foreground" title={selectedSubmission.evidence}>
                                {selectedSubmission.evidence}
                              </p>
                              <p className="text-xs md:text-sm text-muted-foreground">
                                {selectedSubmission.evidenceSize}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-row sm:flex-row gap-2.5 mb-6">
                            <Button
                              variant="outline"
                              disabled={false}
                              title={!isPreviewableFile(selectedSubmission.evidence) ? "Preview not supported for this file type. Please download to view." : "View fullscreen"}
                              onClick={() => {
                                if (isPreviewableFile(selectedSubmission.evidence)) {
                                  handleViewFile(
                                    getAbsoluteFileUrl(selectedSubmission.evidenceUrl),
                                    selectedSubmission.evidence
                                  );
                                } else {
                                  toast({
                                    title: "Preview not supported",
                                    description: "This document format is not supported for in-app preview. Please download it.",
                                    variant: "warning"
                                  });
                                }
                              }}
                              className={`flex-1 h-12 rounded-xl text-[13px] font-bold border-2 active:scale-95 transition-all ${!isPreviewableFile(selectedSubmission.evidence) ? "bg-muted text-muted-foreground cursor-not-allowed opacity-60" : ""}`}
                            >
                              <Eye className="h-4 w-4 mr-2 text-teal-600" />
                              View Fullscreen
                            </Button>
                            <Button
                              onClick={() => forceDownload(getAbsoluteFileUrl(selectedSubmission.evidenceUrl), selectedSubmission.evidence)}
                              className="flex-1 h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white text-[13px] font-bold active:scale-95 transition-all shadow-lg shadow-green-900/10"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>

                        </div>
                      ) : (
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-lg p-4 flex items-center gap-3 text-amber-800 dark:text-amber-400">
                          <FileText className="h-5 w-5 opacity-70" />
                          <p className="text-sm font-medium">No evidence file was uploaded for this submission.</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        )
      }
      {/* <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl z-[1000]" 
        aria-describedby="submission-details-description"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Submission Details</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDetailsModal(false)}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Period</p>
                  <p className="font-medium">
                    {selectedSubmission.quarter} {selectedYear} -{" "}
                    {selectedSubmission.month}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge
                    variant={
                      selectedSubmission.status === "approved"
                        ? "default"
                        : "secondary"
                    }
                    className={
                      selectedSubmission.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }
                  >
                    {selectedSubmission.status}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">KPI Name</p>
                <p className="font-medium">{selectedSubmission.kpi}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Target</p>
                  <p className="font-medium">{formatNumberWithCommas(selectedSubmission.target)}</p>
                </div>
                  <p className="font-medium">
                    {formatNumberWithCommas(selectedSubmission.achieved)}
                    {selectedSubmission.unit === 'percentage_of' ? '%' : ''}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Grade</p>
                  <p className="font-medium">{selectedSubmission.grade}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Remarks/Comments
                </p>
                <div className="bg-muted p-3 rounded-md text-sm">
                  {selectedSubmission.remarks}
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Submitted by
                </p>
                <p className="text-sm">
                  {selectedSubmission.submittedBy} on{" "}
                  {selectedSubmission.submittedDate}
                </p>
              </div>

              {selectedSubmission.evidence && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Evidence</p>
                  <div className="border rounded-lg p-4 flex items-center gap-4">
                    <div className="bg-muted p-3 rounded">
                      <svg
                        className="h-8 w-8 text-muted-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {selectedSubmission.evidence}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedSubmission.evidenceSize}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() =>
                        window.open(selectedSubmission.evidenceUrl, "_blank")
                      }
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Document
                    </Button>
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = selectedSubmission.evidenceUrl;
                        link.download = selectedSubmission.evidence;
                        link.click();
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog> */}
      {/* Document Viewer Modal */}
      <DocumentViewer
        isOpen={docViewer.isOpen}
        fileUrl={docViewer.fileUrl}
        filename={docViewer.filename}
        onClose={() => setDocViewer(prev => ({ ...prev, isOpen: false }))}
      />
    </div >
  );
};

export default SrapKpiCreation;
