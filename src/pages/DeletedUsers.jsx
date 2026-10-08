import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RotateCcw } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTrashedUsers, restoreUser } from "../Slices/userSlice";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";
import { DataPagination } from "@/components/ui/data-pagination";
import ConfirmModal from "../components/ui/ConfirmModal";

const DeletedUsers = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [userToRestore, setUserToRestore] = useState(null);

  const dispatch = useDispatch();
  const { toast } = useToast();
  const { trashedList, trashedLoading, trashedPagination, restoringId } =
    useSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchTrashedUsers({ page: currentPage }));
  }, [dispatch, currentPage]);

  const openRestoreModal = (user) => {
    setUserToRestore(user);
    setRestoreModalOpen(true);
  };

  const closeRestoreModal = () => {
    setRestoreModalOpen(false);
    setUserToRestore(null);
  };

  const confirmRestore = async () => {
    if (!userToRestore) return;
    try {
      await dispatch(restoreUser(userToRestore.id)).unwrap();
      toast({
        title: "User Restored",
        description: `${userToRestore.name} has been restored successfully.`,
        className: "bg-green-600 text-white border-green-600",
      });
      dispatch(fetchTrashedUsers({ page: currentPage }));
    } catch (err) {
      toast({
        title: "Error Restoring User",
        description: getErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      closeRestoreModal();
    }
  };

  if (trashedLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between w-full">
        <h1 className="text-2xl font-bold">Deleted Users</h1>
      </div>

      <Card className="nitda-card">
        <CardHeader>
          <CardTitle>Trashed Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Deleted At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trashedList.map((user) => (
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
                      {new Date(user.deleted_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                        onClick={() => openRestoreModal(user)}
                        disabled={restoringId === user.id}
                      >
                        {restoringId === user.id ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600 mr-1" />
                        ) : (
                          <RotateCcw className="h-3 w-3 mr-1" />
                        )}
                        Restore
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {trashedList.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground"
                    >
                      No deleted users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {trashedPagination?.last_page > 1 && (
            <DataPagination
              currentPage={trashedPagination.current_page}
              totalPages={trashedPagination.last_page}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </CardContent>
      </Card>

      <ConfirmModal
        isOpen={restoreModalOpen}
        onClose={closeRestoreModal}
        title="Restore User?"
        description={
          <>
            This will restore the following user and allow them to access the
            system again:
            <br />
            <span className="font-medium text-foreground">
              {userToRestore?.name} ({userToRestore?.email})
            </span>
          </>
        }
        confirmText="Restore User"
        cancelText="Cancel"
        onConfirm={confirmRestore}
        confirmVariant="default"
      />
    </div>
  );
};

export default DeletedUsers;
