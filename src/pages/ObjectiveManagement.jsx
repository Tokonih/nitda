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
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchObjectives, deleteObjective } from "../Slices/objectiveSlice";
import { useToast } from "@/components/ui/use-toast";
import { getErrorMessage } from "@/lib/utils";
import { DataViewToggle } from "@/components/ui/data-view-toggle";
import { DataPagination } from "@/components/ui/data-pagination";
import { CustomDialog } from "../components/ui/CustomDialog";

const ObjectiveManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState("table");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dataToDelete, setDataToDelete] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();

  const {
    list: objectives,
    loading,
    error,
  } = useSelector((state) => state.objectives);

  useEffect(() => {
    dispatch(fetchObjectives());
  }, [dispatch]);

  // Search filter
  const filteredObjectives = objectives?.filter((obj) =>
    obj?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(
    (filteredObjectives?.length || 0) / itemsPerPage
  );
  const paginatedObjectives = filteredObjectives?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 🗑️ Handle delete
  const handleDelete = async () => {
    try {
      setDeleting(true);

      await dispatch(deleteObjective(dataToDelete.id)).unwrap();
      toast({ title: "Objective deleted successfully!" });
    } catch (err) {
      toast({
        title: "Error",
        description: getErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setIsDialogOpen(false);
      setDataToDelete(null);
      setDeleting(false);
    }
  };

  if (loading) {
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
        <h1 className="text-2xl font-bold">Objective Management</h1>
        {/* <Button
          className="flex items-center text-white"
          onClick={() => navigate("/dashboard/create-objective")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Objective
        </Button> */}
      </div>

      {/* Search + Table */}
      <Card className="nitda-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Objectives</CardTitle>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search objectives..."
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
                    <TableHead>Objective Code</TableHead>
                    <TableHead>Objective Name</TableHead>
                    <TableHead>Year</TableHead>

                    <TableHead>Locked</TableHead>
                    <TableHead>Created At</TableHead>
                    {/* <TableHead>Actions</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedObjectives?.map((obj) => (
                    <TableRow key={obj.id}>
                      <TableCell>{obj.objective_code}</TableCell>
                      <TableCell className="font-medium">{obj.name}</TableCell>
                      <TableCell>{obj.year || "—"}</TableCell>

                      <TableCell>{obj.locked ? "Yes" : "No"}</TableCell>
                      <TableCell>
                        {obj.created_at
                          ? new Date(obj.created_at).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      {/* <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-primary text-primary-foreground py-1 px-2 flex items-center justify-center"
                            onClick={() =>
                              navigate(`/dashboard/objective/${obj.id}/edit`)
                            }
                          >
                            <Pencil className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive py-1 px-2 flex items-center justify-center bg-muted hover:bg-destructive/10"
                            onClick={() => {
                              setDataToDelete(obj);
                              setIsDialogOpen(true);
                            }}
                            // onClick={() => handleDelete(obj.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell> */}
                    </TableRow>
                  ))}
                  {paginatedObjectives?.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground"
                      >
                        {loading ? "Loading..." : "No objectives found"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            // Card view
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedObjectives?.map((obj) => (
                <Card key={obj.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-muted-foreground">
                        Code:
                      </span>
                      <span className="text-sm font-medium text-right">
                        {obj.objective_code}
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-muted-foreground">
                        Name:
                      </span>
                      <span className="text-sm font-medium text-right">
                        {obj.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Year:
                      </span>
                      <span className="text-sm font-medium">
                        {obj.year || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm text-muted-foreground">
                        Actions:
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-primary text-primary-foreground py-1 px-2 flex items-center justify-center"
                          onClick={() =>
                            navigate(`/dashboard/objective/${obj.id}/edit`)
                          }
                        >
                          <Pencil className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive py-1 px-2 flex items-center justify-center bg-muted hover:bg-destructive/10"
                          onClick={() => {
                            setDataToDelete(obj);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              {paginatedObjectives?.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground py-8">
                  {loading ? "Loading..." : "No objectives found"}
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

      <CustomDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title="Delete Initiative"
        description={`Are you sure you want to delete "${dataToDelete?.name || ""
          }"? This action cannot be undone.`}
      >
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="sm:ml-2 bg-[red] "
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </CustomDialog>
    </div>
  );
};

export default ObjectiveManagement;
