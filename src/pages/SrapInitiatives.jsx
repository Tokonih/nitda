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
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteSrapInitiative,
  fetchSrapInitiatives,
} from "../Slices/srapSlice";
import { CustomDialog } from "../components/ui/CustomDialog";
import { useToast } from "@/components/ui/use-toast";
import { getErrorMessage } from "@/lib/utils";
import { DataViewToggle } from "@/components/ui/data-view-toggle";
import { DataPagination } from "@/components/ui/data-pagination";

const SrapInitiativesManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [initiativeToDelete, setInitiativeToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const itemsPerPage = 10;

  const { toast } = useToast();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { list, loading, error } = useSelector((state) => state.sraps);

  useEffect(() => {
    dispatch(fetchSrapInitiatives());
  }, [dispatch, location.key]);

  // Filter by initiative name or area
  const filteredInitiatives = list?.filter(
    (initiative) =>
      initiative.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      initiative.area?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(
    (filteredInitiatives?.length || 0) / itemsPerPage
  );
  const paginatedInitiatives = filteredInitiatives?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle delete
  const handleDelete = async () => {
    if (!initiativeToDelete) return;

    try {
      setDeleting(true);

      await dispatch(deleteSrapInitiative(initiativeToDelete.id));
      toast({
        title: "Srap initiative deleted successfully!",
        className: "bg-green-600 text-white border-green-600",
      });
      dispatch(fetchSrapInitiatives());
    } catch (err) {
      toast({
        title: "Error Deleting Initiative",
        description: getErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setIsDialogOpen(false);
      setInitiativeToDelete(null);
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
        <h1 className="text-2xl font-bold">SRAP Initiatives</h1>
        {/* <Button
          className="flex items-center text-white"
          onClick={() => navigate("/dashboard/create-srap-initiative")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Initiative
        </Button> */}
      </div>

      {/* Search + Table */}
      <Card className="nitda-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Initiatives Records</CardTitle>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search initiatives..."
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
                    <TableHead>Area</TableHead>
                    <TableHead>Impact</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Lead Agency</TableHead>
                    <TableHead>Description</TableHead>
                    {/* <TableHead>Actions</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedInitiatives?.map((initiative) => (
                    <TableRow key={initiative.id}>
                      <TableCell className="font-medium">
                        {initiative.name}
                      </TableCell>
                      <TableCell>{initiative.area}</TableCell>
                      <TableCell>{initiative.impact}</TableCell>
                      <TableCell>{initiative.year}</TableCell>
                      <TableCell>{initiative.lead_agency}</TableCell>
                      <TableCell>{initiative.description}</TableCell>
                      {/* <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-primary  text-primary-foreground py-1 px-2 flex items-center justify-center"
                            onClick={() =>
                              navigate(
                                `/dashboard/srap-initiative/${initiative.id}/edit`
                              )
                            }
                          >
                            <Pencil className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive  py-1 px-2 flex items-center justify-center bg-muted hover:bg-destructive/10"
                            onClick={() => {
                              setInitiativeToDelete(initiative);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell> */}
                    </TableRow>
                  ))}
                  {paginatedInitiatives?.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground"
                      >
                        {loading ? "Loading..." : "No initiatives found"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedInitiatives?.map((initiative) => (
                <Card key={initiative.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-muted-foreground">
                        Name:
                      </span>
                      <span className="text-sm font-medium text-right">
                        {initiative.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Area:
                      </span>
                      <span className="text-sm font-medium">
                        {initiative.area}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Impact:
                      </span>
                      <span className="text-sm font-medium">
                        {initiative.impact}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Year:
                      </span>
                      <span className="text-sm font-medium">
                        {initiative.year}
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-muted-foreground">
                        Lead Agency:
                      </span>
                      <span className="text-sm font-medium text-right">
                        {initiative.lead_agency}
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-muted-foreground">
                        Description:
                      </span>
                      <span className="text-sm font-medium text-right">
                        {initiative.description}
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
                          onClick={() =>
                            navigate(
                              `/dashboard/srap-initiative/${initiative.id}/edit`
                            )
                          }
                        >
                          <Pencil className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive  py-1 px-2 flex items-center justify-center bg-muted hover:bg-destructive/10"
                          onClick={() => {
                            setInitiativeToDelete(initiative);
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
              {paginatedInitiatives?.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground py-8">
                  {loading ? "Loading..." : "No initiatives found"}
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
        description={`Are you sure you want to delete "${initiativeToDelete?.name || ""
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

export default SrapInitiativesManagement;
