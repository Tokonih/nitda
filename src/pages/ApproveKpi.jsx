import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, FileText, CheckCircle, XCircle, List, Download, Eye, Calendar, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getKpiMonthStatusesApi, approveKpiValueApi, rejectKpiValueApi, bulkApproveKpiMonthsApi } from '../Slices/Utils/Api/kpi';
import { useYears } from "@/hooks/use-years";
import { formatNumberWithCommas, isPreviewableFile, getAbsoluteFileUrl, forceDownload, getErrorMessage } from '@/lib/utils';
import { getDepartmentApi } from '../Slices/Utils/Api/departments';
import DepartmentSelect from '@/components/ui/DepartmentSelect';
import { toast } from 'sonner';
import { isAdmin } from '@/lib/roleLabels';
import { DataPagination } from '@/components/ui/data-pagination';
import { useGlobalFilter } from '@/hooks/useGlobalFilter';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ConfirmModal from '@/components/ui/ConfirmModal';
import DocumentViewer from '@/components/DocumentViewer';

const KpiReview = () => {
  const [reviewerNote, setReviewerNote] = useState('');
  const [monthStatuses, setMonthStatuses] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedKpi, setSelectedKpi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => { },
    confirmVariant: "default",
    confirmText: "Confirm"
  });
  const [docViewer, setDocViewer] = useState({
    isOpen: false,
    fileUrl: "",
    filename: ""
  });
  const [showDetails, setShowDetails] = useState(false);
  const navigate = useNavigate();

  // Get user's department_id from auth state
  const { user } = useSelector((state) => state.authSlice);

  // Filter states
  const currentYear = new Date().getFullYear().toString();
  const globalFilter = useGlobalFilter();

  const [selectedYear, setSelectedYear] = useState(globalFilter.year || currentYear);
  const [selectedQuarter, setSelectedQuarter] = useState(
    globalFilter.quarter && globalFilter.quarter !== "All" ? globalFilter.quarter : 'all'
  );
  const [selectedStatus, setSelectedStatus] = useState('submitted');
  const [selectedDepartment, setSelectedDepartment] = useState(
    globalFilter.department || user?.department?.id?.toString() || ''
  );
  const [departments, setDepartments] = useState([]);

  // Fetch departments (excluding stakeholders)
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await getDepartmentApi({ per_page: 100 });
        if (response.data && response.data.length > 0) {
          // Filter out stakeholder departments
          const nitdaDepartments = response.data.filter(dept => dept.type !== "stakeholder");
          setDepartments(nitdaDepartments);
        }
      } catch (error) {
        // Error fetching departments
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    const deptId = user?.department?.id;
    if (deptId && !selectedDepartment) {
      setSelectedDepartment(deptId.toString());
    }
  }, [user, selectedDepartment]);

  // Year and Quarter options
  const { years: yearsList } = useYears();
  const years = yearsList.length > 0 ? yearsList.map(y => y?.year?.toString() || '') : ['2024', '2025', '2026', '2027'];
  const quarters = [
    { value: 'all', label: 'All Quarters' },
    { value: '1', label: 'Q1' },
    { value: '2', label: 'Q2' },
    { value: '3', label: 'Q3' },
    { value: '4', label: 'Q4' },
  ];

  // Fetch KPI values from API
  useEffect(() => {
    fetchKpiValues(1);
    setCurrentPage(1);
  }, [selectedYear, selectedQuarter, selectedDepartment, selectedStatus]);

  const fetchKpiValues = async (page = 1) => {
    setLoading(true);
    // Clear stale data immediately so counts don't show old values during fetch
    setMonthStatuses([]);
    setPagination(null);
    try {
      const res = await getKpiMonthStatusesApi({
        year: selectedYear,
        quarter: selectedQuarter !== 'all' ? selectedQuarter : undefined,
        status: selectedStatus !== 'unapproved' ? selectedStatus : undefined,
        department_id: selectedDepartment || undefined,
        page,
        per_page: 15,
      });
      const data = res?.data || [];
      setMonthStatuses(data);
      setPagination(res?.meta?.pagination || null);
      setCurrentPage(page);
      if (data.length > 0) {
        setSelectedKpi(data[0]);
      } else {
        setSelectedKpi(null);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
      setMonthStatuses([]);
      setSelectedKpi(null);
    } finally {
      setLoading(false);
    }
  };

  // Convert month number or name to 3-letter abbreviation
  const getMonthAbbreviation = (monthValue) => {
    if (!monthValue && monthValue !== 0) return null;

    // Month number to abbreviation mapping (1-12)
    const monthNumberMap = {
      1: 'jan',
      2: 'feb',
      3: 'mar',
      4: 'apr',
      5: 'may',
      6: 'jun',
      7: 'jul',
      8: 'aug',
      9: 'sep',
      10: 'oct',
      11: 'nov',
      12: 'dec',
    };

    // If it's a number, use number mapping
    if (typeof monthValue === 'number') {
      return monthNumberMap[monthValue] || null;
    }

    // If it's a string number like "1", "2", etc.
    const numericMonth = parseInt(monthValue);
    if (!isNaN(numericMonth) && numericMonth >= 1 && numericMonth <= 12) {
      return monthNumberMap[numericMonth];
    }

    // If it's a string name like "January", "February", etc.
    const monthNameMap = {
      'january': 'jan',
      'february': 'feb',
      'march': 'mar',
      'april': 'apr',
      'may': 'may',
      'june': 'jun',
      'july': 'jul',
      'august': 'aug',
      'september': 'sep',
      'october': 'oct',
      'november': 'nov',
      'december': 'dec',
    };

    const normalized = String(monthValue).toLowerCase().trim();
    return monthNameMap[normalized] || null;
  };


  // Handle authenticated file viewing
  const handleViewFile = (fileUrl, filename) => {
    setDocViewer({
      isOpen: true,
      fileUrl,
      filename
    });
  };

  // Handle file downloading
  const handleDownloadFile = (fileUrl, filename) => {
    forceDownload(getAbsoluteFileUrl(fileUrl), filename);
  };

  // Effect to set or clear reviewer note when selected KPI changes
  useEffect(() => {
    if (selectedKpi?.status === 'disapproved' && selectedKpi?.comment) {
      setReviewerNote(selectedKpi.comment);
    } else {
      setReviewerNote('');
    }
  }, [selectedKpi]);

  // Can the current user approve/reject this KPI?
  // Admin can always review. Others can only review KPIs from their own department.
  const userDeptId = user?.department?.id?.toString() || "";
  const kpiDeptName = selectedKpi?.department_name || "";
  const userDeptName = user?.department?.name || "";
  const canReview = isAdmin(user) || kpiDeptName === userDeptName;

  const handleApprove = async () => {
    if (!selectedKpi) return;

    const monthValue = getMonthAbbreviation(selectedKpi.month);

    if (!monthValue) {
      toast.warning('Invalid month value. Cannot approve this KPI.');
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Approve Submission",
      description: `Are you sure you want to approve the KPI submission for ${selectedKpi.month_name}?`,
      confirmText: "Approve",
      confirmVariant: "default",
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        setApproving(true);
        try {
          const payload = {
            month: monthValue,
            comment: reviewerNote.trim() || '',
          };

          await approveKpiValueApi(selectedKpi.kpi_value_id, payload);
          toast.success(`KPI submission for ${selectedKpi.month_name} approved successfully`);

          // Refresh the KPI list
          await fetchKpiValues(currentPage);
          setReviewerNote(''); // Clear the reviewer note
        } catch (error) {
          toast.error(getErrorMessage(error));
        } finally {
          setApproving(false);
        }
      }
    });
  };

  const handleReject = async () => {
    if (!selectedKpi) return;

    if (!reviewerNote.trim()) {
      toast.warning('Please provide a reason for rejection');
      return;
    }

    const monthValue = getMonthAbbreviation(selectedKpi.month);

    if (!monthValue) {
      toast.warning('Invalid month value. Cannot reject this KPI.');
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Reject Submission",
      description: `Are you sure you want to reject the KPI submission for ${selectedKpi.month_name}? This will require the submitter to update and resubmit.`,
      confirmText: "Reject",
      confirmVariant: "destructive",
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        setRejecting(true);
        try {
          const payload = {
            month: monthValue,
            comment: reviewerNote.trim(),
          };

          await rejectKpiValueApi(selectedKpi.kpi_value_id, payload);
          toast.success(`KPI submission for ${selectedKpi.month_name} rejected successfully`);

          // Refresh the KPI list
          await fetchKpiValues(currentPage);
          setReviewerNote(''); // Clear the reviewer note
        } catch (error) {
          toast.error(getErrorMessage(error));
        } finally {
          setRejecting(false);
        }
      }
    });
  };

  const formatNumber = (num) => {
    return formatNumberWithCommas(num) || 'N/A';
  };

  const handleSelectKpi = (item) => {
    setSelectedKpi(item);
    setReviewerNote(item.comment || '');
    setShowDetails(true);
  };

  const handleBackToList = () => {
    setShowDetails(false);
  };

  // Get pending count
  const pendingCount = loading ? 0 : (pagination?.total ?? monthStatuses.length);

  // ── Bulk selection ────────────────────────────────────────────────────────
  // selectedItems: Set of "kpi_value_id:month" strings for O(1) lookup
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [bulkComment, setBulkComment] = useState("");
  const [bulkApproving, setBulkApproving] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  const toggleItem = (item) => {
    const key = `${item.kpi_value_id}:${item.month}`;
    setSelectedItems(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const isSelected = (item) => selectedItems.has(`${item.kpi_value_id}:${item.month}`);

  // Only submitted items are selectable
  const selectableItems = monthStatuses.filter(i => i.status === "submitted");

  const toggleSelectAll = () => {
    if (selectedItems.size === selectableItems.length && selectableItems.length > 0) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(selectableItems.map(i => `${i.kpi_value_id}:${i.month}`)));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedItems.size === 0) return;

    // Build approvals array: group months by kpi_value_id
    const grouped = {};
    for (const key of selectedItems) {
      const [kpiValueId, month] = key.split(":");
      if (!grouped[kpiValueId]) grouped[kpiValueId] = [];
      grouped[kpiValueId].push(Number(month));
    }
    const approvals = Object.entries(grouped).map(([kpi_value_id, months]) => ({
      kpi_value_id: Number(kpi_value_id),
      months,
    }));

    setBulkApproving(true);
    try {
      await bulkApproveKpiMonthsApi({ approvals, comment: bulkComment.trim() || "Bulk monthly approval" });
      toast.success(`${selectedItems.size} submission(s) approved successfully`);
      setSelectedItems(new Set());
      setBulkComment("");
      setShowBulkModal(false);
      await fetchKpiValues(currentPage);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBulkApproving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with Filters */}
      <div className="bg-white border-b border-gray-200 px-8 py-4" id="approval-page-header">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard/kpi-data")}
          className="p-0 text-gray-600 hover:text-green-700 hover:bg-transparent -ml-1 mb-4 flex items-center gap-2 transition-colors group"
        >
          <ChevronLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
          Go Back to KPI Data
        </Button>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {showDetails && (
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-8 w-8 -ml-2"
                onClick={handleBackToList}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">KPI Review & Approval</h1>
              <p className="text-xs md:text-sm text-gray-500 mt-1">Review and approve KPI submissions</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3" id="approval-filters">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[110px] sm:w-[140px]">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Status filter */}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[140px] sm:w-[160px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unapproved">All</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="disapproved">Disapproved</SelectItem>
              </SelectContent>
            </Select>
            {isAdmin(user) && (
              <DepartmentSelect
                value={selectedDepartment}
                onChange={setSelectedDepartment}
                className="w-full sm:w-[280px]"
              />
            )}
            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                <SelectTrigger className="flex-1 sm:w-[130px]">
                  <SelectValue placeholder="Quarter" />
                </SelectTrigger>
                <SelectContent>
                  {quarters.map((q) => (
                    <SelectItem key={q.value} value={q.value}>
                      {q.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative bg-white px-2 sm:px-8">
        {/* Sidebar */}
        <div
          className={`w-full lg:w-[380px] bg-white border-r border-gray-100 flex flex-col h-full overflow-hidden transition-all duration-300 ${showDetails ? 'hidden lg:flex' : 'flex'}`}
          id="approval-queue-sidebar"
        >
          {/* Sidebar Inner Scroll Area */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Queue Header */}
            <div className="px-6 py-4 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shadow-sm border border-green-100/50">
                  <List className="w-5 h-5 text-green-700" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-base">Approval Queue</h2>
                </div>
                <span className="ml-auto bg-green-700 text-white text-[11px] font-bold rounded-full px-2 py-0.5 min-w-[20px] h-5 flex items-center justify-center shadow-sm">
                  {monthStatuses?.length}
                </span>
              </div>
              {/* Bulk actions bar — shown when submitted items exist */}
              {selectableItems.length > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="select-all-kpi"
                    className="h-4 w-4 rounded border-gray-300 accent-green-600 cursor-pointer"
                    checked={selectedItems.size === selectableItems.length && selectableItems.length > 0}
                    onChange={toggleSelectAll}
                  />
                  <label htmlFor="select-all-kpi" className="text-xs text-gray-500 cursor-pointer select-none flex-1">
                    {selectedItems.size > 0 ? `${selectedItems.size} selected` : `Select all submitted (${selectableItems.length})`}
                  </label>
                  {selectedItems.size > 0 && (
                    <button
                      onClick={() => setShowBulkModal(true)}
                      className="text-xs font-semibold bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Bulk Approve
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Queue List - Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
                  <p className="text-xs text-gray-400 font-medium tracking-wide">Fetching submissions...</p>
                </div>
              ) : monthStatuses.length === 0 ? (
                <div className="text-center py-12 px-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                  <FileText className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">No KPI submissions found for this period</p>
                </div>
              ) : (
                <div className="space-y-3 pb-8">
                  {monthStatuses.map((item) => (
                    <div
                      key={`${item.kpi_value_id}-${item.month}`}
                      onClick={() => handleSelectKpi(item)}
                      className={`cursor-pointer border rounded-lg p-4 transition-all duration-200 ${
                        selectedKpi?.kpi_value_id === item.kpi_value_id && selectedKpi?.month === item.month
                          ? 'bg-green-50 border-green-600 shadow-sm'
                          : isSelected(item)
                          ? 'bg-blue-50 border-blue-400'
                          : 'bg-white border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {/* Checkbox — only for submitted items */}
                        {item.status === 'submitted' && (
                          <input
                            type="checkbox"
                            checked={isSelected(item)}
                            onChange={(e) => { e.stopPropagation(); toggleItem(item); }}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-green-600 cursor-pointer shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest truncate">
                              {item.month_name} · {item.department_name}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-1 ${
                              item.status === 'approved' ? 'bg-green-100 text-green-700' :
                              item.status === 'disapproved' ? 'bg-red-100 text-red-700' :
                              item.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-500'
                            }`}>
                              {item.status.replace('_', ' ')}
                            </span>
                          </div>
                          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2">
                            {item.kpi_name}
                          </h3>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">{item.department_name}</span>
                            <span className="font-bold text-green-700">{Number(item.value || 0).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {pagination && pagination.last_page > 1 && (
              <div className="px-6 pb-4">
                <DataPagination
                  currentPage={currentPage}
                  totalPages={pagination.last_page}
                  onPageChange={(page) => fetchKpiValues(page)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className={`flex-1 overflow-y-auto bg-gray-50/30 p-4 md:p-8 custom-scrollbar ${showDetails ? 'block' : 'hidden lg:block'}`}>
          {!selectedKpi ? (
            <div className="flex items-center justify-center h-full" id="approval-main-instruction">
              <div className="text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Select a KPI from the sidebar to review</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <span>{selectedKpi.year || 'N/A'}</span>
                  {selectedKpi.month_name && (
                    <>
                      <span>›</span>
                      <span>{selectedKpi.month_name} {selectedKpi.year}</span>
                    </>
                  )}
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-6" id="approval-kpi-header">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                    {selectedKpi.kpi_name || 'Untitled KPI'}
                  </h1>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs sm:text-sm text-gray-500">ID: #{selectedKpi.kpi_value_id}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm" id="approval-target-card">
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">STATUS</div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 capitalize">
                    {selectedKpi.status?.replace('_', ' ') || 'N/A'}
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6 shadow-sm" id="approval-value-card">
                  <div className="text-[10px] text-green-600 font-bold uppercase tracking-wider mb-2">SUBMITTED VALUE</div>
                  <div className="text-2xl sm:text-3xl font-bold text-green-600">
                    {formatNumber(selectedKpi.value)}
                  </div>
                </div>
              </div>

              {/* Submission Details */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6" id="approval-details-card">
                <div className="flex items-center gap-2 mb-6">
                  <FileText className="w-5 h-5 text-gray-900" />
                  <h2 className="font-semibold text-gray-900">Submission Details</h2>
                </div>

                {/* Department */}
                <div className="mb-6">
                  <div className="text-sm text-gray-500 mb-2">Department</div>
                  <div className="bg-gray-100 rounded-lg p-4">
                    <p className="text-sm text-gray-900">{selectedKpi.department_name || 'N/A'}</p>
                  </div>
                </div>

                {/* Remarks */}
                <div className="mb-6">
                  <div className="text-sm text-gray-500 mb-2">Remarks from Submitter</div>
                  <div className="bg-gray-100 rounded-lg p-4">
                    <p className="text-sm text-gray-900">
                      {selectedKpi.evidences?.[0]?.remarks || selectedKpi.comment || 'No remarks provided'}
                    </p>
                  </div>
                </div>


                {/* Attached Evidence */}
                {selectedKpi.evidences && selectedKpi.evidences.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-500 font-semibold mb-3">
                      Attached Evidence ({selectedKpi.month_name})
                    </div>
                    <div className="space-y-3 mb-6">
                      {selectedKpi.evidences.map((evidence, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 border border-gray-100 rounded-xl p-4 sm:p-5 transition-all hover:bg-gray-100/50"
                        >
                          <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
                              <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-teal-100">
                                <FileText className="h-6 w-6 text-teal-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-gray-900 truncate pr-2">
                                  {evidence.filename || `Evidence Document ${index + 1}`}
                                </div>
                                <div className="text-[11px] text-gray-500 font-medium mt-0.5 flex flex-wrap items-center gap-x-2">
                                  <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-bold uppercase tracking-tighter">
                                    {evidence.filename?.split('.').pop()}
                                  </span>
                                  <span>{evidence.size_bytes ? `${(evidence.size_bytes / 1024).toFixed(1)}kb` : 'Document'}</span>
                                  {evidence.month && (
                                    <>
                                      <span className="text-gray-300">•</span>
                                      <span>Month: {new Date(2025, evidence.month - 1).toLocaleString('en-US', { month: 'long' })}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-row sm:flex-row gap-2 w-full sm:w-auto">
                              <button
                                onClick={() => {
                                  if (isPreviewableFile(evidence.filename)) {
                                    handleViewFile(getAbsoluteFileUrl(evidence.url), evidence.filename);
                                  } else {
                                    toast.warning("Preview not supported", {
                                      description: "This file type cannot be previewed. Please download it to view."
                                    });
                                  }
                                }}
                                disabled={false} // Enable button to allow clicking for the toast
                                title={!isPreviewableFile(evidence.filename) ? "Preview not supported for this file type. Please download to view." : "View document"}
                                className={`flex-1 sm:w-28 py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-[13px] font-bold shadow-sm ${isPreviewableFile(evidence.filename)
                                  ? "bg-teal-600 text-white hover:bg-teal-700 active:scale-95"
                                  : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-100 opacity-60"
                                  }`}
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </button>
                              <button
                                onClick={() => handleDownloadFile(evidence.url, evidence.filename)}
                                className="flex-1 sm:w-32 py-2.5 px-4 rounded-xl bg-white border-2 border-teal-50 text-teal-700 hover:bg-teal-50 active:scale-95 transition-all flex items-center justify-center gap-2 text-[13px] font-bold shadow-sm"
                              >
                                <Download className="w-4 h-4" />
                                Download
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                )}
              </div>

              {/* Review Decision — only shown for submitted items */}
              {selectedKpi?.status !== 'approved' && selectedKpi?.status !== 'disapproved' ? (
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6" id="approval-decision-card">
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="font-semibold text-gray-900">Review Decision</h2>
                  </div>
                  <div className="mb-2">
                    <label className="text-sm text-gray-500">
                      Reviewer Note <span className="text-xs text-muted-foreground">(Optional for Approval, Required for Rejection)</span>
                    </label>
                  </div>
                  <textarea
                    value={reviewerNote}
                    onChange={(e) => setReviewerNote(e.target.value)}
                    className="w-full h-32 border border-gray-300 rounded-lg p-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-600 resize-none"
                    placeholder="Enter your review notes here..."
                  />
                </div>
              ) : (
                <div className={`rounded-lg p-5 mb-6 flex items-center gap-4 border ${
                  selectedKpi.status === 'approved'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`} id="approval-decision-card">
                  {selectedKpi.status === 'approved'
                    ? <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
                    : <XCircle className="w-6 h-6 text-red-500 shrink-0" />
                  }
                  <div>
                    <p className={`font-semibold text-sm ${selectedKpi.status === 'approved' ? 'text-green-800' : 'text-red-800'}`}>
                      This KPI submission has been {selectedKpi.status === 'approved' ? 'approved' : 'disapproved'}.
                    </p>
                    {selectedKpi.comment && (
                      <p className="text-xs text-gray-600 mt-1">Reviewer note: {selectedKpi.comment}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons — only shown for items not yet finalised */}
              {selectedKpi?.status !== 'approved' && selectedKpi?.status !== 'disapproved' && (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4" id="approval-action-buttons">
                {!canReview && selectedKpi && (
                  <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 w-full text-center">
                    You can only approve or reject KPIs from your department.
                  </p>
                )}
                {selectedKpi?.status === 'not_submitted' && (
                  <p className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-full text-center">
                    This KPI has not been submitted yet and cannot be reviewed.
                  </p>
                )}
                <button
                  onClick={handleReject}
                  disabled={rejecting || approving || selectedKpi?.status === 'disapproved' || selectedKpi?.status === 'approved' || selectedKpi?.status === 'not_submitted' || !canReview}
                  className="flex-1 bg-white border border-gray-200 text-red-600 py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed order-2 sm:order-1"
                  title={
                    selectedKpi?.status === 'disapproved' ? 'Already disapproved' :
                    selectedKpi?.status === 'approved' ? 'Cannot reject an approved submission' : ''
                  }
                >
                  {rejecting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                  {rejecting ? 'Processing...' : 'Reject Submission'}
                </button>
                <button
                  onClick={handleApprove}
                  disabled={approving || rejecting || selectedKpi?.status === 'not_submitted' || selectedKpi?.status === 'approved' || selectedKpi?.status === 'disapproved' || !canReview}
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
                >
                  {approving ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                  {approving ? 'Processing...' : 'Approve Submission'}
                </button>
              </div>
              )}
            </>
          )}
        </div>
      </div >

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        title={confirmModal.title}
        description={confirmModal.description}
        onConfirm={confirmModal.onConfirm}
        confirmText={confirmModal.confirmText}
        confirmVariant={confirmModal.confirmVariant}
      />

      {/* Bulk Approve Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowBulkModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Bulk Approve</h2>
              <button onClick={() => setShowBulkModal(false)} className="p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                You are about to approve <strong>{selectedItems.size} submission(s)</strong>.
              </p>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Comment (optional)</label>
                <textarea
                  value={bulkComment}
                  onChange={e => setBulkComment(e.target.value)}
                  placeholder="Bulk monthly approval"
                  className="w-full h-24 border border-gray-300 rounded-lg p-3 text-sm resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkApprove}
                  disabled={bulkApproving}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {bulkApproving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
                  {bulkApproving ? "Approving…" : "Approve All"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <DocumentViewer
        isOpen={docViewer.isOpen}
        fileUrl={docViewer.fileUrl}
        filename={docViewer.filename}
        onClose={() => setDocViewer(prev => ({ ...prev, isOpen: false }))}
      />
    </div >
  );
};

export default KpiReview;
