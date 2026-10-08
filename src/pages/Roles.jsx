import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getRoles, deleteRole } from "@/Slices/roleSlice";
import { getErrorMessage } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { DataViewToggle } from "@/components/ui/data-view-toggle";
import { DataPagination } from "@/components/ui/data-pagination";
import RoleCreation from "./RoleCreation";
import EditRoleForm from "./EditRole";
import ConfirmModal from "@/components/ui/ConfirmModal";

const RolesManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState("table");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Inline View State
  const [viewMode, setViewMode] = useState("list"); // 'list', 'create', 'edit'
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, roleId: null, roleName: "" });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();

  const { list, loading, error, meta } = useSelector((state) => state.roles);

  useEffect(() => {
    dispatch(getRoles({ per_page: 15 }));
  }, [dispatch]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= meta.last_page) {
      dispatch(
        getRoles({ page: newPage, per_page: meta.per_page, search: searchTerm })
      );
    }
  };

  // Search filter
  const filteredRoles = list?.filter((role) =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil((filteredRoles?.length || 0) / itemsPerPage);
  const paginatedRoles = filteredRoles?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle delete
  const handleDelete = (id, name) => {
    setConfirmModal({ open: true, roleId: id, roleName: name });
  };

  const performDelete = async () => {
    const { roleId } = confirmModal;
    setConfirmModal({ open: false, roleId: null, roleName: "" });

    try {
      await dispatch(deleteRole(roleId)).unwrap();
      toast({
        title: "Role deleted successfully!",
        className: "bg-green-600 text-white border-green-600"
      });
      dispatch(getRoles({ per_page: 15 })); // Refresh list
    } catch (err) {
      toast({
        title: "Error Deleting Role",
        description: getErrorMessage(err),
        variant: "destructive",
      });
    }
  };

  const handleCreate = () => {
    setViewMode("create");
  };

  const handleEdit = (id) => {
    setSelectedRoleId(id);
    setViewMode("edit");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedRoleId(null);
  };

  const handleSuccess = () => {
    setViewMode("list");
    setSelectedRoleId(null);
    dispatch(getRoles({ per_page: 15 })); // Refresh data
  };

  if (viewMode === "create") {
    return (
      <RoleCreation
        onSuccess={handleSuccess}
        onCancel={handleBackToList}
      />
    );
  }

  if (viewMode === "edit") {
    return (
      <EditRoleForm
        roleId={selectedRoleId}
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
        <h1 className="text-2xl font-bold">Roles Management</h1>
        <Button
          className="flex items-center text-white"
          onClick={handleCreate}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Role
        </Button>
      </div>

      {/* Search + Table */}
      <Card className="nitda-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Roles</CardTitle>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
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
                    <TableHead>Description</TableHead>
                    <TableHead># Permissions</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRoles?.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell>{role.description}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {role.permissions?.length || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-primary text-primary-foreground py-1 px-2 flex items-center justify-center"
                            onClick={() => handleEdit(role.id)}
                          >
                            <Pencil className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive py-1 px-2 flex items-center justify-center bg-muted hover:bg-destructive/10"
                            onClick={() => handleDelete(role.id, role.name)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedRoles?.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground"
                      >
                        {loading ? "Loading..." : "No roles found"}
                      </TableCell>
                    </TableRow>
                  )}
                  {error && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-red-500"
                      >
                        {typeof error === "object" ? error.message || JSON.stringify(error) : error}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedRoles?.map((role) => (
                <Card key={role.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-muted-foreground">
                        Name:
                      </span>
                      <span className="text-sm font-medium text-right">
                        {role.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-muted-foreground">
                        Description:
                      </span>
                      <span className="text-sm font-medium text-right">
                        {role.description}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        # Permissions:
                      </span>
                      <Badge variant="secondary">
                        {role.permissions?.length || 0}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm text-muted-foreground">
                        Actions:
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-primary text-primary-foreground py-1 px-2 flex items-center justify-center"
                          onClick={() => handleEdit(role.id)}
                        >
                          <Pencil className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive py-1 px-2 flex items-center justify-center bg-muted hover:bg-destructive/10"
                          onClick={() => handleDelete(role.id, role.name)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              {paginatedRoles?.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground py-8">
                  {loading ? "Loading..." : "No roles found"}
                </div>
              )}
            </div>
          )}

          {totalPages > 1 && (
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
        onClose={() => setConfirmModal({ open: false, roleId: null, roleName: "" })}
        title="Delete Role"
        description={`Are you sure you want to delete "${confirmModal.roleName}"? This action cannot be undone.`}
        onConfirm={performDelete}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="destructive"
      />
    </div>
  );
};

export default RolesManagement;
