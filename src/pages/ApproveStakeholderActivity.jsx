import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, FileText, CheckCircle, List, Calendar, User, Eye, Download, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    getStakeholderActivityValuesApi,
    approveStakeholderActivityValueApi,
    disapproveStakeholderActivityValueApi,
} from '../Slices/Utils/Api/stakeholderActivities';
import { getDepartmentApi } from '../Slices/Utils/Api/departments';
import DepartmentSelect from '@/components/ui/DepartmentSelect';
import { useYears } from '@/hooks/use-years';
import { formatNumberWithCommas, getErrorMessage, isPreviewableFile, getAbsoluteFileUrl, forceDownload } from '@/lib/utils';
import { toast } from 'sonner';
import { isAdmin } from '@/lib/roleLabels';
import { DataPagination } from '@/components/ui/data-pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import ConfirmModal from '@/components/ui/ConfirmModal';
import DocumentViewer from '@/components/DocumentViewer';

const MONTH_KEYS = [
    { key: 'jan_value', label: 'Jan' },
    { key: 'feb_value', label: 'Feb' },
    { key: 'mar_value', label: 'Mar' },
    { key: 'apr_value', label: 'Apr' },
    { key: 'may_value', label: 'May' },
    { key: 'jun_value', label: 'Jun' },
    { key: 'jul_value', label: 'Jul' },
    { key: 'aug_value', label: 'Aug' },
    { key: 'sep_value', label: 'Sep' },
    { key: 'oct_value', label: 'Oct' },
    { key: 'nov_value', label: 'Nov' },
    { key: 'dec_value', label: 'Dec' },
];

const QUARTER_KEYS = [
    { key: 'actual_q1', label: 'Q1' },
    { key: 'actual_q2', label: 'Q2' },
    { key: 'actual_q3', label: 'Q3' },
    { key: 'actual_q4', label: 'Q4' },
];

const StakeholderActivityReview = () => {
    const [activityValues, setActivityValues] = useState([]);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [approving, setApproving] = useState(false);
    const [disapproving, setDisapproving] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [reviewerNote, setReviewerNote] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('jan');
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        description: '',
        onConfirm: () => { },
        confirmVariant: 'default',
        confirmText: 'Confirm',
    });
    const [docViewer, setDocViewer] = useState({
        isOpen: false,
        fileUrl: '',
        filename: '',
    });

    const navigate = useNavigate();
    const { user } = useSelector((state) => state.authSlice);

    // Filter states
    const currentYear = new Date().getFullYear().toString();
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedQuarter, setSelectedQuarter] = useState('all');
    // Admins default to "" (All Stakeholders); non-admins default to their own dept
    const [selectedDepartment, setSelectedDepartment] = useState(
        isAdmin(user) ? '' : (user?.department?.id?.toString() || '')
    );
    const [departments, setDepartments] = useState([]);

    const { years: yearsList } = useYears();
    const years =
        yearsList.length > 0
            ? yearsList.map((y) => y?.year?.toString() || '')
            : ['2024', '2025', '2026', '2027'];

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const PER_PAGE = 15;

    // Fetch departments
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await getDepartmentApi({ per_page: 100, type: 'stakeholder' });
                if (response.data && response.data.length > 0) {
                    setDepartments(response.data);
                }
            } catch (_) {
                // silently fail
            }
        };
        fetchDepartments();
    }, []);

    // Fetch unverified stakeholder activity values
    const fetchActivityValues = async (page = 1) => {
        setLoading(true);
        try {
            const params = {
                per_page: PER_PAGE,
                verified: false,
                page,
            };
            if (selectedYear) params.year = selectedYear;
            if (selectedQuarter && selectedQuarter !== 'all') params.quarter = selectedQuarter;
            if (selectedDepartment && selectedDepartment !== 'all') {
                params.department_id = selectedDepartment;
            }

            const response = await getStakeholderActivityValuesApi(params);
            const data = response.data || [];
            setPagination(response.meta?.pagination || null);
            setCurrentPage(page);
            if (data.length > 0) {
                setActivityValues(data);
                setSelectedRecord(data[0]);
            } else {
                setActivityValues([]);
                setSelectedRecord(null);
            }
        } catch (error) {
            toast.error(getErrorMessage(error));
            setActivityValues([]);
            setSelectedRecord(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
        fetchActivityValues(1);
    }, [selectedYear, selectedQuarter, selectedDepartment]);

    // Auto-select first when list changes
    useEffect(() => {
        if (activityValues.length > 0) {
            if (!selectedRecord || !activityValues.find((r) => r.id === selectedRecord.id)) {
                setSelectedRecord(activityValues[0]);
            }
        } else {
            setSelectedRecord(null);
            setShowDetails(false);
        }
    }, [activityValues]);

    const handleSelectRecord = (record) => {
        setSelectedRecord(record);
        setReviewerNote('');
        setSelectedMonth('jan');
        setShowDetails(true);
    };

    const handleBackToList = () => {
        setShowDetails(false);
    };

    // Handle authenticated file viewing
    const handleViewFile = (fileUrl, filename) => {
        setDocViewer({
            isOpen: true,
            fileUrl,
            filename,
        });
    };

    // Handle file downloading
    const handleDownloadFile = (fileUrl, filename) => {
        forceDownload(getAbsoluteFileUrl(fileUrl), filename);
    };

    const handleApprove = () => {
        if (!selectedRecord) return;

        setConfirmModal({
            isOpen: true,
            title: 'Approve Activity',
            description: `Are you sure you want to approve this stakeholder activity (ID #${selectedRecord.id})?`,
            confirmText: 'Approve',
            confirmVariant: 'default',
            onConfirm: async () => {
                setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                setApproving(true);
                try {
                    await approveStakeholderActivityValueApi(selectedRecord.id, {
                        comment: reviewerNote.trim() || '',
                    });
                    toast.success('Activity approved successfully');
                    await fetchActivityValues(currentPage);
                    setReviewerNote('');
                } catch (error) {
                    toast.error(getErrorMessage(error));
                } finally {
                    setApproving(false);
                }
            },
        });
    };

    const handleDisapprove = () => {
        if (!selectedRecord) return;

        setConfirmModal({
            isOpen: true,
            title: 'Disapprove Activity',
            description: `Are you sure you want to disapprove this stakeholder activity (ID #${selectedRecord.id})?`,
            confirmText: 'Disapprove',
            confirmVariant: 'destructive',
            onConfirm: async () => {
                setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                setDisapproving(true);
                try {
                    await disapproveStakeholderActivityValueApi(selectedRecord.id, {
                        comment: reviewerNote.trim() || '',
                    });
                    toast.success('Activity disapproved successfully');
                    await fetchActivityValues(currentPage);
                    setReviewerNote('');
                } catch (error) {
                    toast.error(getErrorMessage(error));
                } finally {
                    setDisapproving(false);
                }
            },
        });
    };

    const formatNum = (val) => {
        if (val === null || val === undefined || val === '') return 'N/A';
        return formatNumberWithCommas(parseFloat(val)) || 'N/A';
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const pendingCount = activityValues.length;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/dashboard/activity-data')}
                    className="p-0 text-gray-600 hover:text-green-700 hover:bg-transparent -ml-1 mb-4 flex items-center gap-2 transition-colors group"
                >
                    <ChevronLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
                    Go Back to Activity Data
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
                            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                                Stakeholder Activity Review & Approval
                            </h1>
                            <p className="text-xs md:text-sm text-gray-500 mt-1">
                                Review and approve stakeholder activity submissions
                            </p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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

                        <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                            <SelectTrigger className="w-[110px] sm:w-[130px]">
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue placeholder="Quarter" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Quarters</SelectItem>
                                <SelectItem value="1">Q1</SelectItem>
                                <SelectItem value="2">Q2</SelectItem>
                                <SelectItem value="3">Q3</SelectItem>
                                <SelectItem value="4">Q4</SelectItem>
                            </SelectContent>
                        </Select>

                        {isAdmin(user) && (
                            <DepartmentSelect
                                value={selectedDepartment}
                                onChange={setSelectedDepartment}
                                type="stakeholder"
                                placeholder="All Stakeholders"
                                allLabel="All Stakeholders"
                                className="w-full sm:w-[280px]"
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative bg-white px-2 sm:px-8">
                {/* Sidebar */}
                <div
                    className={`w-full lg:w-[380px] bg-white border-r border-gray-100 flex flex-col h-full overflow-hidden transition-all duration-300 ${showDetails ? 'hidden lg:flex' : 'flex'
                        }`}
                >
                    <div className="flex-1 flex flex-col min-h-0">
                        {/* Queue Header */}
                        <div className="px-6 py-6 border-b border-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shadow-sm border border-green-100/50">
                                    <List className="w-5 h-5 text-green-700" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-gray-900 text-base">Approval Queue</h2>
                                </div>
                                <span className="ml-auto bg-green-700 text-white text-[11px] font-bold rounded-full px-2 py-0.5 min-w-[20px] h-5 flex items-center justify-center shadow-sm">
                                    {pendingCount}
                                </span>
                            </div>
                        </div>

                        {/* Queue List */}
                        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 custom-scrollbar">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-3">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
                                    <p className="text-xs text-gray-400 font-medium tracking-wide">
                                        Fetching submissions...
                                    </p>
                                </div>
                            ) : activityValues.length === 0 ? (
                                <div className="text-center py-12 px-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                    <FileText className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                                    <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                        No pending stakeholder activity submissions found
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3 pb-8">
                                    {activityValues.map((record) => (
                                        <div
                                            key={record.id}
                                            onClick={() => handleSelectRecord(record)}
                                            className={`cursor-pointer border rounded-lg p-4 transition-all ${selectedRecord?.id === record.id
                                                ? 'bg-green-50 border-green-600'
                                                : 'bg-white border-gray-200 hover:border-green-300'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-xs text-gray-500">
                                                    {record.year || 'N/A'} • ID #{record.id}
                                                </span>
                                            </div>
                                            <h3 className="font-semibold text-gray-900 mb-2 text-sm line-clamp-2">
                                                {record?.title || 'Stakeholder Activity'}
                                            </h3>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-500 truncate mr-2">
                                                    {record.uploaded_by|| 'N/A'}
                                                </span>
                                                <span className="font-bold text-green-700 whitespace-nowrap">
                                                    {formatNum(record.value)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sidebar pagination */}
                        {pagination && pagination.last_page > 1 && (
                            <div className="px-6 pb-4 pt-2 border-t border-gray-100">
                                <DataPagination
                                    currentPage={currentPage}
                                    totalPages={pagination.last_page}
                                    onPageChange={(page) => fetchActivityValues(page)}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Detail Panel */}
                <div
                    className={`flex-1 overflow-y-auto bg-gray-50/30 p-4 md:p-8 custom-scrollbar ${showDetails ? 'block' : 'hidden lg:block'
                        }`}
                >
                    {!selectedRecord ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">
                                    Select a submission from the sidebar to review
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Breadcrumb */}
                            <div className="mb-6">
                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                    <span>{selectedRecord.year || 'N/A'}</span>
                                    <span>›</span>
                                    <span>ID #{selectedRecord.id}</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-2">
                                    {selectedRecord?.title || 'Stakeholder Activity'}
                                </h1>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs sm:text-sm text-gray-500">
                                        Dept: {selectedRecord.department?.name || 'N/A'}
                                    </span>
                                </div>
                            </div>

                            {/* Submitted Value Card */}
                            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 sm:gap-6 mb-6">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6 shadow-sm">
                                    <div className="text-[10px] text-green-600 font-bold uppercase tracking-wider mb-2">
                                        Submitted Value
                                    </div>
                                    <div className="text-2xl sm:text-3xl font-bold text-green-600">
                                        {formatNum(selectedRecord.value)}
                                    </div>
                                </div>
                                {/* <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">
                                        Annual Actual
                                    </div>
                                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                                        {formatNum(selectedRecord.actual_annual)}
                                    </div>
                                </div> */}
                            </div>

                            {/* Monthly Breakdown */}
                            {/* <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                                <h2 className="font-semibold text-gray-900 mb-4">Monthly Breakdown</h2>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-6">
                                    {MONTH_KEYS.map(({ key, label }) => (
                                        <div
                                            key={key}
                                            className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100"
                                        >
                                            <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">
                                                {label}
                                            </div>
                                            <div className="text-sm font-bold text-gray-800">
                                                {formatNum(selectedRecord[key])}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <h3 className="font-semibold text-gray-700 text-sm mb-3">Quarterly Actuals</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {QUARTER_KEYS.map(({ key, label }) => (
                                        <div
                                            key={key}
                                            className="bg-green-50 border border-green-100 rounded-lg p-3 text-center"
                                        >
                                            <div className="text-[10px] text-green-600 font-bold uppercase mb-1">
                                                {label}
                                            </div>
                                            <div className="text-sm font-bold text-green-700">
                                                {formatNum(selectedRecord[key])}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div> */}

                            {/* Submission Info */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <FileText className="w-5 h-5 text-gray-900" />
                                    <h2 className="font-semibold text-gray-900">Submission Details</h2>
                                </div>

                                {/* Department */}
                                <div className="mb-4">
                                    <div className="text-sm text-gray-500 mb-2">Department</div>
                                    <div className="bg-gray-100 rounded-lg p-4">
                                        <p className="text-sm text-gray-900">
                                            {selectedRecord.department?.name || selectedRecord.department || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                {/* Uploaded By */}
                                <div className="mb-4">
                                    <div className="text-sm text-gray-500 mb-2">Uploaded By</div>
                                    <div className="bg-gray-100 rounded-lg p-4 flex items-center gap-3">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                            <User className="w-4 h-4 text-green-700" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {selectedRecord.uploaded_by || 'N/A'}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {selectedRecord.uploaded_by?.email || ''}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Reporting Period */}
                                <div className="mb-4">
                                    <div className="text-sm text-gray-500 mb-2">Tracking Period</div>
                                    <div className="bg-gray-100 rounded-lg p-4">
                                        <p className="text-sm text-gray-900">
                                            {formatDate(selectedRecord.tracking_date_start)} - {formatDate(selectedRecord.tracking_date_end)}
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <div className="text-sm text-gray-500 mb-2">Title</div>
                                    <div className="bg-gray-100 rounded-lg p-4">
                                        <p className="text-sm text-gray-900">
                                            {selectedRecord.title}
                                        </p>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <div className="text-sm text-gray-500 mb-2">Remark</div>
                                    <div className="bg-gray-100 rounded-lg p-4">
                                        <p className="text-sm text-gray-900">
                                            {selectedRecord.remarks}
                                        </p>
                                    </div>
                                </div>


                                <div className="mb-4">
                                    <div className="text-sm text-gray-500 mb-2">Address</div>
                                    <div className="bg-gray-100 rounded-lg p-4">
                                        <p className="text-sm text-gray-900">
                                            {selectedRecord.address || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <div className="text-sm text-gray-500 mb-2">Local Government</div>
                                    <div className="bg-gray-100 rounded-lg p-4">
                                        <p className="text-sm text-gray-900">
                                            {selectedRecord.lga || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <div className="text-sm text-gray-500 mb-2">State</div>
                                    <div className="bg-gray-100 rounded-lg p-4">
                                        <p className="text-sm text-gray-900">
                                            {selectedRecord.state || 'N/A'}
                                        </p>
                                    </div>
                                </div>


                                {/* Submitted At */}
                                <div>
                                    <div className="text-sm text-gray-500 mb-2">Submitted At</div>
                                    <div className="bg-gray-100 rounded-lg p-4">
                                        <p className="text-sm text-gray-900">
                                            {formatDate(selectedRecord.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Evidence Files */}
                            {selectedRecord.evidences && selectedRecord.evidences.length > 0 && (
                                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <FileText className="w-5 h-5 text-gray-900" />
                                        <h2 className="font-semibold text-gray-900">Evidence Files</h2>
                                        <span className="ml-2 bg-green-100 text-green-700 text-xs font-bold rounded-full px-2 py-0.5">
                                            {selectedRecord.evidences.length}
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        {selectedRecord.evidences.map((evidence, index) => (
                                            <div
                                                key={evidence.id || index}
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
                                                                        <span>Month: {MONTH_KEYS[evidence.month - 1]?.label || 'N/A'}</span>
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
                                                            disabled={false}
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

                            {/* Review Decision */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                                {/* <h2 className="font-semibold text-gray-900 mb-4">Review Decision</h2> */}

                                {/* Month Selector */}
                                {/* <div className="mb-4">
                                    <label className="text-sm text-gray-500 mb-2 block">Select Month</label>
                                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                        <SelectTrigger className="w-full sm:w-[180px]">
                                            <SelectValue placeholder="Month" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[
                                                { value: 'jan', label: 'January' },
                                                { value: 'feb', label: 'February' },
                                                { value: 'mar', label: 'March' },
                                                { value: 'apr', label: 'April' },
                                                { value: 'may', label: 'May' },
                                                { value: 'jun', label: 'June' },
                                                { value: 'jul', label: 'July' },
                                                { value: 'aug', label: 'August' },
                                                { value: 'sep', label: 'September' },
                                                { value: 'oct', label: 'October' },
                                                { value: 'nov', label: 'November' },
                                                { value: 'dec', label: 'December' },
                                            ].map((m) => (
                                                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div> */}

                                <div className="mb-2">
                                    <label className="text-sm text-gray-500">
                                        Comment <span className="text-xs text-muted-foreground">(Optional)</span>
                                    </label>
                                </div>
                                <textarea
                                    value={reviewerNote}
                                    onChange={(e) => setReviewerNote(e.target.value)}
                                    className="w-full h-28 border border-gray-300 rounded-lg p-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-600 resize-none"
                                    placeholder="Enter a comment for this decision (optional)..."
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                <button
                                    onClick={handleApprove}
                                    disabled={approving || disapproving}
                                    className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {approving ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    ) : (
                                        <CheckCircle className="w-5 h-5" />
                                    )}
                                    {approving ? 'Approving...' : 'Approve Activity'}
                                </button>
                                <button
                                    onClick={handleDisapprove}
                                    disabled={approving || disapproving}
                                    className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {disapproving ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    ) : (
                                        <span className="text-lg leading-none">✕</span>
                                    )}
                                    {disapproving ? 'Disapproving...' : 'Disapprove Activity'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                title={confirmModal.title}
                description={confirmModal.description}
                onConfirm={confirmModal.onConfirm}
                confirmText={confirmModal.confirmText}
                confirmVariant={confirmModal.confirmVariant}
            />

            <DocumentViewer
                isOpen={docViewer.isOpen}
                fileUrl={docViewer.fileUrl}
                filename={docViewer.filename}
                onClose={() => setDocViewer((prev) => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
};

export default StakeholderActivityReview;
