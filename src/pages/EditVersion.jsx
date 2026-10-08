import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    getSingleVersion,
    updateVersion,
    clearCurrentVersion,
} from "@/Slices/versionSlice";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, X, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";

const EditVersion = ({ versionId, onSuccess, onCancel }) => {
    const dispatch = useDispatch();
    const { toast } = useToast();

    const { currentVersion, loading, error } = useSelector((state) => state.versions);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });

    const [errors, setErrors] = useState({});

    // Fetch version for edit mode
    useEffect(() => {
        if (versionId) {
            dispatch(getSingleVersion(versionId));
        } else {
            dispatch(clearCurrentVersion());
        }
    }, [versionId, dispatch]);

    // Populate state when currentVersion is loaded
    useEffect(() => {
        if (currentVersion) {
            setFormData({
                name: currentVersion.name || "",
                description: currentVersion.description || "",
            });
        }
    }, [currentVersion]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Version name is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            await dispatch(
                updateVersion({ id: versionId, versionData: formData })
            ).unwrap();
            toast({
                title: "Version updated successfully!",
                description: `${formData.name} has been updated.`,
            });

            if (onSuccess) {
                onSuccess();
            }
        } catch (err) {
            toast({
                title: "Error Updating Version",
                description: getErrorMessage(err),
                variant: "destructive",
            });
        }
    };

    if (loading && !currentVersion) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                {onCancel && (
                    <Button variant="ghost" size="icon" onClick={onCancel}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                )}
                <div>
                    <h1 className="text-3xl font-bold">Edit Version</h1>
                    <p className="text-muted-foreground mt-2">
                        Update the version details below
                    </p>
                </div>
            </div>

            <Card className="nitda-card">
                <CardHeader>
                    <CardTitle>Version Details</CardTitle>
                    <CardDescription>Modify existing information</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Version Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Version Name *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            className={errors.name ? "border-red-500 p-1" : "p-1"}
                        />
                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            rows={4}
                            className="p-2"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex items-center text-white"
                        >
                            <Save className="h-4 w-4 mr-1" />
                            {loading ? "Updating..." : "Update Version"}
                        </Button>
                        <Button
                            className="flex items-center"
                            variant="outline"
                            onClick={() => {
                                if (onCancel) onCancel();
                            }}
                        >
                            <X className="h-4 w-4 mr-1" /> Cancel
                        </Button>
                    </div>

                    {/* API error */}
                    {error && (
                        <p className="text-red-500 mt-3">
                            {getErrorMessage(error)}
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default EditVersion;
