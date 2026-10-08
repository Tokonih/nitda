import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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
    Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
    fetchStakeholderActivityValues,
    createStakeholderActivityValueUploadMonth,
    updateStakeholderActivityValue,
} from "../Slices/stakeholderActivitiesSlice";
import { fetchPillars } from "../Slices/pillarSlice";
import { fetchAllKpiOpenPeriod } from "../Slices/kpiSlice";
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
import {
    formatNumberWithCommas,
    getFormattedUnit,
    isPreviewableFile,
    getAbsoluteFileUrl,
    forceDownload,
    stripCommas
} from '@/lib/utils';
import DocumentViewer from "@/components/DocumentViewer";

const StakeholderActivityDataEntry = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.authSlice);
    const userDepartment = user?.department?.id || "";
    const { toast } = useToast();
    const isStakeholderUser = isStakeholder(user);

    const {
        list: pillarsList,
    } = useSelector((state) => state.pillars);

    const {
        values: stakeholderValues,
        loading,
        error,
    } = useSelector((state) => state.stakeholderActivities);

    const { openPeriods } = useSelector((state) => state.kpi);

    // Period selection state
    const { years: yearsList } = useYears();
    const now = new Date();
    const currentYear = now.getFullYear().toString();
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedQuarter, setSelectedQuarter] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");

    // activity data entry state
    const [selectedActivity, setSelectedActivity] = useState("");
    const [activityValue, setActivityValue] = useState("");
    const [remarks, setRemarks] = useState("");

    // Submissions filter state
    const [filterYear, setFilterYear] = useState("2026");
    const [filterQuarter, setFilterQuarter] = useState("all");

    // Modal state
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState(null);

    // Edit Modal state
    const [showEditModal, setShowEditModal] = useState(false);
    const [editSubmission, setEditSubmission] = useState(null);
    const [editValue, setEditValue] = useState("");
    const [editRemarks, setEditRemarks] = useState("");
    const [editTitle, setEditTitle] = useState("");
    const [editAddress, setEditAddress] = useState("");
    const [editState, setEditState] = useState("");
    const [editLga, setEditLga] = useState("");
    const [editTrackingStart, setEditTrackingStart] = useState("");
    const [editTrackingEnd, setEditTrackingEnd] = useState("");
    const [evidenceFile, setEvidenceFile] = useState(null);
    const [editEvidenceFile, setEditEvidenceFile] = useState(null);

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

    // Fetch Pillars when page loads (stakeholders now select pillars)
    useEffect(() => {
        if (userDepartment) {
            dispatch(fetchPillars({ visible_to_stakeholders: true, per_page: 100 }));
        }
    }, [dispatch, userDepartment, selectedYear]);

    // Fetch activity values when filters change
    useEffect(() => {
        if (userDepartment) {
            const params = { department_id: userDepartment };
            if (filterYear) params.year = filterYear;
            if (filterQuarter !== "all") params.quarter = filterQuarter;
            dispatch(fetchStakeholderActivityValues(params));
        }
    }, [dispatch, filterYear, filterQuarter, userDepartment]);

    useEffect(() => {
        if (selectedActivity && selectedYear) {
            dispatch(
                fetchAllKpiOpenPeriod({ year: selectedYear, period_type: "quarter" })
            );
        }
    }, [dispatch, selectedActivity, selectedYear]);

    // Transform values data for display - one row per month that has a value
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

    const submissions = (stakeholderValues || []).flatMap((val) => {
        const activity = val.stakeholder_activity || {};
        const department = val.department?.name || "Unknown Department";
        const objective = val.stakeholder_srap_objective?.name || "No objective";
        const flags = val.month_approval_flags || {};
        const year = val.year || new Date().getFullYear();

        const quarterTargets = {
            Q1: activity.target_q1,
            Q2: activity.target_q2,
            Q3: activity.target_q3,
            Q4: activity.target_q4,
        };

        return MONTH_KEYS
            .filter(({ key }) => val[key] !== null && val[key] !== undefined)
            .map(({ key, flag, num, name: monthName }) => {
                const quarter = num <= 3 ? "Q1" : num <= 6 ? "Q2" : num <= 9 ? "Q3" : "Q4";
                const monthValue = val[key];
                const target = quarterTargets[quarter] || activity.target_value;
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
                    activityId: activity.id || "",
                    monthNumber: num,
                    monthName,
                    reportingPeriod: `${year}-${String(num).padStart(2, "0")}-${new Date(year, num, 0).getDate()}`,
                    department,
                    objective,
                    activity: activity.name || val.title || "Unknown Activity",
                    quarter,
                    month: monthName,
                    year,
                    value: monthValue,
                    status: status,
                    grade: val.grade || "-",
                    target: target || 0,
                    achieved: monthValue || 0,
                    unit: activity.unit || "",
                    remarks: val.remarks || "No remarks",
                    submittedBy: val.uploaded_by?.name || val.uploaded_by || "Unknown",
                    submittedDate: new Date(val.created_at).toLocaleDateString("en-US", {
                        month: "long", day: "numeric", year: "numeric",
                    }),
                    sortCreatedAt: val.created_at || val.stakeholder_activity?.created_at || new Date().toISOString(),
                    evidence: val.evidence_path ? val.evidence_path.split('/').pop() : null,
                    evidenceSize: null,
                    evidenceUrl: val.evidence_url || null,
                    // Full record fields needed for edit pre-population
                    title: val.title || '',
                    address: val.address || '',
                    state: val.state || '',
                    lga: val.lga || '',
                    trackingDateStart: val.tracking_date_start || null,
                    trackingDateEnd: val.tracking_date_end || null,
                    evidences: val.evidences || [],
                };
            });
    });

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

    const selectedActivityDetails = pillarsList?.find(
        (a) => (a.id?.toString() || "") === selectedActivity
    );

    const getQuarterStats = () => {
        return ["Q1", "Q2", "Q3", "Q4"].map((q) => {
            const quarterSubmissions = submissions.filter((s) =>
                s?.quarter === q && (!selectedActivity || (s?.activityId?.toString() || "") === selectedActivity)
            );
            const approved = quarterSubmissions.filter((s) => s.status === "approved").length;
            const pending = quarterSubmissions.filter((s) => s.status === "pending").length;
            return { quarter: q, total: quarterSubmissions.length, approved, pending };
        });
    };

    const getQuarterlyAggregation = () => {
        if (!selectedActivity || !selectedQuarter) return [];

        const months = getMonthsForQuarter(selectedQuarter);
        return months.map((month) => {
            const record = stakeholderValues?.find((val) => {
                const id = val.stakeholder_activity?.id || val.stakeholder_activity_id;
                return id?.toString() === selectedActivity;
            });

            if (!record) return { month, value: 0 };

            const monthsOfYear = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];
            const monthIndex = monthsOfYear.indexOf(month);
            const monthValueKeys = [
                "jan_value", "feb_value", "mar_value", "apr_value", "may_value", "jun_value",
                "jul_value", "aug_value", "sep_value", "oct_value", "nov_value", "dec_value"
            ];
            const val = parseFloat(record[monthValueKeys[monthIndex]] || 0);

            return { month, value: val };
        });
    };

    const handleQuarterChange = (quarter) => {
        setSelectedQuarter(quarter);
        setSelectedMonth("");
    };


    // Find a previously submitted entry for the current selections
    const existingSubmission = (selectedActivity && selectedQuarter && selectedMonth && selectedYear)
        ? submissions.find(s =>
            s.activityId?.toString() === selectedActivity &&
            s.quarter === selectedQuarter &&
            s.monthName === selectedMonth &&
            s.year?.toString() === selectedYear
        ) || null
        : null;

    // Auto-populate form when an existing submission is found
    useEffect(() => {
        if (existingSubmission) {
            setActivityValue(formatNumberWithCommas(existingSubmission.value));
            setRemarks(existingSubmission.remarks === "No remarks" ? "" : (existingSubmission.remarks || ""));
            setEvidenceFile(null);
        } else {
            // Clear form when switching to an unsubmitted month
            setActivityValue("");
            setRemarks("");
            setEvidenceFile(null);
        }
    }, [selectedActivity, selectedQuarter, selectedMonth, selectedYear]); // existingSubmission is derived from these

    const handleSaveDraft = () => {
        toast({ title: "Draft saved", description: "Your entry has been saved as draft." });
    };

    const handleSubmit = async () => {
        if (!selectedActivity || !activityValue || !selectedYear || !selectedQuarter || !selectedMonth) {
            toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
            return;
        }

        try {
            const formData = new FormData();
            // Stakeholders now submit with pillar_id instead of stakeholder_activity_id
            formData.append("pillar_id", selectedActivity);
            formData.append("department_id", userDepartment);

            // Month name (e.g. "january")
            formData.append("month", selectedMonth.toLowerCase());
            formData.append("value", stripCommas(activityValue));

            // Calculate month number and reporting_period (last day of that month)
            const monthIndex = getMonthsForQuarter(selectedQuarter).indexOf(selectedMonth);
            const quarterMonthNumber = (selectedQuarter === "Q1" ? 0 : selectedQuarter === "Q2" ? 3 : selectedQuarter === "Q3" ? 6 : 9) + monthIndex + 1;
            const lastDayOfMonth = new Date(selectedYear, quarterMonthNumber, 0).getDate();
            const reportingPeriod = `${selectedYear}-${String(quarterMonthNumber).padStart(2, "0")}-${lastDayOfMonth}`;

            formData.append("reporting_period", reportingPeriod);
            formData.append("year", selectedYear);
            // remarks is optional - only append if provided
            if (remarks) formData.append("remarks", remarks);
            // evidence is optional
            if (evidenceFile) formData.append("evidence", evidenceFile);

            await dispatch(createStakeholderActivityValueUploadMonth(formData)).unwrap();

            toast({ title: "Activity submitted successfully!", description: "Your activity value has been submitted for review." });

            setSelectedActivity("");
            setActivityValue("");
            setRemarks("");
            setEvidenceFile(null);

            if (userDepartment) {
                dispatch(fetchStakeholderActivityValues({ department_id: userDepartment, year: filterYear }));
            }
        } catch (err) {
            toast({ title: "Error", description: err?.message || "Something went wrong", variant: "destructive" });
        }
    };

    const handleEditClick = (submission) => {
        setEditSubmission(submission);
        setEditValue(formatNumberWithCommas(submission.value));
        setEditRemarks(submission.remarks === "No remarks" ? "" : (submission.remarks || ""));
        setEditTitle(submission.title || "");
        setEditAddress(submission.address || "");
        setEditState(submission.state || "");
        setEditLga(submission.lga || "");
        // Convert ISO datetime to YYYY-MM-DD for date inputs
        setEditTrackingStart(submission.trackingDateStart ? submission.trackingDateStart.substring(0, 10) : "");
        setEditTrackingEnd(submission.trackingDateEnd ? submission.trackingDateEnd.substring(0, 10) : "");
        setEditEvidenceFile(null);
        setShowEditModal(true);
    };

    const handleUpdate = async () => {
        if (!editSubmission || !editValue) {
            toast({ title: "Missing fields", description: "Value is required.", variant: "destructive" });
            return;
        }

        if (!editEvidenceFile) {
            toast({ title: "Evidence required", description: "Please upload an evidence file to update this submission.", variant: "destructive" });
            return;
        }

        try {
            const formData = new FormData();
            formData.append("stakeholder_activity_id", editSubmission.activityId);
            formData.append("month", editSubmission.monthName.toLowerCase());
            formData.append("reporting_period", editSubmission.reportingPeriod);
            formData.append("value", stripCommas(editValue));
            if (editRemarks) formData.append("remarks", editRemarks);
            if (editTitle) formData.append("title", editTitle);
            if (editAddress) formData.append("address", editAddress);
            if (editState) formData.append("state", editState);
            if (editLga) formData.append("lga", editLga);
            if (editTrackingStart) formData.append("tracking_date_start", editTrackingStart);
            if (editTrackingEnd) formData.append("tracking_date_end", editTrackingEnd);
            formData.append("year", editSubmission.year);
            formData.append("evidence", editEvidenceFile);

            await dispatch(updateStakeholderActivityValue({ id: editSubmission.kpiValueId, data: formData })).unwrap();

            toast({ title: "Updated successfully", description: "Activity submission has been updated." });
            setShowEditModal(false);
            setEditSubmission(null);
            setEditEvidenceFile(null);
            setEditTitle(""); setEditAddress(""); setEditState(""); setEditLga("");
            setEditTrackingStart(""); setEditTrackingEnd("");

            if (userDepartment) {
                dispatch(fetchStakeholderActivityValues({ department_id: userDepartment, year: filterYear }));
            }
        } catch (err) {
            toast({ title: "Update failed", description: err?.message || "Something went wrong", variant: "destructive" });
        }
    };

    const handleViewDetails = (submission) => {
        setSelectedSubmission(submission);
        setShowDetailsModal(true);
    };

    const filteredSubmissions = submissions.filter((sub) => {
        if (filterQuarter !== "all" && sub.quarter !== filterQuarter) return false;
        return true;
    }).sort((a, b) => new Date(b.sortCreatedAt) - new Date(a.sortCreatedAt));

    const quarterStats = getQuarterStats();
    const quarterlyData = getQuarterlyAggregation();
    const totalSubmitted = quarterlyData.reduce((acc, curr) => acc + curr.value, 0);

    const getQuarterTarget = () => {
        if (!selectedActivityDetails || !selectedQuarter) return 0;
        switch (selectedQuarter) {
            case "Q1": return selectedActivityDetails.target_q1 || selectedActivityDetails.target || 0;
            case "Q2": return selectedActivityDetails.target_q2 || selectedActivityDetails.target || 0;
            case "Q3": return selectedActivityDetails.target_q3 || selectedActivityDetails.target || 0;
            case "Q4": return selectedActivityDetails.target_q4 || selectedActivityDetails.target || 0;
            default: return selectedActivityDetails.target || 0;
        }
    };

    const quarterTarget = getQuarterTarget();
    const progressPercentage = quarterTarget > 0 ? ((totalSubmitted / quarterTarget) * 100).toFixed(1) : "0.0";

    const monthsInQuarter = getMonthsForQuarter(selectedQuarter);
    const submittedMonths = submissions.filter(s =>
        s.activityId?.toString() === selectedActivity &&
        s.quarter === selectedQuarter &&
        monthsInQuarter.includes(s.monthName)
    );
    const uniqueMonthsCount = new Set(submittedMonths.map(s => s.monthName)).size;
    const isQuarterComplete = uniqueMonthsCount >= 3;

    return (
        <div className="space-y-6">
            <Button
                variant="ghost" size="sm"
                onClick={() => navigate("/dashboard/stakeholder-dashboard")}
                className="p-0 text-gray-600 hover:text-green-700 hover:bg-transparent -ml-1 mb-4 flex items-center gap-2 transition-colors group"
            >
                <ChevronLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
                Go Back to Dashboard
            </Button>

            <div>
                <h1 className="text-3xl font-bold">Activity Data Entry</h1>
                <p className="text-muted-foreground mt-2">
                    Submit and monitor performance data for your activities.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-green-600" />
                                Select Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="activity">Activity *</Label>
                                <select
                                    id="activity"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                                    value={selectedActivity}
                                    onChange={(e) => setSelectedActivity(e.target.value)}
                                    disabled={!pillarsList || pillarsList.length === 0}
                                >
                                    {(!pillarsList || pillarsList.length === 0) ? (
                                        <option value="">No pillars available</option>
                                    ) : (
                                        <>
                                            <option value="">Choose a pillar</option>
                                            {pillarsList.map((p) => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </>
                                    )}
                                </select>
                            </div>

                            {(!pillarsList || pillarsList.length === 0) && !loading && (
                                <div className="mt-4 p-4 border-2 border-dashed rounded-lg bg-muted/5 text-center">
                                    <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                                    <p className="text-sm text-muted-foreground">
                                        There are no pillars available for your department.
                                        Please contact your administrator if this is an error.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {selectedActivity && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-green-600" />
                                    Period Selection
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="year">Select Year</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                    >
                                        {yearsList?.map((yr) => (
                                            <option key={yr.id} value={yr.year}>{yr.year}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="quarter">Select Quarter</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                        value={selectedQuarter}
                                        onChange={(e) => handleQuarterChange(e.target.value)}
                                    >
                                        <option value="">Choose a quarter</option>
                                        {["Q1", "Q2", "Q3", "Q4"].map((q) => {
                                            const isOpen = isQuarterOpen(q);
                                            return <option key={q} value={q} disabled={!isOpen}>{q} {!isOpen && "(closed)"}</option>
                                        })}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="month">Select Month</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                        disabled={!selectedQuarter || !isMonthOpen()}
                                    >
                                        <option value="">Choose a month</option>
                                        {getMonthsForQuarter(selectedQuarter).map((m) => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {selectedActivity && selectedQuarter && selectedMonth && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Data Entry</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {existingSubmission && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                                        <p className="text-sm text-yellow-800 flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            <span>
                                                Previously submitted. Data has been pre-filled from your {existingSubmission.monthName} {existingSubmission.year} submission. To make changes, please use the <strong>Edit</strong> button in the history table below.
                                            </span>
                                        </p>
                                    </div>
                                )}

                                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                                    <p className="text-sm text-green-800 font-semibold">
                                        Quarter Target: {parseFloat(quarterTarget).toLocaleString()}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="value">Value <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="value"
                                        placeholder="Enter value"
                                        inputMode="numeric"
                                        value={activityValue}
                                        onChange={(e) => {
                                            const stripped = e.target.value.replace(/[^0-9]/g, "");
                                            setActivityValue(formatNumberWithCommas(stripped));
                                        }}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="remarks">Remarks</Label>
                                    <Textarea
                                        id="remarks"
                                        placeholder="Enter any relevant remarks or comments..."
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="evidence">Evidence <span className="text-xs text-muted-foreground">(optional)</span></Label>
                                    <Input
                                        id="evidence"
                                        type="file"
                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                                        onChange={(e) => setEvidenceFile(e.target.files[0] || null)}
                                        className="cursor-pointer"
                                    />
                                    {evidenceFile && (
                                        <p className="text-xs text-green-700">{evidenceFile.name} selected</p>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={handleSaveDraft}
                                        className="flex-1"
                                    >
                                        Save Draft
                                    </Button>
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={loading || !isMonthOpen() || !!existingSubmission}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        {loading ? "Submitting…" : "Submit Activity"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Quarter Overview</CardTitle></CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                {quarterStats.map((stat) => (
                                    <div key={stat.quarter} className="border rounded-lg p-4 text-center">
                                        <div className="text-sm font-medium mb-2">{stat.quarter}</div>
                                        <div className="text-3xl font-bold">{stat.total}</div>
                                        <div className="text-xs mt-2 text-green-600">{stat.approved} approved</div>
                                        {stat.pending > 0 && <div className="text-xs text-yellow-600">{stat.pending} pending</div>}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {selectedQuarter && quarterlyData.length > 0 && (
                        <Card>
                            <CardHeader><CardTitle>Progress - {selectedQuarter} {selectedYear}</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span>Progress</span>
                                    <span className="font-semibold">{totalSubmitted} / {quarterTarget} ({progressPercentage}%)</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-green-600 h-2 rounded-full" style={{ width: `${Math.min(progressPercentage, 100)}%` }} />
                                </div>
                                <p className="text-sm font-medium">{uniqueMonthsCount} of 3 months submitted</p>
                                <div className="h-[200px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={quarterlyData}>
                                            <XAxis dataKey="month" hide />
                                            <YAxis hide />
                                            <Tooltip />
                                            <Bar dataKey="value" fill="#16a34a" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-green-600" />
                        Activity Submission History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                            <Label>Filter Year</Label>
                            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
                                {yearsList?.map((yr) => (
                                    <option key={yr.id} value={yr.year}>{yr.year}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Filter Quarter</Label>
                            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={filterQuarter} onChange={(e) => setFilterQuarter(e.target.value)}>
                                <option value="all">All Quarters</option>
                                <option value="Q1">Q1</option><option value="Q2">Q2</option><option value="Q3">Q3</option><option value="Q4">Q4</option>
                            </select>
                        </div>
                    </div>

                    <div className="border rounded-md overflow-x-auto w-full">
                        <table className="w-full min-w-[800px] text-sm text-left">
                            <thead className="bg-muted text-muted-foreground whitespace-nowrap">
                                <tr>
                                    <th className="text-left p-3 text-sm font-medium">Quarter</th>
                                    <th className="text-left p-3 text-sm font-medium">Month</th>
                                    <th className="text-left p-3 text-sm font-medium">Activity</th>
                                    <th className="text-left p-3 text-sm font-medium">Value</th>
                                    <th className="text-left p-3 text-sm font-medium">Status</th>
                                    <th className="text-left p-3 text-sm font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSubmissions.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center p-6 text-muted-foreground">No submissions found</td></tr>
                                ) : (
                                    filteredSubmissions.map((sub) => (
                                        <tr key={sub.id} className="border-t hover:bg-muted/50 transition-colors">
                                            <td className="p-3 text-sm">{sub.quarter}</td>
                                            <td className="p-3 text-sm">{sub.month}</td>
                                            <td className="p-3 text-sm">{sub.activity}</td>
                                            <td className="p-3 text-sm font-medium">{formatNumberWithCommas(sub.value)}</td>
                                            <td className="p-3 text-sm">
                                                <Badge className={
                                                    sub.status === "approved"
                                                        ? "bg-green-100 text-green-700"
                                                        : sub.status === "disapproved"
                                                            ? "bg-red-100 text-red-700"
                                                            : "bg-yellow-100 text-yellow-700"
                                                }>
                                                    {sub.status}
                                                </Badge>
                                            </td>
                                            <td className="p-3 text-sm">
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => handleViewDetails(sub)}><Eye className="h-4 w-4" /></Button>
                                                    <Button size="sm" variant="outline" disabled={sub.status === "approved"} onClick={() => handleEditClick(sub)}><Pencil className="h-4 w-4" /></Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Modals and Document Viewer (simplified for brevity, can be expanded as needed) */}
            {showEditModal && editSubmission && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full my-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">Edit Submission</h2>
                            <Button variant="ghost" size="icon" onClick={() => setShowEditModal(false)}><XIcon className="h-5 w-5" /></Button>
                        </div>
                        <div className="space-y-4">
                            {/* Activity / Period header */}
                            <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 rounded-lg p-3">
                                <div>
                                    <p className="text-muted-foreground text-xs uppercase tracking-wide">Pillar</p>
                                    <p className="font-medium text-sm">{editSubmission.activity}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs uppercase tracking-wide">Period</p>
                                    <p className="font-medium text-sm">{editSubmission.quarter} {editSubmission.year} — {editSubmission.month}</p>
                                </div>
                            </div>

                            {/* Title */}
                            <div className="space-y-2">
                                <Label>Activity Title</Label>
                                <Input
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    placeholder="e.g. Digital Training"
                                />
                            </div>

                            {/* Value */}
                            <div className="space-y-2">
                                <Label>Value <span className="text-red-500">*</span></Label>
                                <Input
                                    value={editValue}
                                    inputMode="numeric"
                                    onChange={(e) => {
                                        const stripped = e.target.value.replace(/[^0-9]/g, "");
                                        setEditValue(formatNumberWithCommas(stripped));
                                    }}
                                    placeholder="Enter value"
                                />
                            </div>

                            {/* Tracking Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tracking Date Start</Label>
                                    <Input
                                        type="date"
                                        value={editTrackingStart}
                                        onChange={(e) => setEditTrackingStart(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tracking Date End</Label>
                                    <Input
                                        type="date"
                                        value={editTrackingEnd}
                                        onChange={(e) => setEditTrackingEnd(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Address */}
                            <div className="space-y-2">
                                <Label>Address</Label>
                                <Input
                                    value={editAddress}
                                    onChange={(e) => setEditAddress(e.target.value)}
                                    placeholder="e.g. Wuse, Abuja"
                                />
                            </div>

                            {/* State & LGA */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>State</Label>
                                    <Input
                                        value={editState}
                                        onChange={(e) => setEditState(e.target.value)}
                                        placeholder="e.g. Lagos"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>LGA</Label>
                                    <Input
                                        value={editLga}
                                        onChange={(e) => setEditLga(e.target.value)}
                                        placeholder="e.g. Eti Osa"
                                    />
                                </div>
                            </div>

                            {/* Remarks */}
                            <div className="space-y-2">
                                <Label>Remarks</Label>
                                <Textarea value={editRemarks} onChange={(e) => setEditRemarks(e.target.value)} rows={3} />
                            </div>

                            {/* Hidden file input - always in DOM */}
                            <input
                                id="sa-edit-file-upload"
                                type="file"
                                className="hidden"
                                onChange={(e) => setEditEvidenceFile(e.target.files[0] || null)}
                                accept=".pdf,.png,.jpg,.jpeg,.xls,.xlsx,.doc,.docx"
                            />

                            <div className="space-y-2">
                                <Label>Evidence File (Required) <span className="text-red-500">*</span></Label>
                                {/* Current evidence card */}
                                {editSubmission.evidence && !editEvidenceFile && (
                                    <div className="border-2 border-amber-200 rounded-lg p-6 bg-amber-50">
                                        <div className="mb-3">
                                            <p className="text-sm font-semibold text-amber-800 mb-1">Current Evidence</p>
                                            <p className="text-xs text-amber-700">To update this submission, you must re-upload the evidence file or provide a new one.</p>
                                        </div>
                                        <div className="flex items-center gap-4 mb-3">
                                            <div className="bg-white p-4 rounded-lg">
                                                <FileText className="h-10 w-10 text-amber-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{editSubmission.evidence}</p>
                                                <p className="text-sm text-gray-600">{editSubmission.evidenceSize}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <TooltipProvider>
                                                <UITooltip>
                                                    <TooltipTrigger asChild>
                                                        <span>
                                                            <Button
                                                                variant="outline" size="sm"
                                                                disabled={!isPreviewableFile(editSubmission.evidence)}
                                                                onClick={() => {
                                                                    if (isPreviewableFile(editSubmission.evidence)) {
                                                                        handleViewFile(getAbsoluteFileUrl(editSubmission.evidenceUrl), editSubmission.evidence);
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
                                                                In-app preview supports PDF, PNG, JPG, and JPEG only. Please download to view.
                                                            </p>
                                                        </TooltipContent>
                                                    )}
                                                </UITooltip>
                                            </TooltipProvider>
                                            <Button
                                                variant="outline" size="sm"
                                                onClick={() => forceDownload(getAbsoluteFileUrl(editSubmission.evidenceUrl), editSubmission.evidence)}
                                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-300"
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                Download
                                            </Button>
                                            <Button
                                                variant="outline" size="sm"
                                                className="ml-auto text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-300"
                                                onClick={() => document.getElementById("sa-edit-file-upload").click()}
                                            >
                                                <Upload className="h-4 w-4 mr-2" />
                                                Replace Evidence
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* New file selected */}
                                {editEvidenceFile ? (
                                    <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-green-800">New file: {editEvidenceFile.name}</p>
                                            <p className="text-xs text-green-700">{(editEvidenceFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => setEditEvidenceFile(null)} className="text-red-600 hover:text-red-700 hover:bg-red-50">Cancel</Button>
                                    </div>
                                ) : !editSubmission.evidence && (
                                    <div>
                                        <p className="text-sm text-amber-600 italic font-medium">Note: An evidence file is required for this update.</p>
                                        <Button
                                            variant="outline" size="sm"
                                            className="mt-2 w-full border-dashed border-2 hover:bg-amber-50"
                                            onClick={() => document.getElementById("sa-edit-file-upload").click()}
                                        >
                                            <Upload className="h-4 w-4 mr-2" />
                                            Select Evidence File
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* All uploaded evidences */}
                            {editSubmission.evidences?.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Uploaded Evidence Files ({editSubmission.evidences.length})</Label>
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                        {editSubmission.evidences.map((ev) => (
                                            <div key={ev.id} className="flex items-center justify-between gap-2 border rounded-lg px-3 py-2 bg-muted/20">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                                                    <span className="text-xs font-medium truncate">{ev.filename}</span>
                                                    <span className="text-[10px] text-muted-foreground shrink-0">
                                                        {(ev.size_bytes / 1024).toFixed(0)} KB
                                                    </span>
                                                </div>
                                                <div className="flex gap-1 shrink-0">
                                                    {isPreviewableFile(ev.filename) && (
                                                        <Button
                                                            variant="ghost" size="icon"
                                                            className="h-7 w-7"
                                                            onClick={() => handleViewFile(getAbsoluteFileUrl(ev.url), ev.filename)}
                                                        >
                                                            <Eye className="h-3.5 w-3.5 text-teal-600" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost" size="icon"
                                                        className="h-7 w-7"
                                                        onClick={() => forceDownload(getAbsoluteFileUrl(ev.url), ev.filename)}
                                                    >
                                                        <Download className="h-3.5 w-3.5 text-blue-600" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2 pt-4">
                                <Button variant="outline" onClick={() => { setShowEditModal(false); setEditTitle(""); setEditAddress(""); setEditState(""); setEditLga(""); setEditTrackingStart(""); setEditTrackingEnd(""); }} className="flex-1">Cancel</Button>
                                <Button
                                    onClick={handleUpdate}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                    disabled={loading || !editEvidenceFile}
                                >
                                    {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Updating...</> : "Update Submission"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showDetailsModal && selectedSubmission && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full my-4">
                        <div className="flex justify-between mb-6">
                            <h2 className="text-2xl font-bold">Submission Details</h2>
                            <Button variant="ghost" size="icon" onClick={() => setShowDetailsModal(false)}><XIcon className="h-5 w-5" /></Button>
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Period</p>
                                    <p className="font-semibold text-lg">{selectedSubmission.quarter} {selectedSubmission.year} - {selectedSubmission.month}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <Badge className={
                                        selectedSubmission.status === "approved" ? "bg-green-100 text-green-700"
                                            : selectedSubmission.status === "disapproved" ? "bg-red-100 text-red-700"
                                                : "bg-yellow-100 text-yellow-700"
                                    }>{selectedSubmission.status}</Badge>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Activity Name</p>
                                <p className="font-semibold">{selectedSubmission.activity}</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-4 bg-gray-50 rounded-lg px-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Target</p>
                                    <p className="font-bold text-lg">{formatNumberWithCommas(selectedSubmission.target)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Achieved</p>
                                    <p className="font-bold text-lg text-green-600">{formatNumberWithCommas(selectedSubmission.achieved)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Grade</p>
                                    <p className="font-bold text-lg">{selectedSubmission.grade}</p>
                                </div>
                            </div>
                            {/* Tracking Dates & Location */}
                            {(selectedSubmission.trackingDateStart || selectedSubmission.state || selectedSubmission.lga) && (
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    {selectedSubmission.trackingDateStart && (
                                        <div>
                                            <p className="text-muted-foreground text-xs mb-0.5">Tracking Start</p>
                                            <p className="font-medium">{selectedSubmission.trackingDateStart.substring(0, 10)}</p>
                                        </div>
                                    )}
                                    {selectedSubmission.trackingDateEnd && (
                                        <div>
                                            <p className="text-muted-foreground text-xs mb-0.5">Tracking End</p>
                                            <p className="font-medium">{selectedSubmission.trackingDateEnd.substring(0, 10)}</p>
                                        </div>
                                    )}
                                    {selectedSubmission.state && (
                                        <div>
                                            <p className="text-muted-foreground text-xs mb-0.5">State</p>
                                            <p className="font-medium">{selectedSubmission.state}</p>
                                        </div>
                                    )}
                                    {selectedSubmission.lga && (
                                        <div>
                                            <p className="text-muted-foreground text-xs mb-0.5">LGA</p>
                                            <p className="font-medium">{selectedSubmission.lga}</p>
                                        </div>
                                    )}
                                    {selectedSubmission.address && (
                                        <div className="col-span-2">
                                            <p className="text-muted-foreground text-xs mb-0.5">Address</p>
                                            <p className="font-medium">{selectedSubmission.address}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Remarks</p>
                                <div className="bg-muted p-4 rounded-lg text-sm">{selectedSubmission.remarks || "No remarks provided"}</div>
                            </div>
                            <div className="text-sm">
                                <span className="text-muted-foreground">Submitted by </span>
                                <span className="font-medium">{selectedSubmission.submittedBy}</span>
                                <span className="text-muted-foreground"> on </span>
                                <span>{selectedSubmission.submittedDate}</span>
                            </div>
                            {selectedSubmission.evidences?.length > 0 ? (
                                <div className="border rounded-lg p-4 bg-gray-50">
                                    <p className="text-sm font-medium text-muted-foreground mb-3">
                                        Evidence Files ({selectedSubmission.evidences.length})
                                    </p>
                                    <div className="space-y-3">
                                        {selectedSubmission.evidences.map((ev) => (
                                            <div key={ev.id} className="flex items-center gap-3 bg-white border rounded-lg p-3">
                                                <div className="bg-muted p-2 rounded-lg shrink-0">
                                                    <FileText className="h-6 w-6 text-gray-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate text-sm">{ev.filename}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {(ev.size_bytes / 1024).toFixed(0)} KB &middot; {ev.department}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2 shrink-0">
                                                    <Button
                                                        variant="outline" size="sm"
                                                        disabled={!isPreviewableFile(ev.filename)}
                                                        onClick={() => {
                                                            if (isPreviewableFile(ev.filename)) {
                                                                handleViewFile(getAbsoluteFileUrl(ev.url), ev.filename);
                                                            } else {
                                                                toast({ title: "Preview not supported", description: "Please download to view this file.", variant: "warning" });
                                                            }
                                                        }}
                                                        className="h-8"
                                                    >
                                                        <Eye className="h-3.5 w-3.5 mr-1 text-teal-600" />
                                                        View
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => forceDownload(getAbsoluteFileUrl(ev.url), ev.filename)}
                                                        className="h-8 bg-green-600 hover:bg-green-700 text-white"
                                                    >
                                                        <Download className="h-3.5 w-3.5 mr-1" />
                                                        Download
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3 text-amber-800">
                                    <FileText className="h-5 w-5 opacity-70" />
                                    <p className="text-sm font-medium">No evidence file was uploaded for this submission.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {docViewer.isOpen && (
                <DocumentViewer
                    isOpen={docViewer.isOpen}
                    onClose={() => setDocViewer({ ...docViewer, isOpen: false })}
                    fileUrl={docViewer.fileUrl}
                    filename={docViewer.filename}
                />
            )}
        </div>
    );
};

export default StakeholderActivityDataEntry;
