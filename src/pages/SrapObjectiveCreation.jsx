import { useEffect, useState } from "react";
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
import { Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchSrapInitiatives } from "../Slices/srapSlice";
import { createObjectivesApi } from "../Slices/Utils/Api/objectives";
import { fetchDepartments } from "../Slices/departmentSlice";
import { useYears } from "@/hooks/use-years";
import { getErrorMessage } from "@/lib/utils";
const SrapObjectiveCreation = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const {
    list: initiatives,
    loading,
    error,
  } = useSelector((state) => state.sraps);
  const {
    list: departments,
    error: departmentError,
  } = useSelector((state) => state.departments);
  const { years: yearsList } = useYears();

  const [objectiveData, setObjectiveData] = useState({
    name: "",
    objective_code: "",
    impact: "",
    year: new Date().getFullYear(),
    department_id: "",
    srap_initiative_id: "",
    description: "",
  });

  const [errors, setErrors] = useState({});

  // Fetch SRAP Initiatives when page loads
  useEffect(() => {
    dispatch(fetchSrapInitiatives());
    dispatch(fetchDepartments());
  }, [dispatch]);

  const handleChange = (field, value) => {
    setObjectiveData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!objectiveData.name.trim()) newErrors.name = "Name is required";
    if (!objectiveData.objective_code.trim())
      newErrors.objective_code = "Objective code is required";
    if (!objectiveData.impact.trim()) newErrors.impact = "Impact is required";
    if (!objectiveData.year) newErrors.year = "Year is required";
    if (!objectiveData.srap_initiative_id)
      newErrors.srap_initiative_id = "Initiative is required";
    if (!objectiveData.department_id)
      newErrors.department_id = "Department ID is required";
    if (!objectiveData.description.trim())
      newErrors.description = "Description is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      await createObjectivesApi(objectiveData);
      toast({
        title: "Objective created successfully!",
        description: `${objectiveData.name} has been added.`,
      });
      setObjectiveData({
        name: "",
        objective_code: "",
        impact: "",
        year: new Date().getFullYear(),
        department_id: "",
        srap_initiative_id: "",
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
        <h1 className="text-3xl font-bold">Create SRAP Objective</h1>
        <p className="text-muted-foreground mt-2">
          Enter details to create a new SRAP objective linked to an initiative.
        </p>
      </div>

      <Card className="nitda-card">
        <CardHeader>
          <CardTitle>Objective Details</CardTitle>
          <CardDescription>
            Fill in the information to create an objective
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Department ID */}
            <div className="space-y-2">
              <Label htmlFor="department_id">Department ID *</Label>
              {/* <Input
                id="department_id"
                type="number"
                placeholder="Enter department ID"
                value={objectiveData.department_id}
                onChange={(e) => handleChange("department_id", e.target.value)}
                className={errors.department_id ? "border-red-500" : ""}
              /> */}

              <select
                id="department_id"
                className={`w-full border p-2 rounded ${errors.department_id ? "border-red-500" : "border-gray-300"
                  }`}
                value={objectiveData.department_id}
                onChange={(e) => handleChange("department_id", e.target.value)}
              >
                <option value="">Select Department</option>
                {departments.map((departments) => (
                  <option key={departments.id} value={departments.id}>
                    {departments.name}
                  </option>
                ))}
              </select>
              {errors.department_id && (
                <p className="text-sm text-red-500">{errors.department_id}</p>
              )}
            </div>

            {/* Initiative Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="srap_initiative_id">SRAP Initiative *</Label>
              <select
                id="srap_initiative_id"
                className={`w-full border p-2 rounded ${errors.srap_initiative_id
                  ? "border-red-500"
                  : "border-gray-300"
                  }`}
                value={objectiveData.srap_initiative_id}
                onChange={(e) =>
                  handleChange("srap_initiative_id", e.target.value)
                }
              >
                <option value="">Select initiative</option>
                {initiatives.map((initiative) => (
                  <option key={initiative.id} value={initiative.id}>
                    {initiative.name}
                  </option>
                ))}
              </select>
              {errors.srap_initiative_id && (
                <p className="text-sm text-red-500">
                  {errors.srap_initiative_id}
                </p>
              )}
            </div>
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Objective Name *</Label>
              <Input
                id="name"
                placeholder="Enter objective name"
                value={objectiveData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Objective Code */}
            <div className="space-y-2">
              <Label htmlFor="objective_code">Objective Code *</Label>
              <Input
                id="objective_code"
                placeholder="e.g. OBJ-SEC-001"
                value={objectiveData.objective_code}
                onChange={(e) => handleChange("objective_code", e.target.value)}
                className={errors.objective_code ? "border-red-500" : ""}
              />
              {errors.objective_code && (
                <p className="text-sm text-red-500">{errors.objective_code}</p>
              )}
            </div>

            {/* Impact */}
            <div className="space-y-2">
              <Label htmlFor="impact">Impact *</Label>
              <Input
                id="impact"
                placeholder="Enter expected impact"
                value={objectiveData.impact}
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
                value={objectiveData.year}
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
              placeholder="Enter objective description"
              value={objectiveData.description}
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
                !objectiveData.name ||
                !objectiveData.objective_code ||
                !objectiveData.impact ||
                !objectiveData.year ||
                !objectiveData.department_id ||
                !objectiveData.srap_initiative_id ||
                !objectiveData.description
              }
              className="flex items-center text-white"
            >
              <Save className="h-4 w-4 mr-1" />
              {loading ? "Creating..." : "Create Objective"}
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setObjectiveData({
                  name: "",
                  objective_code: "",
                  impact: "",
                  year: new Date().getFullYear(),
                  department_id: "",
                  srap_initiative_id: "",
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

export default SrapObjectiveCreation;
