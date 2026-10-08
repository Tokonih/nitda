import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    getSingleYear,
    updateYear,
    clearCurrentYear,
} from "@/Slices/yearSlice";
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
import { Save, X, ArrowLeft } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";

const EditYear = ({ yearId, onSuccess, onCancel }) => {
    const dispatch = useDispatch();
    const { toast } = useToast();

    const { currentYear, loading, error } = useSelector((state) => state.years);

    const [formData, setFormData] = useState({
        year: "",
        is_active: true,
    });

    const [errors, setErrors] = useState({});

    // Fetch year for edit mode
    useEffect(() => {
        if (yearId) {
            dispatch(getSingleYear(yearId));
        } else {
            dispatch(clearCurrentYear());
        }
    }, [yearId, dispatch]);

    // Populate state when currentYear is loaded
    useEffect(() => {
        if (currentYear) {
            setFormData({
                year: currentYear.year || "",
                is_active: currentYear.is_active ?? true,
            });
        }
    }, [currentYear]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.year) newErrors.year = "Year is required";
        else if (isNaN(formData.year) || formData.year < 2000 || formData.year > 2100)
            newErrors.year = "Please enter a valid year (2000-2100)";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        const payload = {
            year: parseInt(formData.year),
            is_active: true
        };

        try {
            await dispatch(
                updateYear({ id: yearId, yearData: payload })
            ).unwrap();
            toast({
                title: "Year updated successfully!",
                description: `${formData.year} has been updated.`,
            });

            if (onSuccess) {
                onSuccess();
            }
        } catch (err) {
            toast({
                title: "Error Updating Year",
                description: getErrorMessage(err),
                variant: "destructive",
            });
        }
    };

    if (loading && !currentYear) {
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
                    <h1 className="text-3xl font-bold">Edit Year</h1>
                    <p className="text-muted-foreground mt-2">
                        Update the year details below
                    </p>
                </div>
            </div>

            <Card className="nitda-card">
                <CardHeader>
                    <CardTitle>Year Details</CardTitle>
                    <CardDescription>Modify existing information</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Year Input */}
                    <div className="space-y-2">
                        <Label htmlFor="year">Year *</Label>
                        <Input
                            id="year"
                            type="number"
                            value={formData.year}
                            onChange={(e) => handleChange("year", e.target.value)}
                            className={errors.year ? "border-red-500 p-1" : "p-1"}
                        />
                        {errors.year && <p className="text-sm text-red-500">{errors.year}</p>}
                    </div>



                    {/* Buttons */}
                    <div className="flex gap-3">
                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex items-center text-white"
                        >
                            <Save className="h-4 w-4 mr-1" />
                            {loading ? "Updating..." : "Update Year"}
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

export default EditYear;
