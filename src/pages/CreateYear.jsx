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
import { Save, X, ArrowLeft } from "lucide-react";
import { createYear } from "@/Slices/yearSlice";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";


const CreateYear = ({ onSuccess, onCancel }) => {
    const dispatch = useDispatch();
    const { toast } = useToast();
    const { loading, error } = useSelector((state) => state.years);

    const [yearData, setYearData] = useState({
        year: "",
        is_active: true,
    });

    const [errors, setErrors] = useState({});

    const handleChange = (field, value) => {
        setYearData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!yearData.year) newErrors.year = "Year is required";
        else if (isNaN(yearData.year) || yearData.year < 2000 || yearData.year > 2100)
            newErrors.year = "Please enter a valid year (2000-2100)";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        const payload = {
            year: parseInt(yearData.year),
            is_active: true
        };

        try {
            await dispatch(createYear(payload)).unwrap();

            toast({
                title: "Year created successfully!",
                description: `${yearData.year} has been added.`,
            });

            setYearData({ year: "", is_active: true });
            if (onSuccess) onSuccess();
        } catch (err) {
            toast({
                title: "Error Creating Year",
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
                    <h1 className="text-3xl font-bold">Create Year</h1>
                    <p className="text-muted-foreground mt-2">
                        Enter details to create a new year
                    </p>
                </div>
            </div>

            <Card className="nitda-card">
                <CardHeader>
                    <CardTitle>Year Details</CardTitle>
                    <CardDescription>
                        Fill in the information to create a year
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Year Input */}
                    <div className="space-y-2">
                        <Label htmlFor="year">Year *</Label>
                        <Input
                            id="year"
                            type="number"
                            placeholder="e.g., 2026"
                            value={yearData.year}
                            onChange={(e) => handleChange("year", e.target.value)}
                            className={errors.year ? "border-red-500 p-1" : "p-1"}
                        />
                        {errors.year && (
                            <p className="text-sm text-red-500">{errors.year}</p>
                        )}
                    </div>



                    {/* Buttons */}
                    <div className="flex gap-3">
                        <Button
                            onClick={handleSubmit}
                            disabled={loading || !yearData.year}
                            className="flex items-center text-white"
                        >
                            <Save className="h-4 w-4 mr-1" />
                            {loading ? "Creating..." : "Create Year"}
                        </Button>
                        <Button
                            className="flex items-center"
                            variant="outline"
                            onClick={() => {
                                setYearData({ year: "", is_active: true });
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

export default CreateYear;
