import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  CheckCircle,
  Clock,
  Filter,
  Plus,
  Layers,
  Calendar,
  FileText,
  X,
  BarChart2,
  Target,
  Info,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllKpi, fetchKpiValues, fetchKpiById } from "../../Slices/kpiSlice";
import { fetchStakeholderActivities, fetchStakeholderActivityValueById } from "../../Slices/stakeholderActivitiesSlice";
import { DataPagination } from "@/components/ui/data-pagination";
import {
  getKpiLabel,
  getKpiLabelPlural,
  isStakeholder,
  isAdmin,
} from "@/lib/roleLabels";
import { useYears } from "@/hooks/use-years";
import DepartmentSelect from "@/components/ui/DepartmentSelect";
import { useGlobalFilter } from "@/hooks/useGlobalFilter";

const KPIDataSourceValidation = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.authSlice);
  const userRole = user?.role || "";
  const isStakeholderUser = isStakeholder(user);
  const isAdminUser = isAdmin(user);
  const canReviewDefinitions =
    isAdminUser ||
    ["Administrator", "DG", "DGT", "External Stakeholder(Director)", "Director"].includes(userRole);
  const userDepartment = user?.department?.id || "";
  const { list, loading, error, pagination, singleKpi, singleKpiLoading } = useSelector(
    (state) => state.kpi
  );
  const stakeholderActivityState = useSelector(
    (state) => state.stakeholderActivities
  );
  const { singleValue, singleValueLoading } = stakeholderActivityState;
  const stakeholderListPagination = stakeholderActivityState?.listPagination || {};

  const isLoading = isStakeholderUser ? stakeholderActivityState?.loading : loading;
  const rawError = isStakeholderUser ? stakeholderActivityState?.error : error;

  const handleRowClick = (id) => {
    if (isStakeholderUser) {
      dispatch(fetchStakeholderActivityValueById(id));
    } else {
      dispatch(fetchKpiById(id));
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const isPendingDefinition = (kpi) =>
    !kpi.is_approved && !kpi.approval_comment;

  const handleKpiRowClick = (kpi) => {
    if (canReviewDefinitions && isPendingDefinition(kpi)) {
      const departmentId =
        kpi?.srap_objective?.department?.id ||
        kpi?.department_id ||
        selectedDepartment ||
        userDepartment;

      navigate("/dashboard/kpi-definition-review", {
        state: {
          kpiId: kpi.id,
          kpi,
          departmentId: departmentId?.toString(),
          year: (kpi.year || selectedYear)?.toString(),
        },
      });
      return;
    }

    handleRowClick(kpi.id);
  };

  // Safely convert error to string if it's an object
  const actualError = typeof rawError === 'object' && rawError !== null
    ? rawError.message || JSON.stringify(rawError)
    : rawError;

  const activityList = isStakeholderUser
    ? stakeholderActivityState?.list || []
    : list;
  const [currentPage, setCurrentPage] = useState(1);

  // Year filter
  const { years: yearsList } = useYears();
  const currentYear = new Date().getFullYear().toString();
  const globalFilter = useGlobalFilter();
  const [selectedYear, setSelectedYear] = useState(globalFilter.year || currentYear);
  const [selectedQuarter, setSelectedQuarter] = useState(
    globalFilter.quarter && globalFilter.quarter !== "All" ? globalFilter.quarter : "all"
  );
  const [selectedDepartment, setSelectedDepartment] = useState(globalFilter.department || "");

  // Page size for both paths
  const PAGE_SIZE = 15;

  useEffect(() => {
    // Admin: fetch all (no dept filter) or filtered by selected dept
    // Non-admin: always filter by their own department
    const deptId = isAdminUser
      ? (selectedDepartment || undefined)
      : (userDepartment || undefined);

    if (isStakeholderUser) {
      dispatch(
        fetchStakeholderActivities({
          department_id: deptId,
          per_page: PAGE_SIZE,
          page: currentPage,
          year: selectedYear,
          quarter: selectedQuarter !== "all" ? selectedQuarter : undefined,
        })
      );
    } else {
      dispatch(
        fetchAllKpi({
          department_id: deptId,
          page: currentPage,
          year: selectedYear,
          per_page: PAGE_SIZE,
        })
      );
    }
  }, [dispatch, userDepartment, isAdminUser, isStakeholderUser, currentPage, selectedYear, selectedQuarter, selectedDepartment]);

  // ✅ Filter KPIs by name or description (stakeholder activities use pillar.name)
  const filteredKpis = activityList?.filter((kpi) => {
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (isStakeholderUser) {
        if (!kpi.pillar?.name?.toLowerCase().includes(term)) return false;
      } else {
        if (!kpi.name?.toLowerCase().includes(term) && !kpi.description?.toLowerCase().includes(term)) return false;
      }
    }
    // Status filter
    if (statusFilter !== "all") {
      if (isStakeholderUser) {
        const activityStatus = (kpi.status || kpi.verification_status || "pending").toLowerCase();
        if (statusFilter === "approved" && activityStatus !== "approved") return false;
        if (statusFilter === "pending" && activityStatus !== "pending") return false;
        if (statusFilter === "disapproved" && activityStatus !== "disapproved") return false;
      } else {
        const isApproved = kpi.is_approved && kpi.approval_comment;
        const isDisapproved = !kpi.is_approved && kpi.approval_comment;
        if (statusFilter === "approved" && !isApproved) return false;
        if (statusFilter === "pending" && (isApproved || isDisapproved)) return false;
        if (statusFilter === "disapproved" && !isDisapproved) return false;
      }
    }
    return true;
  });

  // pagedStakeholderKpis = filteredKpis (server already paged; client filter is on current page only)
  const pagedStakeholderKpis = filteredKpis;

  // Unified pagination — both paths now server-side
  const paginationCurrentPage = isStakeholderUser
    ? (stakeholderListPagination?.current_page || currentPage)
    : (pagination?.current_page || currentPage);
  const paginationTotalPages = isStakeholderUser
    ? (stakeholderListPagination?.last_page || 1)
    : (pagination?.last_page || 1);
  const showPagination = paginationTotalPages > 1;

  // ✅ KPI Summary metrics
  const totalKpis = activityList?.length || 0;
  const quarterlyCount =
    activityList?.filter((kpi) => kpi.frequency === "quarterly").length || 0;
  const yearlyCount =
    activityList?.filter((kpi) => kpi.frequency === "yearly").length || 0;
  const avgTarget =
    activityList?.length > 0
      ? (
        activityList.reduce(
          (sum, kpi) => sum + parseFloat(kpi.target_value || 0),
          0
        ) / activityList.length
      ).toFixed(2)
      : 0;

  const cardData = [
    {
      title: `Total ${getKpiLabelPlural(user)}`,
      value: totalKpis,
      description: `Total ${getKpiLabelPlural(user).toLowerCase()} created`,
      icon: <Layers className="h-5 w-5 text-white" />,
      titleColor: "text-[#22C55E]",
    },
    {
      title: `Quarterly ${getKpiLabelPlural(user)}`,
      value: quarterlyCount,
      description: "Measured quarterly",
      icon: <CheckCircle className="h-5 w-5 text-white" />,
      titleColor: "text-[#22C55E]",
    },
    {
      title: `Yearly ${getKpiLabelPlural(user)}`,
      value: yearlyCount,
      description: "Measured yearly",
      icon: <Clock className="h-5 w-5 text-white" />,
      titleColor: "text-[#22C55E]",
    },
    // {
    //   title: "Percentage Target Completion",
    //   value: `0%`,
    //   description: "Percentage Target Completion",
    //   icon: <Gem className="h-5 w-5 text-white" />,
    //   titleColor: "text-[#22C55E]",
    // },
  ];

  // ✅ Chart data (Frequency Distribution)
  const frequencyData = [
    { name: "Quarterly", value: quarterlyCount, color: "#16a34a" },
    { name: "Yearly", value: yearlyCount, color: "#eab308" },
    {
      name: "Monthly",
      value: activityList.filter((k) => k.frequency === "monthly").length,
      color: "#3b82f6",
    },
  ];

  // ✅ Bar chart for target values
  const targetData = activityList.map((kpi) => ({
    name: kpi.name,
    value: parseFloat(kpi.target_value) || 0,
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {getKpiLabel(user)} Data Source Validation
          </h1>
          <p className="text-muted-foreground mt-2" id="kpi-page-desc">
            Monitor and manage{" "}
            {isStakeholderUser
              ? "activities"
              : "Key Performance Indicators (KPIs)"}{" "}
            for the Performance Management System Dashboard.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(isAdminUser ||
            userRole === "Administrator" ||
            userRole === "DG" ||
            userRole === "DGT" ||
            userRole === "External Stakeholder(Director)" ||
            userRole === "Director") ? (
            <div className="flex gap-2 flex-wrap">
              <Button
                className="gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white flex items-center"
                onClick={() => navigate("/dashboard/kpi-review")}
                id="btn-review-kpi"
              >
                Review {getKpiLabelPlural(user)} Values
              </Button>
              <Button
                variant="outline"
                className="gap-2 border-[#16a34a] text-[#16a34a] hover:bg-green-50 flex items-center"
                onClick={() => navigate("/dashboard/kpi-definition-review")}
                id="btn-definition-review"
              >
                KPI Definition Review
              </Button>
              {!isStakeholderUser && (
                <Button
                  className="gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white flex items-center"
                  onClick={() => navigate("/dashboard/create-kpi")}
                  id="btn-add-kpi"
                >
                  <Plus className="h-4 w-4" />
                  Add {getKpiLabel(user)} Values
                </Button>
              )}
            </div>
          ) : !isStakeholderUser ? (
            <Button
              className="gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white flex items-center"
              onClick={() => navigate("/dashboard/create-kpi")}
              id="btn-add-kpi"
            >
              <Plus className="h-4 w-4" />
              Add {getKpiLabel(user)} Values
            </Button>
          ) : null}
        </div>
      </div>

      {/* Summary Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="kpi-summary-cards">
        {cardData.map((card, index) => (
          <Card
            key={index}
            className="bg-[#155535] border-[#155535] text-white"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`text-sm font-medium ${card.titleColor}`}>
                {card.title}
              </CardTitle>
              <div className="h-10 w-10 flex items-center justify-center">
                {card.icon}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-4xl font-bold">{card.value}</div>
              <p className={`text-xs mt-1 ${card.titleColor}`}>
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div> */}

      {/* Charts */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              KPI Frequency Distribution
            </CardTitle>
            <CardDescription>Breakdown by measurement frequency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <div className="w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={frequencyData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                    >
                      {frequencyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-4">
                {frequencyData.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div
                      className="w-1 h-12 rounded"
                      style={{ backgroundColor: item.color }}
                    />
                    <div>
                      <div className="font-semibold text-foreground">
                        {item.name}: {item.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

     
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Target Values by KPI
            </CardTitle>
            <CardDescription>Visual representation of KPI targets</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={targetData}>
                <XAxis dataKey="name" hide />
                <YAxis />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div> */}

      {/* KPI Table */}
      <Card id="kpi-data-table">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-lg font-semibold">
                {getKpiLabelPlural(user)} List
              </CardTitle>
              <CardDescription>
                All created {getKpiLabelPlural(user).toLowerCase()}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}>
                <SelectTrigger className="w-[140px]" id="kpi-status-filter">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="disapproved">Disapproved</SelectItem>
                  {/* {!isStakeholderUser && <SelectItem value="disapproved">Disapproved</SelectItem>} */}
                </SelectContent>
              </Select>
              {/* Year Filter */}
              <Select value={selectedYear} onValueChange={(val) => { setSelectedYear(val); setCurrentPage(1); }}>
                <SelectTrigger className="w-[120px]" id="kpi-year-filter">
                  <Calendar className="w-4 h-4 mr-1 text-muted-foreground" />
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {yearsList.length > 0
                    ? yearsList.map((y) => (
                      <SelectItem key={y.year} value={y.year.toString()}>
                        {y.year}
                      </SelectItem>
                    ))
                    : [currentYear].map((y) => (
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
              {/* Quarter Filter — stakeholder only (non-stakeholders use KPI definitions which are annual) */}
              {isStakeholderUser && (
                <Select value={selectedQuarter} onValueChange={(val) => { setSelectedQuarter(val); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[130px]">
                    <Filter className="w-4 h-4 mr-1 text-muted-foreground" />
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
              )}
              <div className="relative" id="kpi-search-bar">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={`Search ${getKpiLabelPlural(user).toLowerCase()}...`}
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="pl-10 w-56"
                />
              </div>
              {/* Department filter — admin only */}
              {!isStakeholderUser && (
                <DepartmentSelect
                  value={selectedDepartment}
                  onChange={(val) => { setSelectedDepartment(val); setCurrentPage(1); }}
                  className="w-[200px]"
                />
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <p>Loading KPIs...</p>
          ) : actualError ? (
            <p className="text-red-500">{actualError}</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {isStakeholderUser ? (
                      <>
                        <TableHead id="kpi-col-name">Title</TableHead>
                        <TableHead id="kpi-col-name">Pillar Name</TableHead>
                        <TableHead id="kpi-col-name"> Remarks</TableHead>
                        <TableHead id="kpi-col-target">Value</TableHead>
                        <TableHead id="kpi-col-target">Evidence</TableHead>
                        <TableHead>Status</TableHead>
                      </>
                    ) : (
                      <>
                        <TableHead id="kpi-col-name">Name</TableHead>
                        <TableHead id="kpi-col-target">Department</TableHead>
                        <TableHead id="kpi-col-target">Target Value</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>View</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredKpis.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isStakeholderUser ? 6 : 4} className="text-center py-8 text-muted-foreground">
                        No {getKpiLabelPlural(user).toLowerCase()} found
                      </TableCell>
                    </TableRow>
                  ) : isStakeholderUser ? (
                    // Stakeholder activity values table rows - simplified to 3 columns
                     pagedStakeholderKpis.map((activity) => {
                      const activityStatus = (activity.status || activity.verification_status || "pending").toLowerCase();
                      const verifiedBadge =
                        activityStatus === "approved" ? (
                          <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-200">Approved</Badge>
                        ) : activityStatus === "disapproved" ? (
                          <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-200">Disapproved</Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200">Pending</Badge>
                        );

                      return (
                        <TableRow
                          key={activity.id}
                          className="cursor-pointer hover:bg-muted/60 transition-colors"
                          onClick={() => handleRowClick(activity.id)}
                        >
                          <TableCell>
                            <div className="font-medium text-foreground">
                              {activity.title}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-foreground">
                              {typeof activity.pillar === 'object' ? (activity.pillar?.name || 'N/A') : (activity.pillar || 'N/A')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-foreground">
                              {activity.remarks}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-green-700">
                              {Number(activity.value || 0).toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            {activity.evidence_url && (
                              <a
                                href={activity.evidence_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-700 flex items-center gap-1"
                              >
                                <FileText className="inline h-3 w-3" />
                                View Evidence
                              </a>
                            )}
                          </TableCell>
                          <TableCell>{verifiedBadge}</TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    // NITDA KPI table rows
                    filteredKpis.map((kpi) => {
                      // Determine KPI approval status badge
                      let statusBadge;
                      if (kpi.is_approved && kpi.approval_comment) {
                        statusBadge = <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-200">Approved</Badge>;
                      } else if (!kpi.is_approved && kpi.approval_comment) {
                        statusBadge = <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-200">Disapproved</Badge>;
                      } else {
                        statusBadge = <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200">Pending</Badge>;
                      }
                      return (
                        <TableRow
                          key={kpi.id}
                          className="cursor-pointer hover:bg-muted/60 transition-colors"
                          onClick={() => handleKpiRowClick(kpi)}
                        >
                          <TableCell className="font-medium">{kpi.name}</TableCell>
                          <TableCell className="font-medium">{kpi?.srap_objective?.department?.name}</TableCell>
                          <TableCell>{Number(kpi.target_value).toLocaleString()}</TableCell>
                          <TableCell>{statusBadge}</TableCell>
                          <TableCell>
                            <button
                              className="text-xs text-[#155535] font-medium hover:underline"
                              onClick={(e) => { e.stopPropagation(); handleKpiRowClick(kpi); }}
                            >
                              {canReviewDefinitions && isPendingDefinition(kpi) ? "Review" : "View"}
                            </button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}

                </TableBody>
              </Table>
            </div>
          )}
          {showPagination && (
            <DataPagination
              currentPage={paginationCurrentPage}
              totalPages={paginationTotalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </CardContent>
      </Card>

      {/* Detail Modal — KPI or Stakeholder Activity */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={closeModal}
        >
          <div
            className="bg-background rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-[#155535] rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <BarChart2 className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">
                    {isStakeholderUser ? "Activity Details" : "KPI Details"}
                  </h2>
                  <p className="text-xs text-white/70">Full information</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                id="kpi-modal-close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5">
              {isStakeholderUser ? (
                /* ── Stakeholder Activity Detail ── */
                singleValueLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#155535]" />
                    <p className="text-sm text-muted-foreground">Loading activity details...</p>
                  </div>
                ) : singleValue ? (
                  <div className="space-y-5">
                    {/* Title & Department */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Title</p>
                        <p className="text-sm font-semibold text-foreground">{singleValue.title || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Department</p>
                        <p className="text-sm text-foreground">{singleValue.department?.name || "N/A"}</p>
                      </div>
                    </div>

                    {/* Status & Year */}
                    <div className="flex flex-wrap gap-3">
                      <div className="flex-1 min-w-[120px]">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Status</p>
                        {singleValue.verified ? (
                          <Badge className="bg-green-100 text-green-700 border-green-200">Approved</Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pending</Badge>
                        )}
                      </div>
                      <div className="flex-1 min-w-[120px]">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Year</p>
                        <span className="text-sm font-semibold">{singleValue.year}</span>
                      </div>
                      <div className="flex-1 min-w-[120px]">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Pillar</p>
                        <span className="text-sm">{typeof singleValue.pillar === 'object' ? (singleValue.pillar?.name || 'N/A') : (singleValue.pillar || 'N/A')}</span>
                      </div>
                    </div>

                    {/* Quarterly Actuals */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                        <Target className="h-3.5 w-3.5" /> Actual Values
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                          { label: "Total Value", value: singleValue.value },
                          // { label: "Annual Actual", value: singleValue.actual_annual },
                          // { label: "Q1 Actual", value: singleValue.actual_q1 },
                          // { label: "Q2 Actual", value: singleValue.actual_q2 },
                          // { label: "Q3 Actual", value: singleValue.actual_q3 },
                          // { label: "Q4 Actual", value: singleValue.actual_q4 },
                        ].map(({ label, value }) => (
                          <div key={label} className="bg-muted/50 rounded-lg p-3 border border-border">
                            <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                            <p className="text-sm font-bold text-[#155535]">
                              {value ? Number(value).toLocaleString() : "—"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Monthly Breakdown */}
                    {/* <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Monthly Breakdown</p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {[
                          ["Jan", singleValue.jan_value], ["Feb", singleValue.feb_value], ["Mar", singleValue.mar_value],
                          ["Apr", singleValue.apr_value], ["May", singleValue.may_value], ["Jun", singleValue.jun_value],
                          ["Jul", singleValue.jul_value], ["Aug", singleValue.aug_value], ["Sep", singleValue.sep_value],
                          ["Oct", singleValue.oct_value], ["Nov", singleValue.nov_value], ["Dec", singleValue.dec_value],
                        ].filter(([, v]) => v !== null && v !== undefined).map(([month, val]) => (
                          <div key={month} className="bg-muted/40 rounded p-2 border border-border text-center">
                            <p className="text-xs text-muted-foreground">{month}</p>
                            <p className="text-xs font-semibold text-[#155535]">{Number(val).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </div> */}

                    {/* Remarks */}
                    {singleValue.remarks && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Remarks</p>
                        <p className="text-sm text-foreground">{singleValue.remarks}</p>
                      </div>
                    )}

                    {/* Evidences */}
                    {singleValue.evidences?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5" /> Evidence Files ({singleValue.evidences.length})
                        </p>
                        <div className="space-y-2">
                          {singleValue.evidences.map((ev) => (
                            <div key={ev.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-foreground truncate">{ev.filename}</p>
                                <p className="text-xs text-muted-foreground">{ev.department} · {new Date(ev.created_at).toLocaleDateString()}</p>
                                {ev.remarks && <p className="text-xs text-muted-foreground italic">{ev.remarks}</p>}
                              </div>
                              <a
                                href={ev.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-3 text-xs text-[#155535] hover:underline shrink-0"
                              >
                                View
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Uploaded By & Approved By */}
                    <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground border-t border-border pt-4">
                      <div>
                        <span className="font-medium">Uploaded by:</span>{" "}
                        {singleValue.uploaded_by?.name || "N/A"}
                      </div>
                      <div>
                        <span className="font-medium">Approved by:</span>{" "}
                        {singleValue.approved_by?.name || "Nitda"}
                      </div>
                      {singleValue.verified_at && (
                        <div className="col-span-2">
                          <span className="font-medium">Verified at:</span>{" "}
                          {new Date(singleValue.verified_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <p className="text-sm text-muted-foreground">Failed to load activity details.</p>
                  </div>
                )
              ) : (
                /* ── KPI Detail ── */
                singleKpiLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#155535]" />
                    <p className="text-sm text-muted-foreground">Loading KPI details...</p>
                  </div>
                ) : singleKpi ? (
                  <div className="space-y-5">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">KPI Name</p>
                      <p className="text-sm font-semibold text-foreground leading-relaxed">{singleKpi.name}</p>
                    </div>
                    {singleKpi.description && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Description</p>
                        <p className="text-sm text-foreground">{singleKpi.description}</p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-3">
                      <div className="flex-1 min-w-[120px]">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Status</p>
                        {singleKpi.is_approved ? (
                          <Badge className="bg-green-100 text-green-700 border-green-200">Approved</Badge>
                        ) : singleKpi.approval_comment ? (
                          <Badge className="bg-red-100 text-red-700 border-red-200">Disapproved</Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pending</Badge>
                        )}
                      </div>
                      <div className="flex-1 min-w-[120px]">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Frequency</p>
                        <Badge variant="outline" className="capitalize">{singleKpi.frequency}</Badge>
                      </div>
                      <div className="flex-1 min-w-[120px]">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Timeline</p>
                        <Badge variant="outline">{singleKpi.timeline || "N/A"}</Badge>
                      </div>
                      <div className="flex-1 min-w-[120px]">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Year</p>
                        <span className="text-sm font-semibold">{singleKpi.year}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                        <Target className="h-3.5 w-3.5" /> Target Values
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                          { label: "Annual Target", value: singleKpi.target_annual },
                          { label: "Total Target", value: singleKpi.target_value },
                          { label: "Q1", value: singleKpi.target_q1 },
                          { label: "Q2", value: singleKpi.target_q2 },
                          { label: "Q3", value: singleKpi.target_q3 },
                          { label: "Q4", value: singleKpi.target_q4 },
                        ].map(({ label, value }) => (
                          <div key={label} className="bg-muted/50 rounded-lg p-3 border border-border">
                            <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                            <p className="text-sm font-bold text-[#155535]">
                              {value ? Number(value).toLocaleString() : "—"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Unit</p>
                        <p className="text-sm text-foreground">{singleKpi.unit?.replace(/_/g, " ") || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Formula</p>
                        <p className="text-sm text-foreground">{singleKpi.formula || "N/A"}</p>
                      </div>
                    </div>
                    {singleKpi.srap_objective && (
                      <div className="rounded-lg border border-border bg-muted/30 p-4">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                          <Info className="h-3.5 w-3.5" /> SRAP Objective
                        </p>
                        <p className="text-sm font-semibold text-foreground">{singleKpi.srap_objective.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{singleKpi.srap_objective.objective_code}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-xs bg-background border border-border rounded px-2 py-0.5">{singleKpi.srap_objective.department_name}</span>
                          <span className="text-xs bg-background border border-border rounded px-2 py-0.5">Year: {singleKpi.srap_objective.year}</span>
                          {singleKpi.srap_objective.verified && (
                            <Badge className="text-xs bg-green-100 text-green-700 border-green-200">Verified</Badge>
                          )}
                        </div>
                      </div>
                    )}
                    {/* {singleKpi.approved_by || !is_approved && ( */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Approved By</p>
                          <p className="text-sm text-foreground">{singleKpi?.approved_by?.name}</p>
                        </div>
                        {singleKpi?.approval_comment && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Approval Comment</p>
                            <p className="text-sm text-foreground">{singleKpi?.approval_comment}</p>
                          </div>
                        )}
                      </div>
                    {/* )} */}
                    <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground border-t border-border pt-4">
                      <div><span className="font-medium">Created by:</span>{" "}{singleKpi.created_by?.name || "N/A"}</div>
                      <div><span className="font-medium">Created at:</span>{" "}{singleKpi.created_at ? new Date(singleKpi.created_at).toLocaleDateString() : "N/A"}</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <p className="text-sm text-muted-foreground">Failed to load KPI details.</p>
                  </div>
                )
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-border flex justify-end">
              <Button
                variant="outline"
                onClick={closeModal}
                className="border-[#155535] text-[#155535] hover:bg-[#155535]/10"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KPIDataSourceValidation;
