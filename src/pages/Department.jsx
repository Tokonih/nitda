import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteDepartment, fetchDepartments } from "../Slices/departmentSlice";
import { getErrorMessage } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { DataViewToggle } from "@/components/ui/data-view-toggle";
import { DataPagination } from "@/components/ui/data-pagination";
import DepartmentCreation from "./DepartmentCreation";
import EditDepartmentForm from "./EditDepartment";
import ConfirmModal from "@/components/ui/ConfirmModal";

const DepartmentManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // all | nitda | stakeholder
  const [view, setView] = useState("table");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Inline View State
  const [viewMode, setViewMode] = useState("list"); // 'list', 'create', 'edit'
  const [selectedDeptId, setSelectedDeptId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, deptId: null, deptName: "" });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();

  const { list, loading, error } = useSelector((state) => state.departments);

  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  // Filter by type and search term
  const filteredDepartments = list?.filter((dept) => {
    const matchesType = typeFilter === "all" || dept?.type === typeFilter;
    const matchesSearch = dept?.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(
    (filteredDepartments?.length || 0) / itemsPerPage
  );
  const paginatedDepartments = filteredDepartments?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 🗑️ Handle delete
  const handleDelete = (id, name) => {
    setConfirmModal({ open: true, deptId: id, deptName: name });
  };

  const performDelete = async () => {
    const { deptId } = confirmModal;
    setConfirmModal({ open: false, deptId: null, deptName: "" });

    try {
      await dispatch(deleteDepartment(deptId)).unwrap();
      toast({
        title: "Department deleted successfully!",
        className: "bg-green-600 text-white border-green-600"
      });
      dispatch(fetchDepartments());
    } catch (err) {
      toast({
        title: "Error Deleting Department",
        description: getErrorMessage(err),
        variant: "destructive",
      });
    }
  };

  const handleCreate = () => {
    setViewMode("create");
  };

  const handleEdit = (id) => {
    setSelectedDeptId(id);
    setViewMode("edit");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedDeptId(null);
  };

  const handleSuccess = () => {
    setViewMode("list");
    setSelectedDeptId(null);
    dispatch(fetchDepartments());
  };

  if (viewMode === "create") {
    return (
      <DepartmentCreation
        onSuccess={handleSuccess}
        onCancel={handleBackToList}
      />
    );
  }

  if (viewMode === "edit") {
    return (
      <EditDepartmentForm
        deptId={selectedDeptId}
        onSuccess={handleSuccess}
        onCancel={handleBackToList}
      />
    );
  }

  if (loading && viewMode === 'list') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <h1 className="text-2xl font-bold">Department Management</h1>
        <Button
          className="flex items-center text-white"
          onClick={handleCreate}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Department
        </Button>
      </div>

      {/* Search + Table */}
      <Card className="nitda-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Departments</CardTitle>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search departments..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="pl-10 w-64"
                />
              </div>
              {/* Type filter */}
              <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="nitda">NITDA</SelectItem>
                  <SelectItem value="stakeholder">Stakeholder</SelectItem>
                </SelectContent>
              </Select>
              <DataViewToggle view={view} onViewChange={setView} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {view === "table" ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    {/* <TableHead>Created At</TableHead> */}
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedDepartments?.map((dept) => (
                    <TableRow key={dept.id}>
                      <TableCell className="font-medium">{dept.name}</TableCell>
                      <TableCell>{dept.type}</TableCell>
                      {/* <TableCell>
                        {dept.created_at
                          ? new Date(dept.created_at).toLocaleDateString()
                          : "—"}
                      </TableCell> */}
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-primary text-primary-foreground py-1 px-2 flex items-center justify-center"
                            onClick={() => handleEdit(dept.id)}
                          >
                            <Pencil className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive py-1 px-2 flex items-center justify-center bg-muted hover:bg-destructive/10"
                            onClick={() => handleDelete(dept.id, dept.name)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedDepartments?.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground"
                      >
                        {loading ? "Loading..." : "No departments found"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedDepartments?.map((dept) => (
                <Card key={dept.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-muted-foreground">
                        Name:
                      </span>
                      <span className="text-sm font-medium text-right">
                        {dept.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-muted-foreground">
                        Contact Email:
                      </span>
                      <span className="text-sm font-medium text-right">
                        {dept.contact_email}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Created At:
                      </span>
                      <span className="text-sm font-medium">
                        {dept.created_at
                          ? new Date(dept.created_at).toLocaleDateString()
                          : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm text-muted-foreground">
                        Actions:
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-primary  text-primary-foreground py-1 px-2 flex items-center justify-center"
                          onClick={() => handleEdit(dept.id)}
                        >
                          <Pencil className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive  py-1 px-2 flex items-center justify-center bg-muted hover:bg-destructive/10"
                          onClick={() => handleDelete(dept.id, dept.name)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              {paginatedDepartments?.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground py-8">
                  {loading ? "Loading..." : "No departments found"}
                </div>
              )}
            </div>
          )}

          {totalPages >= 1 && filteredDepartments?.length > 0 && (
            <DataPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, deptId: null, deptName: "" })}
        title="Delete Department"
        description={`Are you sure you want to delete "${confirmModal.deptName}"? This action cannot be undone.`}
        onConfirm={performDelete}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="destructive"
      />
    </div>
  );
};

export default DepartmentManagement;
