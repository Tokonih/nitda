import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Building, Target, Loader2, Calendar, ChevronLeft, MessageSquare, Filter, CheckSquare, Square } from "lucide-react";
import { fetchAllKpi, approveKpi, disapproveKpi } from '../Slices/kpiSlice';
import { fetchDepartments } from '../Slices/departmentSlice';
import { fetchPillars } from '../Slices/pillarSlice';
import { fetchSrapInitiatives } from '../Slices/srapSlice';
import { bulkApproveKpiDefinitionsApi, bulkDisapproveKpiDefinitionsApi } from '../Slices/Utils/Api/kpi';
import { toast } from 'sonner';
import { isAdmin as checkIsAdmin } from '@/lib/roleLabels';
import { Badge } from "@/components/ui/badge";
import { useYears } from "@/hooks/use-years";
import { formatNumberWithCommas, getErrorMessage } from "@/lib/utils";
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useGlobalFilter } from "@/hooks/useGlobalFilter";
import DepartmentSelect from "@/components/ui/DepartmentSelect";
import { DataPagination } from "@/components/ui/data-pagination";

const KpiDefinitionReview = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const approvalTarget = location.state?.kpi;
    const approvalTargetId = location.state?.kpiId || approvalTarget?.id;
    const { years: yearsList } = useYears();
    const now = new Date();
    const currentYear = now.getFullYear().toString();
    const currentMonth = now.getMonth();
    const initialQuarter = `Q${Math.floor(currentMonth / 3) + 1}`;

    const globalFilter = useGlobalFilter();
    const [selectedYear, setSelectedYear] = useState(
      location.state?.year || globalFilter.year || currentYear
    );
    const [selectedQuarter, setSelectedQuarter] = useState(initialQuarter);
    const [selectedApprovalStatus, setSelectedApprovalStatus] = useState("pending");

    const { user } = useSelector((state) => state.authSlice);
    const userDeptId = user?.department_id?.toString() || user?.department?.id?.toString();
    const isAdmin = checkIsAdmin(user);
    const isDirector = user?.role === "Director" || user?.role === "DG" || user?.role === "DGT";
    const [selectedDepartment, setSelectedDepartment] = useState(
      location.state?.departmentId || globalFilter.department || userDeptId || ""
    );
    const [hasAutoSelected, setHasAutoSelected] = useState(false);
    const { list: kpis, loading: kpisLoading, pagination: kpiPagination } = useSelector((state) => state.kpi);
    const { list: departments, loading: deptsLoading } = useSelector((state) => state.departments);
    const { list: pillars } = useSelector((state) => state.pillars);
    const { list: initiatives } = useSelector((state) => state.sraps);
    const [selectedKpi, setSelectedKpi] = useState(approvalTarget || null);
    const [showDetails, setShowDetails] = useState(false); // Mobile Master-Detail toggle
    const [approvalComment, setApprovalComment] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [kpiPage, setKpiPage] = useState(1);
    const KPI_PER_PAGE = 15;
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: "",
        description: "",
        onConfirm: () => { },
        confirmVariant: "default",
        confirmText: "Confirm"
    });

    // ── Bulk selection ────────────────────────────────────────────────────────
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkAction, setBulkAction] = useState(null); // 'approve' | 'disapprove'
    const [bulkComment, setBulkComment] = useState("");
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);

    const toggleSelectId = (id, e) => {
        e.stopPropagation();
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === displayKpis.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(displayKpis.map(k => k.id)));
        }
    };

    const openBulkModal = (action) => {
        if (selectedIds.size === 0) {
            toast.warning("Please select at least one KPI.");
            return;
        }
        setBulkAction(action);
        setBulkComment("");
        setShowBulkModal(true);
    };

    const handleBulkSubmit = async () => {
        if (bulkAction === 'disapprove' && bulkComment.trim().length < 5) {
            toast.warning("Please provide a reason for disapproval (min 5 characters).");
            return;
        }
        setIsBulkProcessing(true);
        try {
            const payload = {
                kpi_ids: Array.from(selectedIds),
                comment: bulkComment.trim() || (bulkAction === 'approve' ? "Bulk approval" : "Bulk disapproval"),
            };
            if (bulkAction === 'approve') {
                await bulkApproveKpiDefinitionsApi(payload);
                toast.success(`${selectedIds.size} KPI definition(s) approved successfully`);
            } else {
                await bulkDisapproveKpiDefinitionsApi(payload);
                toast.success(`${selectedIds.size} KPI definition(s) disapproved`);
            }
            setSelectedIds(new Set());
            setBulkComment("");
            setShowBulkModal(false);
            // Refresh list
            if (selectedDepartment) {
                dispatch(fetchAllKpi({
                    department_id: selectedDepartment,
                    year: selectedYear,
                    approved: selectedApprovalStatus === "approved" ? true : false,
                    page: kpiPage,
                    per_page: KPI_PER_PAGE,
                }));
            }
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setIsBulkProcessing(false);
        }
    };

    // Filter out stakeholder departments
    const filteredDepartments = departments?.filter(dept => dept.type !== 'stakeholder') || [];

    useEffect(() => {
        dispatch(fetchDepartments());
        dispatch(fetchPillars());
        dispatch(fetchSrapInitiatives({ per_page: 500 }));
    }, [dispatch]);

    // Automatically select the user's department or the first department when loaded
    useEffect(() => {
        if (filteredDepartments.length > 0 && !hasAutoSelected) {
            const currentDeptId = user?.department_id?.toString() || user?.department?.id?.toString();
            const hasUserDept = filteredDepartments.some(d => d.id?.toString() === currentDeptId);

            if (hasUserDept) {
                setSelectedDepartment(currentDeptId);
                setHasAutoSelected(true);
            } else if (!selectedDepartment) {
                setSelectedDepartment(filteredDepartments[0].id.toString());
                setHasAutoSelected(true);
            }
        }
    }, [filteredDepartments, user, hasAutoSelected, selectedDepartment]);

    useEffect(() => {
        if (selectedDepartment) {
            const params = {
                department_id: selectedDepartment,
                year: selectedYear,
                // approved=true → approved only; approved=false → pending + disapproved (filtered client-side)
                approved: selectedApprovalStatus === "approved" ? true : false,
                page: kpiPage,
                per_page: KPI_PER_PAGE,
            };
            dispatch(fetchAllKpi(params));
        }
    }, [dispatch, selectedDepartment, selectedYear, selectedApprovalStatus, kpiPage]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setKpiPage(1);
    }, [selectedDepartment, selectedYear, selectedApprovalStatus]);

    // Client-side filter: the API returns approved=true or approved=false (pending+disapproved mixed).
    // We split pending vs disapproved here.
    const displayKpis = (kpis || []).filter((kpi) => {
        if (selectedApprovalStatus === "approved") return kpi.is_approved && kpi.approval_comment;
        if (selectedApprovalStatus === "disapproved") return !kpi.is_approved && kpi.approval_comment;
        // "pending" — no approval action taken yet
        return !kpi.is_approved && !kpi.approval_comment;
    });

    // Sync selectedKpi with the latest data from kpis list
    useEffect(() => {
        if (displayKpis?.length > 0) {
            const linkedKpi = approvalTargetId
                ? displayKpis.find(kpi => String(kpi.id) === String(approvalTargetId))
                : null;

            if (linkedKpi) {
                setSelectedKpi(linkedKpi);
                setShowDetails(true);
                return;
            }

            if (selectedKpi) {
                const updatedKpi = displayKpis.find(k => k.id === selectedKpi.id);
                if (updatedKpi && updatedKpi !== selectedKpi) {
                    setSelectedKpi(updatedKpi);
                } else if (!updatedKpi) {
                    setSelectedKpi(displayKpis[0]);
                }
            } else {
                setSelectedKpi(displayKpis[0]);
            }
        } else {
            setSelectedKpi(null);
            setShowDetails(false);
        }
    }, [kpis, selectedApprovalStatus, approvalTargetId]);

    const handleSelectKpi = (kpi) => {
        setSelectedKpi(kpi);
        setShowDetails(true);
    };

    const handleBackToList = () => {
        setShowDetails(false);
    };

    // Reset comment when KPI selection changes
    useEffect(() => {
        if (selectedKpi) {
            setApprovalComment(selectedKpi.approval_comment || (selectedKpi.status?.toLowerCase() === 'approved' ? "Approved for use in scorecards" : ""));
        } else {
            setApprovalComment("");
        }
    }, [selectedKpi]);

    const handleApprove = async (kpiId) => {
        // Prevent approving with the exact same comment used for disapproval
        if (selectedKpi?.approval_comment && approvalComment?.trim() === selectedKpi.approval_comment?.trim()) {
            toast.warning("Please update the comment before approving (cannot use the previous disapproval reason).");
            return;
        }

        setConfirmModal({
            isOpen: true,
            title: "Approve Submission",
            description: `Are you sure you want to approve the KPI definition for "${selectedKpi.name}"?`,
            confirmText: "Approve",
            confirmVariant: "success", // Using success variant for green
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                setIsProcessing(true);
                try {
                    await dispatch(approveKpi({
                        id: kpiId,
                        data: { comment: approvalComment || "Approved for use in scorecards" }
                    })).unwrap();

                    toast.success("KPI approved successfully");
                    setApprovalComment("");
                } catch (error) {
                    toast.error(getErrorMessage(error));
                } finally {
                    setIsProcessing(false);
                }
            }
        });
    };

    const handleDisapprove = async (kpiId) => {
        if (!approvalComment || approvalComment.trim().length < 5) {
            toast.warning("Please provide a reason/comment for disapproval (min 5 characters)");
            return;
        }

        // Block if already disapproved (revision needed) - though the button should handle this, double check here
        if (!selectedKpi?.is_approved && selectedKpi?.approval_comment) {
            toast.warning("This KPI is already marked for revision.");
            return;
        }

        setConfirmModal({
            isOpen: true,
            title: "Disapprove Submission",
            description: `Are you sure you want to disapprove this KPI definition? This will return it for revision.`,
            confirmText: "Disapprove",
            confirmVariant: "destructive",
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                setIsProcessing(true);
                try {
                    await dispatch(disapproveKpi({
                        id: kpiId,
                        data: { comment: approvalComment }
                    })).unwrap();

                    toast.success("KPI submission returned for revision");
                    setApprovalComment("");
                } catch (error) {
                    toast.error(getErrorMessage(error));
                } finally {
                    setIsProcessing(false);
                }
            }
        });
    };

    const getStatusBadge = (kpi) => {
        // Approved: is_approved true and has a comment
        if (kpi?.is_approved && kpi?.approval_comment) {
            return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">Approved</Badge>;
        }

        // Disapproved: is_approved false AND approval_comment is not null/empty
        if (!kpi?.is_approved && kpi?.approval_comment) {
            return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200">Disapproved</Badge>;
        }

        // Pending: is_approved false and no comment yet
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200">Pending</Badge>;
    };

    const getStrategicContext = (kpi) => {
        const objective = kpi.srap_objective;
        const initiativeId = objective?.srap_initiative_id;
        const initiative = initiatives?.find(i => i.id?.toString() === initiativeId?.toString());
        const pillarId = objective?.pillar_id || initiative?.pillar_id;
        const pillar = pillars?.find(p => p.id?.toString() === pillarId?.toString());

        return {
            pillar: pillar?.name || initiative?.pillar?.name || "No Pillar assigned",
            initiative: initiative?.name || objective?.initiative_name || "No Initiative assigned",
            objective: objective?.name || "No Objective assigned",
            department: objective?.department_name || kpi.department?.name || "Unassigned"
        };
    };

    return (
        <div className="flex flex-col h-auto lg:h-[calc(100vh-80px)] overflow-x-hidden lg:overflow-hidden bg-gray-50">
            {/* Standard Project Header */}
            <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-3 md:py-4 z-10">
                {/* Back button row */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/dashboard/kpi-data')}
                    className="p-0 text-gray-600 hover:text-green-700 hover:bg-transparent -ml-1 mb-3 flex items-center gap-2 transition-colors group"
                >
                    <ChevronLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
                    Go Back to KPI Data
                </Button>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
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
                            <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 leading-none">KPI Definition Approvals</h1>
                        </div>
                        <p className="text-[10px] md:text-xs text-gray-500">Review and approve KPI definitions by department</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 md:gap-3">
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger className="w-full sm:w-[100px] lg:w-[110px] bg-white border-gray-200 h-9 md:h-10 shadow-sm text-xs md:text-sm">
                                <Calendar className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                                {yearsList?.map((y) => (
                                    <SelectItem key={y.year} value={y.year.toString()}>
                                        {y.year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={selectedApprovalStatus} onValueChange={setSelectedApprovalStatus}>
                            <SelectTrigger className="w-full sm:w-[130px] lg:w-[150px] bg-white border-gray-200 h-9 md:h-10 shadow-sm text-xs md:text-sm">
                                <Filter className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                <SelectValue placeholder="Approval Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="disapproved">Disapproved</SelectItem>
                            </SelectContent>
                        </Select>

                        {(isAdmin || isDirector) && (
                            <DepartmentSelect
                                value={selectedDepartment}
                                onChange={setSelectedDepartment}
                                type="nitda"
                                className="w-full lg:w-[280px] h-9 md:h-10 shadow-sm text-xs md:text-sm"
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Main Wrapper */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
                {/* Standard Sidebar: Approval Queue Style */}
                <div className={`w-full lg:w-80 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden transition-all duration-300 ${showDetails ? 'hidden lg:flex' : 'flex'}`}>
                    <div className="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-teal-600" />
                            <h2 className="font-semibold text-gray-900 text-sm md:text-base">KPI Registry</h2>
                        </div>
                        {(!kpisLoading && !isProcessing) && (
                            <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-100 font-bold px-2 py-0.5 text-xs">
                                {displayKpis.length}
                            </Badge>
                        )}
                    </div>

                    {/* Bulk action bar — only shown for pending KPIs */}
                    {selectedApprovalStatus === "pending" && displayKpis.length > 0 && !kpisLoading && (
                        <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between gap-2">
                            <button
                                onClick={toggleSelectAll}
                                className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-teal-700 font-medium transition-colors"
                            >
                                {selectedIds.size === displayKpis.length && displayKpis.length > 0
                                    ? <CheckSquare className="h-4 w-4 text-teal-600" />
                                    : <Square className="h-4 w-4" />
                                }
                                {selectedIds.size === displayKpis.length && displayKpis.length > 0
                                    ? "Deselect all"
                                    : `Select all (${displayKpis.length})`}
                            </button>
                            {selectedIds.size > 0 && (
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-gray-500 font-medium">{selectedIds.size} selected</span>
                                    <button
                                        onClick={() => openBulkModal('approve')}
                                        className="text-[10px] font-bold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-2 py-1 rounded transition-colors"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => openBulkModal('disapprove')}
                                        className="text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-2 py-1 rounded transition-colors"
                                    >
                                        Disapprove
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 custom-scrollbar">
                        {(kpisLoading || isProcessing) ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-3 text-gray-400">
                                <Loader2 className="h-6 w-6 animate-spin" />
                                <span className="text-[10px] font-medium uppercase tracking-wider">
                                    {isProcessing ? 'Processing...' : 'Loading...'}
                                </span>
                            </div>
                        ) : displayKpis.length === 0 ? (
                            <div className="text-center py-10 px-4">
                                <p className="text-sm text-gray-400 italic">No KPIs found.</p>
                            </div>
                        ) : (
                            displayKpis.map((kpi) => (
                                <div
                                    key={kpi.id}
                                    onClick={() => handleSelectKpi(kpi)}
                                    className={`cursor-pointer p-4 rounded-lg border transition-all duration-200 ${selectedKpi?.id === kpi.id
                                        ? 'bg-teal-50 border-teal-600 shadow-sm'
                                        : 'bg-white border-gray-200 hover:border-teal-400 hover:bg-teal-50/10'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none">
                                            {kpi.code || `#${kpi.id}`}
                                        </span>
                                        {/* Checkbox for pending items */}
                                        {selectedApprovalStatus === "pending" && (
                                            <button
                                                onClick={(e) => toggleSelectId(kpi.id, e)}
                                                className="text-gray-400 hover:text-teal-600 transition-colors"
                                            >
                                                {selectedIds.has(kpi.id)
                                                    ? <CheckSquare className="h-4 w-4 text-teal-600" />
                                                    : <Square className="h-4 w-4" />
                                                }
                                            </button>
                                        )}
                                    </div>
                                    <h3 className="text-[13px] font-bold text-gray-900 leading-tight mb-2.5 line-clamp-2">
                                        {kpi.name}
                                    </h3>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 grayscale opacity-70">
                                            <span className="text-[9px] font-medium text-gray-500 uppercase">{kpi.frequency}</span>
                                        </div>
                                        {getStatusBadge(kpi)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Sidebar pagination */}
                    {kpiPagination && kpiPagination.last_page > 1 && (
                        <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                            <DataPagination
                                currentPage={kpiPage}
                                totalPages={kpiPagination.last_page}
                                onPageChange={(page) => setKpiPage(page)}
                            />
                        </div>
                    )}
                </div>

                {/* Content: Selected KPI Details (Matches ApproveKpi Style) */}
                <div className={`flex-1 overflow-y-auto bg-gray-50/30 p-4 md:p-8 custom-scrollbar ${showDetails ? 'block' : 'hidden lg:block'}`}>
                    {!selectedKpi ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-12">
                            <Target className="h-10 w-10 md:h-12 md:w-12 text-gray-300 mb-4" />
                            <h2 className="text-base md:text-lg font-bold text-gray-900">Select a KPI</h2>
                            <p className="text-xs md:text-sm text-gray-500 max-w-[200px] md:max-w-xs mx-auto">
                                Pick a definition from the registry to review its strategic alignment and targets.
                            </p>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Mobile Back Button (Alternative) */}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="lg:hidden -ml-2 text-teal-600 font-bold flex items-center gap-1 px-2 mb-2"
                                onClick={handleBackToList}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Back to Registry
                            </Button>

                            {/* KPI Header */}
                            <div className="mb-4">
                                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 md:mb-3">
                                    <span>#{selectedKpi.id}</span>
                                    {selectedKpi.code && (
                                        <>
                                            <span className="text-gray-300">/</span>
                                            <span>{selectedKpi.code}</span>
                                        </>
                                    )}
                                </div>
                                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                                    {selectedKpi.name}
                                </h1>
                            </div>

                            {/* Essential Metrics Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm">
                                    <div className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2 md:mb-2.5">Annual Target</div>
                                    <div className="text-xl md:text-2xl font-bold text-gray-900 flex items-baseline gap-1.5">
                                        {formatNumberWithCommas(selectedKpi.target_annual || selectedKpi.target_value || '0')}
                                        <span className="text-[9px] font-medium text-gray-400 lowercase">{selectedKpi.unit || 'units'}</span>
                                    </div>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm">
                                    <div className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Frequency</div>
                                    <div className="text-lg md:text-xl font-bold text-gray-900 capitalize">
                                        {selectedKpi.frequency}
                                    </div>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm">
                                    <div className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Unit</div>
                                    <div className="text-lg md:text-xl font-bold text-gray-900 truncate">
                                        {selectedKpi.unit || 'N/A'}
                                    </div>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm">
                                    <div className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Status</div>
                                    <div className="mt-1">{getStatusBadge(selectedKpi)}</div>
                                </div>
                            </div>

                            {/* Quarterly Target Breakdown */}
                            {selectedKpi.frequency === 'quarterly' && (
                                <div className="bg-white border border-gray-200 rounded-lg p-5 md:p-8 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4 md:mb-6 border-b border-gray-50 pb-4">
                                        <Calendar className="h-4 w-4 md:h-5 md:w-5 text-teal-600" />
                                        <h2 className="text-[11px] md:text-sm font-bold text-gray-900 uppercase tracking-widest">Target Breakdown</h2>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                                        {[1, 2, 3, 4].map(q => (
                                            <div key={q} className="bg-gray-50/50 rounded-xl p-3 md:p-4 border border-gray-100">
                                                <div className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 md:mb-2">Q{q} Target</div>
                                                <div className="text-base md:text-lg font-bold text-gray-900">
                                                    {formatNumberWithCommas(selectedKpi[`target_q${q}`] || '0')}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Strategic Breakdown Section */}
                            <div className="space-y-6">
                                <div className="bg-white border border-gray-200 rounded-lg p-5 md:p-8 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4 md:mb-6 border-b border-gray-50 pb-4">
                                        <Building className="h-4 w-4 md:h-5 md:w-5 text-gray-700" />
                                        <h2 className="text-[11px] md:text-sm font-bold text-gray-900 uppercase tracking-widest">Alignment</h2>
                                    </div>

                                    {(() => {
                                        const context = getStrategicContext(selectedKpi);
                                        return (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                                <div className="space-y-2">
                                                    <label className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Project Pillar</label>
                                                    <div className="bg-teal-50/50 border border-teal-100/50 rounded-lg p-3 md:p-4 font-bold text-[12px] md:text-[13px] text-teal-900">
                                                        {context.pillar}
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Initiative</label>
                                                    <div className="bg-gray-100 rounded-lg p-3 md:p-4 font-bold text-[12px] md:text-[13px] text-gray-900">
                                                        {context.initiative}
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Objective</label>
                                                    <div className="bg-gray-100 rounded-lg p-3 md:p-4 font-medium text-[12px] md:text-[13px] text-gray-900 leading-relaxed italic">
                                                        {context.objective}
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Department</label>
                                                    <div className="bg-gray-100 rounded-lg p-3 md:p-4 font-medium text-[12px] md:text-[13px] text-gray-900">
                                                        {context.department}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>

                                <div className="bg-white border border-gray-200 rounded-lg p-5 md:p-8 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4 md:mb-6 border-b border-gray-50 pb-4">
                                        <Target className="h-4 w-4 md:h-5 md:w-5 text-gray-700" />
                                        <h2 className="text-[11px] md:text-sm font-bold text-gray-900 uppercase tracking-widest">Description</h2>
                                    </div>
                                    <div className="bg-gray-100/80 border border-gray-200/50 rounded-xl p-4 md:p-6">
                                        <p className="text-xs md:text-sm text-gray-700 leading-relaxed font-medium">
                                            {selectedKpi.description || "No methodology or description provided for this KPI."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Consolidated Action Bar at bottom */}
                            <div className="mt-8 mb-8 lg:mb-0">
                              {selectedKpi?.approval_comment ? (
                                /* Already actioned — show status banner instead of form */
                                <div className={`rounded-xl p-5 md:p-6 flex items-start gap-4 border shadow-sm ${
                                  selectedKpi?.is_approved
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-red-50 border-red-200'
                                }`}>
                                  {selectedKpi?.is_approved
                                    ? <CheckCircle className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
                                    : <XCircle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
                                  }
                                  <div>
                                    <p className={`font-bold text-sm md:text-base ${selectedKpi?.is_approved ? 'text-green-800' : 'text-red-800'}`}>
                                      This KPI definition has been {selectedKpi?.is_approved ? 'approved' : 'disapproved'}.
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">
                                      Reviewer comment: {selectedKpi.approval_comment}
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                /* Pending — show comment form + action buttons */
                                <div className="bg-white border border-teal-100 rounded-xl md:rounded-2xl p-5 md:p-8 shadow-xl shadow-teal-900/5 flex flex-col gap-5 md:gap-6 ring-1 ring-teal-500/10">
                                  <div className="space-y-3 md:space-y-4">
                                    <div className="flex items-center gap-2">
                                      <MessageSquare className="h-4 w-4 text-teal-600" />
                                      <Label htmlFor="approval-comment" className="text-[9px] md:text-[10px] font-bold text-teal-600 uppercase tracking-[0.2em]">
                                        Approval Feedback / Comments
                                      </Label>
                                    </div>
                                    <Textarea
                                      id="approval-comment"
                                      placeholder="Enter comments for the department here..."
                                      value={approvalComment}
                                      onChange={(e) => setApprovalComment(e.target.value)}
                                      className="min-h-[80px] md:min-h-[100px] bg-gray-50/50 border-gray-200 focus:border-teal-400 focus:ring-teal-400/10 text-xs md:text-sm italic"
                                      disabled={isProcessing}
                                    />
                                    <p className="text-[9px] md:text-[10px] text-gray-400 italic">* Comment is optional for approval, but mandatory for disapproval</p>
                                  </div>

                                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 md:gap-6 pt-2 border-t border-gray-50">
                                    <div className="text-center sm:text-left hidden md:block">
                                      <p className="text-[10px] font-bold text-teal-600 uppercase tracking-[0.2em] mb-1">Final Decision</p>
                                      <p className="text-xs text-gray-500 font-medium">Please ensure the comment is accurate.</p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                                      <Button
                                        onClick={() => handleDisapprove(selectedKpi.id)}
                                        variant="outline"
                                        disabled={isProcessing}
                                        className="w-full sm:w-auto h-11 md:h-12 px-5 md:px-6 border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold transition-all active:scale-95 rounded-lg md:rounded-xl disabled:opacity-50 text-xs md:text-sm"
                                      >
                                        {isProcessing ? (
                                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                          <XCircle className="h-4 w-4 mr-2" />
                                        )}
                                        Disapprove
                                      </Button>
                                      <Button
                                        onClick={() => handleApprove(selectedKpi.id)}
                                        disabled={isProcessing}
                                        className="w-full sm:w-auto h-11 md:h-12 px-6 md:px-8 bg-green-600 hover:bg-green-700 text-white font-bold transition-all active:scale-95 shadow-lg shadow-green-900/20 rounded-lg md:rounded-xl disabled:opacity-50 text-xs md:text-sm"
                                      >
                                        {isProcessing ? (
                                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                          <CheckCircle className="h-4 w-4 mr-2" />
                                        )}
                                        Approve
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                description={confirmModal.description}
                confirmText={confirmModal.confirmText}
                confirmVariant={confirmModal.confirmVariant}
            />

            {/* Bulk Action Modal */}
            {showBulkModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
                    onClick={() => !isBulkProcessing && setShowBulkModal(false)}
                >
                    <div
                        className="bg-white rounded-xl shadow-2xl w-full max-w-md"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                            <h2 className="text-base font-semibold text-gray-900">
                                Bulk {bulkAction === 'approve' ? 'Approve' : 'Disapprove'} — {selectedIds.size} KPI{selectedIds.size > 1 ? 's' : ''}
                            </h2>
                            <button
                                onClick={() => !isBulkProcessing && setShowBulkModal(false)}
                                className="p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-gray-600">
                                {bulkAction === 'approve'
                                    ? `You are about to approve ${selectedIds.size} KPI definition(s). Add an optional comment below.`
                                    : `You are about to disapprove ${selectedIds.size} KPI definition(s). A reason is required.`}
                            </p>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-gray-700">
                                    Comment {bulkAction === 'disapprove' && <span className="text-red-500">*</span>}
                                </Label>
                                <Textarea
                                    placeholder={bulkAction === 'approve'
                                        ? "Optional comment for all selected KPIs..."
                                        : "Reason for disapproval (required)..."}
                                    value={bulkComment}
                                    onChange={e => setBulkComment(e.target.value)}
                                    className="min-h-[90px] text-sm"
                                    disabled={isBulkProcessing}
                                />
                                {bulkAction === 'disapprove' && (
                                    <p className="text-[10px] text-gray-400 italic">* Minimum 5 characters required</p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
                            <Button
                                variant="outline"
                                onClick={() => setShowBulkModal(false)}
                                disabled={isBulkProcessing}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleBulkSubmit}
                                disabled={isBulkProcessing}
                                className={bulkAction === 'approve'
                                    ? "bg-green-600 hover:bg-green-700 text-white"
                                    : "bg-red-600 hover:bg-red-700 text-white"}
                            >
                                {isBulkProcessing ? (
                                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</>
                                ) : (
                                    bulkAction === 'approve' ? 'Approve All' : 'Disapprove All'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KpiDefinitionReview;
