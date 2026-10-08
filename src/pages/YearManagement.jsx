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
import { Search, Plus, Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { deleteYear, fetchYears } from "../Slices/yearSlice";
import { useNavigate } from "react-router-dom";
import { formatNumberWithCommas, getErrorMessage } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { DataViewToggle } from "@/components/ui/data-view-toggle";
import { DataPagination } from "@/components/ui/data-pagination";
import CreateYear from "./CreateYear";
import EditYear from "./EditYear";
import ConfirmModal from "@/components/ui/ConfirmModal";

const YearManagement = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [view, setView] = useState("table");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Inline View State
    const [viewMode, setViewMode] = useState("list"); // 'list', 'create', 'edit'
    const [selectedYearId, setSelectedYearId] = useState(null);
    const [confirmModal, setConfirmModal] = useState({
        open: false,
        yearId: null,
        yearName: "",
    });

    const dispatch = useDispatch();
    const { toast } = useToast();

    const { list, loading } = useSelector((state) => state.years);

    useEffect(() => {
        dispatch(fetchYears({ per_page: 100, all: true }));
    }, [dispatch]);

    // Search filter
    const filteredYears = list?.filter((item) =>
        String(item?.year || "").includes(searchTerm)
    );

    // Pagination
    const totalPages = Math.ceil((filteredYears?.length || 0) / itemsPerPage);
    const paginatedYears = filteredYears?.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Handle delete
    const handleDelete = (id, year) => {
        setConfirmModal({ open: true, yearId: id, yearName: String(year || "") });
    };

    const performDelete = async () => {
        const { yearId, yearName } = confirmModal; // Destructure yearName as well
        setConfirmModal({ open: false, yearId: null, yearName: "" });

        try {
            await dispatch(deleteYear(yearId)).unwrap();
            toast({
                title: `Year "${yearName}" deleted successfully!`,
                className: "bg-green-600 text-white border-green-600",
            });
            dispatch(fetchYears({ per_page: 100, all: true }));
        } catch (err) {
            toast({
                title: "Error Deleting Year",
                description: getErrorMessage(err), // Use getErrorMessage
                variant: "destructive",
            });
        }
    };

    const handleCreate = () => {
        setViewMode("create");
    };

    const handleEdit = (id) => {
        setSelectedYearId(id);
        setViewMode("edit");
    };

    const handleBackToList = () => {
        setViewMode("list");
        setSelectedYearId(null);
    };

    const handleSuccess = () => {
        setViewMode("list");
        setSelectedYearId(null);
        dispatch(fetchYears({ per_page: 100, all: true }));
    };

    if (viewMode === "create") {
        return <CreateYear onSuccess={handleSuccess} onCancel={handleBackToList} />;
    }

    if (viewMode === "edit") {
        return (
            <EditYear
                yearId={selectedYearId}
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
                <h1 className="text-2xl font-bold">Year Management</h1>
                <Button className="flex items-center text-white" onClick={handleCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Year
                </Button>
            </div>

            {/* Search + Table */}
            <Card className="nitda-card">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <CardTitle>Years</CardTitle>
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    placeholder="Search years..."
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
                                        <TableHead>Year</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Created At</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedYears?.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.year}</TableCell>
                                            <TableCell>
                                                {item.is_active ? (
                                                    <span className="flex items-center text-green-600">
                                                        <CheckCircle className="w-4 h-4 mr-1" /> Active
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center text-gray-500">
                                                        <XCircle className="w-4 h-4 mr-1" /> Inactive
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {item.created_at
                                                    ? new Date(item.created_at).toLocaleDateString()
                                                    : "—"}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        className="bg-primary text-primary-foreground py-1 px-2 flex items-center justify-center"
                                                        onClick={() => handleEdit(item.id)}
                                                    >
                                                        <Pencil className="h-3 w-3 mr-1" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-muted-foreground hover:text-destructive py-1 px-2 flex items-center justify-center bg-muted hover:bg-destructive/10"
                                                        onClick={() => handleDelete(item.id, item.year)}
                                                    >
                                                        <Trash2 className="h-3 w-3 mr-1" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {paginatedYears?.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className="text-center text-muted-foreground"
                                            >
                                                {loading ? "Loading..." : "No years found"}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {paginatedYears?.map((item) => (
                                <Card key={item.id} className="p-4">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-start">
                                            <span className="text-sm text-muted-foreground">Year:</span>
                                            <span className="text-sm font-medium text-right">
                                                {item.year}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-start">
                                            <span className="text-sm text-muted-foreground">Status:</span>
                                            <span className="text-sm font-medium text-right">
                                                {item.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Created At:</span>
                                            <span className="text-sm font-medium">
                                                {item.created_at
                                                    ? new Date(item.created_at).toLocaleDateString()
                                                    : "—"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t">
                                            <span className="text-sm text-muted-foreground">Actions:</span>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    className="bg-primary text-primary-foreground py-1 px-2 flex items-center justify-center"
                                                    onClick={() => handleEdit(item.id)}
                                                >
                                                    <Pencil className="h-3 w-3 mr-1" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-muted-foreground hover:text-destructive py-1 px-2 flex items-center justify-center bg-muted hover:bg-destructive/10"
                                                    onClick={() => handleDelete(item.id, item.year)}
                                                >
                                                    <Trash2 className="h-3 w-3 mr-1" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                            {paginatedYears?.length === 0 && (
                                <div className="col-span-full text-center text-muted-foreground py-8">
                                    {loading ? "Loading..." : "No years found"}
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
                    setConfirmModal({ open: false, yearId: null, yearName: "" })
                }
                title="Delete Year"
                description={`Are you sure you want to delete "${confirmModal.yearName}"? This action cannot be undone.`}
                onConfirm={performDelete}
                confirmText="Delete"
                cancelText="Cancel"
                confirmVariant="destructive"
            />
        </div>
    );
};

export default YearManagement;
