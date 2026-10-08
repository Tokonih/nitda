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
import { deleteUser, fetchUsers } from "../Slices/userSlice";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";
import { DataViewToggle } from "@/components/ui/data-view-toggle";
import { DataPagination } from "@/components/ui/data-pagination";
import ConfirmModal from "../components/ui/ConfirmModal";
import UserCreation from "./UserCreation";
import UserEdit from "./EditUser";

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState("table");
  const [currentPage, setCurrentPage] = useState(1);

  // Inline View State
  const [viewMode, setViewMode] = useState("list"); // 'list', 'create', 'edit'
  const [selectedUserId, setSelectedUserId] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { list, loading, error, pagination } = useSelector(
    (state) => state.users
  );

  useEffect(() => {
    dispatch(fetchUsers({ page: currentPage }));
  }, [dispatch, currentPage]);

  const filteredUsers = (list || []).filter(
    (u) =>
      u?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u?.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (id) => {
    setSelectedUserId(id);
    setViewMode("edit");
  };

  const handleCreate = () => {
    setViewMode("create");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedUserId(null);
  };

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleSuccess = async () => {
    setIsRefreshing(true);
    try {
      await dispatch(fetchUsers({ page: currentPage })).unwrap(); // Wait for users to be fetched
      // Show success toast after data is loaded
      toast({
        title: "User Created Successfully",
        description: "The new user has been added to the system.",
        className: "bg-green-600 text-white border-green-600",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: getErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setViewMode("list");
      setSelectedUserId(null);
      setIsRefreshing(false);
    }
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await dispatch(deleteUser(userToDelete.id)).unwrap();
      // Optional: show success toast
    } catch (err) {
      toast({
        title: "Error Deleting User",
        description: getErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      closeDeleteModal();
    }
  };

  if (viewMode === "create") {
    return (
      <UserCreation onSuccess={handleSuccess} onCancel={handleBackToList} />
    );
  }

  if (viewMode === "edit") {
    return (
      <UserEdit
        userId={selectedUserId}
        onSuccess={handleSuccess}
        onCancel={handleBackToList}
      />
    );
  }

  if ((loading && viewMode === "list") || isRefreshing) {
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
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button className="flex items-center text-white" onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Search + Table */}
      <Card className="nitda-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Users</CardTitle>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search users..."
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
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(user.id)}
                          >
                            <Pencil className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => openDeleteModal(user)}
                            disabled={loading}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredUsers?.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground"
                      >
                        {loading ? "Loading..." : "No User records found"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers?.map((user) => (
                <Card key={user.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-muted-foreground">
                        Name:
                      </span>
                      <span className="text-sm font-medium text-right">
                        {user.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-muted-foreground">
                        Email:
                      </span>
                      <span className="text-sm font-medium text-right">
                        {user.email}
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-muted-foreground">
                        Department:
                      </span>
                      <span className="text-sm font-medium text-right">
                        {user.department}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Role:
                      </span>
                      <Badge variant="secondary" className="capitalize">
                        {user.role}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Created At:
                      </span>
                      <span className="text-sm font-medium">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => handleEdit(user.id)}
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-full text-destructive hover:bg-destructive/10"
                        onClick={() => openDeleteModal(user)}
                        disabled={loading}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              {filteredUsers?.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground py-8">
                  {loading ? "Loading..." : "No User records found"}
                </div>
              )}
            </div>
          )}

          {pagination?.last_page > 1 && (
            <DataPagination
              currentPage={pagination.current_page}
              totalPages={pagination.last_page}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </CardContent>
      </Card>
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        title="Delete User?"
        description={
          <>
            This action <strong>cannot be undone</strong>. This will permanently
            delete:
            <br />
            <span className="font-medium text-foreground">
              {userToDelete?.name} ({userToDelete?.email})
            </span>
          </>
        }
        confirmText={loading ? "Deleting..." : "Delete User"}
        cancelText="Cancel"
        onConfirm={confirmDelete}
        confirmVariant="destructive"
      />
    </div>
  );
};

export default UserManagement;
