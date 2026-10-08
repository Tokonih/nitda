import { useEffect, useState } from "react";
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
import { Save, X } from "lucide-react";
import { createSrapInitiative, fetchSraps } from "../Slices/srapSlice";
import { useToast } from "@/hooks/use-toast";
import { useDispatch, useSelector } from "react-redux";
import { useYears } from "@/hooks/use-years";
import { getErrorMessage } from "@/lib/utils";

const SrapInitiativeCreation = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();

  // Extract sraps from store
  const { list, loading, error } = useSelector((state) => state.sraps);
  const { years: yearsList } = useYears();

  const [initiativeData, setInitiativeData] = useState({
    name: "",
    initiative_code: "",
    impact: "",
    year: "",
    srap_record_id: "",
    department: "",
    description: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(fetchSraps());
  }, [dispatch]);

  const handleChange = (field, value) => {
    setInitiativeData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!initiativeData.name.trim()) newErrors.name = "Name is required";
    if (!initiativeData.initiative_code.trim())
      newErrors.initiative_code = "Initiative code is required";
    if (!initiativeData.impact.trim()) newErrors.impact = "Impact is required";
    if (!initiativeData.year) newErrors.year = "Year is required";
    if (!initiativeData.srap_record_id)
      newErrors.srap_record_id = "SRAP Record is required";
    if (!initiativeData.department.trim())
      newErrors.department = "Department is required";
    if (!initiativeData.description.trim())
      newErrors.description = "Description is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      await dispatch(createSrapInitiative(initiativeData)).unwrap();
      toast({
        title: "Initiative created successfully!",
        description: `${initiativeData.name} has been added.`,
      });

      setInitiativeData({
        name: "",
        initiative_code: "",
        impact: "",
        year: "",
        srap_record_id: "",
        department: "",
        description: "",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: getErrorMessage(err),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create SRAP Initiative</h1>
        <p className="text-muted-foreground mt-2">
          Enter details to create a new SRAP initiative
        </p>
      </div>

      <Card className="nitda-card">
        <CardHeader>
          <CardTitle>Initiative Details</CardTitle>
          <CardDescription>
            Fill in the information to create an initiative
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SRAP Record */}
            <div className="space-y-2">
              <Label htmlFor="srap_record_id">SRAP Record *</Label>
              <select
                id="srap_record_id"
                className={`w-full border p-2 rounded ${errors.srap_record_id ? "border-red-500" : "border-gray-300"
                  }`}
                value={initiativeData.srap_record_id}
                onChange={(e) => handleChange("srap_record_id", e.target.value)}
              >
                <option value="">Select SRAP Record</option>
                {list?.length > 0 ? (
                  list.map((srap) => (
                    <option key={srap.id} value={srap.id}>
                      {srap.srap_2_0_implementation_initiative_focus}
                    </option>
                  ))
                ) : (
                  <option disabled>No SRAP records found</option>
                )}
              </select>
              {errors.srap_record_id && (
                <p className="text-sm text-red-500">{errors.srap_record_id}</p>
              )}
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Input
                id="department"
                placeholder="Enter department name"
                value={initiativeData.department}
                onChange={(e) => handleChange("department", e.target.value)}
                className={errors.department ? "border-red-500" : ""}
              />
              {errors.department && (
                <p className="text-sm text-red-500">{errors.department}</p>
              )}
            </div>
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Enter initiative name"
                value={initiativeData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Initiative Code */}
            <div className="space-y-2">
              <Label htmlFor="initiative_code">Initiative Code *</Label>
              <Input
                id="initiative_code"
                placeholder="e.g. CS-AWARE-001"
                value={initiativeData.initiative_code}
                onChange={(e) =>
                  handleChange("initiative_code", e.target.value)
                }
                className={errors.initiative_code ? "border-red-500" : ""}
              />
              {errors.initiative_code && (
                <p className="text-sm text-red-500">{errors.initiative_code}</p>
              )}
            </div>

            {/* Impact */}
            <div className="space-y-2">
              <Label htmlFor="impact">Impact *</Label>
              <Input
                id="impact"
                placeholder="Enter expected impact"
                value={initiativeData.impact}
                onChange={(e) => handleChange("impact", e.target.value)}
                className={errors.impact ? "border-red-500" : ""}
              />
              {errors.impact && (
                <p className="text-sm text-red-500">{errors.impact}</p>
              )}
            </div>

            {/* Year */}
            <div className="space-y-2">
              <Label htmlFor="year">Year *</Label>
              <select
                id="year"
                className={`w-full border p-2 rounded ${errors.year ? "border-red-500" : "border-gray-300"}`}
                value={initiativeData.year}
                onChange={(e) => handleChange("year", Number(e.target.value))}
              >
                <option value="">Select Year</option>
                {yearsList?.map((y) => (
                  <option key={y.id} value={y.year}>
                    {y.year}
                  </option>
                ))}
              </select>
              {errors.year && (
                <p className="text-sm text-red-500">{errors.year}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Enter initiative description"
              value={initiativeData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              disabled={
                loading ||
                !initiativeData.name ||
                !initiativeData.initiative_code ||
                !initiativeData.impact ||
                !initiativeData.year ||
                !initiativeData.srap_record_id ||
                !initiativeData.department ||
                !initiativeData.description
              }
              className="flex items-center text-white"
            >
              <Save className="h-4 w-4 mr-1" />
              {loading ? "Creating..." : "Create Initiative"}
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setInitiativeData({
                  name: "",
                  initiative_code: "",
                  impact: "",
                  year: "",
                  srap_record_id: "",
                  department: "",
                  description: "",
                })
              }
              className="flex items-center"
            >
              <X className="h-4 w-4 mr-1" /> Clear Form
            </Button>
          </div>

          {error && (
            <p className="text-red-500 mt-3">
              {typeof error === "object" ? error.message || JSON.stringify(error) : error}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SrapInitiativeCreation;