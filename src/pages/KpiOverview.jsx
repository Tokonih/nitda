import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Calendar,
  BarChart3,
  ChevronLeft,
  Layers,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { fetchAllKpi } from "@/Slices/kpiSlice";
import { getDepartmentApi } from "@/Slices/Utils/Api/departments";
import { DataPagination } from "@/components/ui/data-pagination";
import { useYears } from "@/hooks/use-years";
import { isAdmin as checkIsAdmin } from "@/lib/roleLabels";

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "approved", label: "Approved" },
  { value: "pending", label: "Pending" },
  { value: "disapproved", label: "Disapproved" },
];

const FREQUENCY_OPTIONS = [
  { value: "all", label: "All Frequencies" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

const KpiOverview = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.authSlice);
  const { list, loading, pagination } = useSelector((state) => state.kpi);

  // Guard: only admin / director
  const isAdmin = checkIsAdmin(user);
  const isDirector = user?.role === "Director" || user?.role === "DG" || user?.role === "DGT";
  if (!isAdmin && !isDirector) {
    navigate("/dashboard", { replace: true });
  }

  const { years: yearsList } = useYears();
  const currentYear = new Date().getFullYear().toString();

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedFrequency, setSelectedFrequency] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [departments, setDepartments] = useState([]);

  // Fetch departments for filter
  useEffect(() => {
    getDepartmentApi({ per_page: 200 })
      .then((res) => setDepartments(res?.data || []))
      .catch(() => {});
  }, []);

  // Fetch KPIs whenever filters / page change
  useEffect(() => {
    const params = {
      page: currentPage,
      year: selectedYear,
      per_page: 20,
    };
    if (selectedDepartment !== "all") params.department_id = selectedDepartment;
    if (selectedFrequency !== "all") params.frequency = selectedFrequency;
    if (selectedStatus === "approved") params.approved = true;
    if (selectedStatus === "disapproved") params.approved = false;
    dispatch(fetchAllKpi(params));
  }, [dispatch, currentPage, selectedYear, selectedDepartment, selectedFrequency, selectedStatus]);

  // Client-side search filter (name / description)
  const filteredList = (list || []).filter((kpi) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      kpi.name?.toLowerCase().includes(term) ||
      kpi.description?.toLowerCase().includes(term)
    );
  });

  // Summary counts from current page list
  const totalCount = pagination?.total || list?.length || 0;
  const approvedCount = (list || []).filter(
    (k) => k.is_approved && k.approval_comment
  ).length;
  const pendingCount = (list || []).filter(
    (k) => !k.is_approved && !k.approval_comment
  ).length;
  const disapprovedCount = (list || []).filter(
    (k) => !k.is_approved && k.approval_comment
  ).length;

  const getStatusBadge = (kpi) => {
    if (kpi.is_approved && kpi.approval_comment) {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200">
          Approved
        </Badge>
      );
    }
    if (!kpi.is_approved && kpi.approval_comment) {
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200">
          Disapproved
        </Badge>
      );
    }
    return (
      <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
        Pending
      </Badge>
    );
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFilterChange = (setter) => (val) => {
    setter(val);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/dashboard")}
        className="p-0 text-gray-600 hover:text-green-700 hover:bg-transparent -ml-1 flex items-center gap-2 group"
      >
        <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </Button>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">KPI Overview</h1>
        <p className="text-muted-foreground mt-1">
          All KPIs across departments — filter, search, and review.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total KPIs",
            value: totalCount,
            icon: <Layers className="h-5 w-5 text-white" />,
            color: "bg-[#155535]",
          },
          {
            label: "Approved",
            value: approvedCount,
            icon: <CheckCircle className="h-5 w-5 text-white" />,
            color: "bg-green-600",
          },
          {
            label: "Pending",
            value: pendingCount,
            icon: <Clock className="h-5 w-5 text-white" />,
            color: "bg-yellow-500",
          },
          {
            label: "Disapproved",
            value: disapprovedCount,
            icon: <XCircle className="h-5 w-5 text-white" />,
            color: "bg-red-500",
          },
        ].map((card) => (
          <Card key={card.label} className={`${card.color} border-0 text-white`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white/80">
                {card.label}
              </CardTitle>
              <div className="h-9 w-9 flex items-center justify-center bg-white/10 rounded-lg">
                {card.icon}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                All KPIs
              </CardTitle>
              <CardDescription>
                Showing page {currentPage} of {pagination?.last_page || 1}
              </CardDescription>
            </div>

            {/* Filters row */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Year */}
              <Select
                value={selectedYear}
                onValueChange={handleFilterChange(setSelectedYear)}
              >
                <SelectTrigger className="w-[110px]">
                  <Calendar className="w-4 h-4 mr-1 text-muted-foreground" />
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {yearsList.map((y) => (
                    <SelectItem key={y.year} value={y.year.toString()}>
                      {y.year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status */}
              <Select
                value={selectedStatus}
                onValueChange={handleFilterChange(setSelectedStatus)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Frequency */}
              <Select
                value={selectedFrequency}
                onValueChange={handleFilterChange(setSelectedFrequency)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Frequency" />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Department */}
              <Select
                value={selectedDepartment}
                onValueChange={handleFilterChange(setSelectedDepartment)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id.toString()}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search KPIs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-48"
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#155535]" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Objective</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Q1</TableHead>
                      <TableHead>Q2</TableHead>
                      <TableHead>Q3</TableHead>
                      <TableHead>Q4</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredList.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={12}
                          className="text-center py-12 text-muted-foreground"
                        >
                          No KPIs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredList.map((kpi) => (
                        <TableRow
                          key={kpi.id}
                          className="hover:bg-muted/50 transition-colors"
                        >
                          <TableCell className="font-medium max-w-[200px]">
                            <span
                              className="block truncate"
                              title={kpi.name}
                            >
                              {kpi.name}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {kpi.department?.name || "—"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[160px]">
                            <span
                              className="block truncate"
                              title={kpi.srap_objective?.name}
                            >
                              {kpi.srap_objective?.name || "—"}
                            </span>
                          </TableCell>
                          <TableCell className="capitalize text-sm">
                            {kpi.frequency || "—"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {kpi.year ||
                              new Date(kpi.created_at).getFullYear()}
                          </TableCell>
                          <TableCell className="text-sm font-semibold text-[#155535]">
                            {Number(kpi.target_value || 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-sm">
                            {Number(kpi.target_q1 || 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-sm">
                            {Number(kpi.target_q2 || 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-sm">
                            {Number(kpi.target_q3 || 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-sm">
                            {Number(kpi.target_q4 || 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-sm">
                            {kpi.unit || "—"}
                          </TableCell>
                          <TableCell>{getStatusBadge(kpi)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination?.last_page > 1 && (
                <DataPagination
                  currentPage={pagination.current_page || currentPage}
                  totalPages={pagination.last_page}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default KpiOverview;
