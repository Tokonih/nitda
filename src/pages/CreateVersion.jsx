import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { createVersion } from "@/Slices/versionSlice";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";

const CreateVersion = ({ onSuccess, onCancel }) => {
    const dispatch = useDispatch();
    const { toast } = useToast();
    const { loading, error } = useSelector((state) => state.versions);

    const [versionData, setVersionData] = useState({
        name: "",
        description: "",
    });

    const [errors, setErrors] = useState({});

    const handleChange = (field, value) => {
        setVersionData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!versionData.name.trim()) newErrors.name = "Version name is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            await dispatch(createVersion(versionData)).unwrap();

            toast({
                title: "Version created successfully!",
                description: `${versionData.name} has been added.`,
            });

            setVersionData({ name: "", description: "" });
            if (onSuccess) onSuccess();
        } catch (err) {
            toast({
                title: "Error Creating Version",
                description: getErrorMessage(err),
                variant: "destructive",
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                {onCancel && (
                    <Button variant="ghost" size="icon" onClick={onCancel}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                )}
                <div>
                    <h1 className="text-3xl font-bold">Create Version</h1>
                    <p className="text-muted-foreground mt-2">
                        Enter details to create a new version
                    </p>
                </div>
            </div>

            <Card className="nitda-card">
                <CardHeader>
                    <CardTitle>Version Details</CardTitle>
                    <CardDescription>
                        Fill in the information to create a version
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Version Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Version Name *</Label>
                        <Input
                            id="name"
                            placeholder="e.g., SRAP 2.0"
                            value={versionData.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            className={errors.name ? "border-red-500 p-1" : "p-1"}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">{errors.name}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Enter version description (optional)"
                            value={versionData.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            rows={4}
                            className="p-2"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <Button
                            onClick={handleSubmit}
                            disabled={loading || !versionData.name}
                            className="flex items-center text-white"
                        >
                            <Save className="h-4 w-4 mr-1" />
                            {loading ? "Creating..." : "Create Version"}
                        </Button>
                        <Button
                            className="flex items-center"
                            variant="outline"
                            onClick={() => {
                                setVersionData({ name: "", description: "" });
                                if (onCancel) onCancel();
                            }}
                        >
                            <X className="h-4 w-4 mr-1" /> {onCancel ? "Cancel" : "Clear Form"}
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

export default CreateVersion;
