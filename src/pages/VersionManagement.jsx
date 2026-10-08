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
import { useDispatch, useSelector } from "react-redux";
import { deleteVersion, fetchVersions } from "../Slices/versionSlice";
import { getErrorMessage } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { DataViewToggle } from "@/components/ui/data-view-toggle";
import { DataPagination } from "@/components/ui/data-pagination";
import CreateVersion from "./CreateVersion";
import EditVersion from "./EditVersion";
import ConfirmModal from "@/components/ui/ConfirmModal";

const VersionManagement = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [view, setView] = useState("table");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Inline View State
    const [viewMode, setViewMode] = useState("list"); // 'list', 'create', 'edit'
    const [selectedVersionId, setSelectedVersionId] = useState(null);
    const [confirmModal, setConfirmModal] = useState({
        open: false,
        versionId: null,
        versionName: "",
    });

    const dispatch = useDispatch();
    const { toast } = useToast();

    const { list, loading } = useSelector((state) => state.versions);

    useEffect(() => {
        dispatch(fetchVersions({ per_page: 100 }));
    }, [dispatch]);

    // Search filter
    const filteredVersions = list?.filter((version) =>
        version?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination
    const totalPages = Math.ceil((filteredVersions?.length || 0) / itemsPerPage);
    const paginatedVersions = filteredVersions?.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Handle delete
    const handleDelete = (id, name) => {
        setConfirmModal({ open: true, versionId: id, versionName: name });
    };

    const performDelete = async () => {
        const { versionId } = confirmModal;
        setConfirmModal({ open: false, versionId: null, versionName: "" });

        try {
            await dispatch(deleteVersion(versionId)).unwrap();
            toast({
                title: "Version deleted successfully!",
                className: "bg-green-600 text-white border-green-600",
            });
            dispatch(fetchVersions({ per_page: 100 }));
        } catch (err) {
            toast({
                title: "Error Deleting Version",
                description: getErrorMessage(err),
                variant: "destructive",
            });
        }
    };

    const handleCreate = () => {
        setViewMode("create");
    };

    const handleEdit = (id) => {
        setSelectedVersionId(id);
        setViewMode("edit");
    };

    const handleBackToList = () => {
        setViewMode("list");
        setSelectedVersionId(null);
    };

    const handleSuccess = () => {
        setViewMode("list");
        setSelectedVersionId(null);
        dispatch(fetchVersions({ per_page: 100 }));
    };

    if (viewMode === "create") {
        return <CreateVersion onSuccess={handleSuccess} onCancel={handleBackToList} />;
    }

    if (viewMode === "edit") {
        return (
            <EditVersion
                versionId={selectedVersionId}
                onSuccess={handleSuccess}
                onCancel={handleBackToList}
            />
        );
    }

    if (loading && viewMode === "list") {
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
                <h1 className="text-2xl font-bold">Version Management</h1>
                <Button className="flex items-center text-white" onClick={handleCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Version
                </Button>
            </div>

            {/* Search + Table */}
            <Card className="nitda-card">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <CardTitle>Versions</CardTitle>
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    placeholder="Search versions..."
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
                                        <TableHead>Version Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Created At</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedVersions?.map((version) => (
                                        <TableRow key={version.id}>
                                            <TableCell className="font-medium">{version.name}</TableCell>
                                            <TableCell>{version.description || "—"}</TableCell>
                                            <TableCell>
                                                {version.created_at
                                                    ? new Date(version.created_at).toLocaleDateString()
                                                    : "—"}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        className="bg-primary text-primary-foreground py-1 px-2 flex items-center justify-center"
                                                        onClick={() => handleEdit(version.id)}
                                                    >
                                                        <Pencil className="h-3 w-3 mr-1" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-muted-foreground hover:text-destructive py-1 px-2 flex items-center justify-center bg-muted hover:bg-destructive/10"
                                                        onClick={() => handleDelete(version.id, version.name)}
                                                    >
                                                        <Trash2 className="h-3 w-3 mr-1" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {paginatedVersions?.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className="text-center text-muted-foreground"
                                            >
                                                {loading ? "Loading..." : "No versions found"}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {paginatedVersions?.map((version) => (
                                <Card key={version.id} className="p-4">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-start">
                                            <span className="text-sm text-muted-foreground">Name:</span>
                                            <span className="text-sm font-medium text-right">
                                                {version.name}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-start">
                                            <span className="text-sm text-muted-foreground">Description:</span>
                                            <span className="text-sm font-medium text-right">
                                                {version.description || "—"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Created At:</span>
                                            <span className="text-sm font-medium">
                                                {version.created_at
                                                    ? new Date(version.created_at).toLocaleDateString()
                                                    : "—"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t">
                                            <span className="text-sm text-muted-foreground">Actions:</span>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    className="bg-primary text-primary-foreground py-1 px-2 flex items-center justify-center"
                                                    onClick={() => handleEdit(version.id)}
                                                >
                                                    <Pencil className="h-3 w-3 mr-1" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-muted-foreground hover:text-destructive py-1 px-2 flex items-center justify-center bg-muted hover:bg-destructive/10"
                                                    onClick={() => handleDelete(version.id, version.name)}
                                                >
                                                    <Trash2 className="h-3 w-3 mr-1" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                            {paginatedVersions?.length === 0 && (
                                <div className="col-span-full text-center text-muted-foreground py-8">
                                    {loading ? "Loading..." : "No versions found"}
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
                onClose={() =>
                    setConfirmModal({ open: false, versionId: null, versionName: "" })
                }
                title="Delete Version"
                description={`Are you sure you want to delete "${confirmModal.versionName}"? This action cannot be undone.`}
                onConfirm={performDelete}
                confirmText="Delete"
                cancelText="Cancel"
                confirmVariant="destructive"
            />
        </div>
    );
};

export default VersionManagement;
