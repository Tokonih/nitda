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
import { Search, Plus, Eye, Pencil, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { makeRequest } from "@/Slices/Utils/makeRequest";
// import {fetchPillars} from "@Slices/pillarSlice"
import { useDispatch, useSelector } from "react-redux";
import { deletePillar, fetchPillars } from "../Slices/pillarSlice";
import { useToast } from "@/components/ui/use-toast";
import { getErrorMessage } from "@/lib/utils";
import { CustomDialog } from "../components/ui/CustomDialog";
import PillarCreation from "./PillarCreation";
import EditPillarForm from "./EditPillarForm";

const PillarManagement = () => {
  const [pillars, setPillars] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPillar, setSelectedPillar] = useState(null);
  const [setLoading] = useState(false);

  // Inline View State
  const [viewMode, setViewMode] = useState("list"); // 'list', 'create', 'edit'
  const [selectedPillarId, setSelectedPillarId] = useState(null);

  const { toast } = useToast();
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((state) => state.pillars);

  useEffect(() => {
    dispatch(fetchPillars());
  }, [dispatch]);

  // Search filter
  const filteredPillars = list?.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openDeleteDialog = (pillar) => {
    setSelectedPillar(pillar);
    setDeleteDialogOpen(true);
  };

  const [deleting, setDeleting] = useState(false);
  const confirmDelete = async () => {
    if (!selectedPillar) return;

    try {
      setDeleting(true);
      await dispatch(deletePillar(selectedPillar.id)).unwrap();
      toast({
        title: "Pillar deleted successfully!",
      });
      setDeleteDialogOpen(false);
      setSelectedPillar(null);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to delete pillar",
        description: getErrorMessage(err),
      });
    } finally {
      setDeleting(false);
      // Refresh list
      dispatch(fetchPillars());
    }
  };

  const handleCreate = () => {
    setViewMode("create");
  };

  const handleEdit = (id) => {
    setSelectedPillarId(id);
    setViewMode("edit");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedPillarId(null);
  };

  const handleSuccess = () => {
    setViewMode("list");
    setSelectedPillarId(null);
    dispatch(fetchPillars());
  };

  if (viewMode === "create") {
    return (
      <PillarCreation
        onSuccess={handleSuccess}
        onCancel={handleBackToList}
      />
    );
  }

  if (viewMode === "edit") {
    return (
      <EditPillarForm
        pillarId={selectedPillarId}
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
      <div className="flex items-center justify-between w-full" id="pillar-mgmt-header">
        <h1 className="text-2xl font-bold">Pillar Management</h1>
        <Button
          id="btn-add-pillar"
          className="flex items-center text-white"
          onClick={handleCreate}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Pillar
        </Button>
      </div>

      {/* Search + Table */}
      <Card className="nitda-card" id="pillar-mgmt-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Pillars</CardTitle>
            <div className="relative" id="pillar-mgmt-search">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search pillars..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto" id="pillar-mgmt-table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPillars?.map((pillar) => (
                  <TableRow key={pillar.id}>
                    <TableCell className="font-medium">{pillar.name}</TableCell>
                    <TableCell>{pillar.description}</TableCell>
                    <TableCell>{pillar.order}</TableCell>
                    <TableCell>
                      {pillar.created_at
                        ? new Date(pillar.created_at).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleEdit(pillar.id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-2 py-1"
                        >
                          Edit
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => openDeleteDialog(pillar)}
                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1"
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPillars?.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground"
                    >
                      {loading ? "Loading..." : "No pillars found"}
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <CustomDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Pillar"
        description={`Are you sure you want to delete "${selectedPillar?.name}"? This action cannot be undone.`}
      >
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4">
          <Button
            variant="outline"
            onClick={() => setDeleteDialogOpen(false)}
            className="mt-2 sm:mt-0"
          >
            Cancel
          </Button>
          <Button
            disabled={deleting}
            variant="destructive"
            onClick={confirmDelete}
            className="sm:ml-2 bg-[red] "
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </CustomDialog>
    </div>
  );
};

export default PillarManagement;
