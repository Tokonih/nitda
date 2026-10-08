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
import { createDepartment } from "@/Slices/departmentSlice";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";

const DepartmentCreation = ({ onSuccess, onCancel }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { loading, error } = useSelector((state) => state.departments);

  const [departmentData, setDepartmentData] = useState({
    name: "",
    contact_email: "",
    type: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setDepartmentData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!departmentData.name.trim())
      newErrors.name = "Department name is required";
    if (!departmentData.contact_email.trim()) {
      newErrors.contact_email = "Contact email is required";
    } else if (!/\S+@\S+\.\S+/.test(departmentData.contact_email)) {
      newErrors.contact_email = "Enter a valid email address";
    }
    if (!departmentData.type)
      newErrors.type = "Department type is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await dispatch(createDepartment(departmentData)).unwrap();

      toast({
        title: "Department created successfully!",
        description: `${departmentData.name} has been added.`,
      });

      setDepartmentData({ name: "", contact_email: "", type: "" });
      if (onSuccess) onSuccess();
    } catch (err) {
      toast({
        title: "Error Creating Department",
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
          <h1 className="text-3xl font-bold">Create Department</h1>
          <p className="text-muted-foreground mt-2">
            Enter details to create a new department
          </p>
        </div>
      </div>

      <Card className="nitda-card">
        <CardHeader>
          <CardTitle>Department Details</CardTitle>
          <CardDescription>
            Fill in the information to create a department
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-6">
          {/* Department Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Department Name *</Label>
            <Input
              id="name"
              value={departmentData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={errors.name ? "border-red-500 p-1" : "p-1"}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Contact Email */}
          <div className="space-y-2">
            <Label htmlFor="contact_email">Contact Email *</Label>
            <Input
              id="contact_email"
              type="email"
              value={departmentData.contact_email}
              onChange={(e) => handleChange("contact_email", e.target.value)}
              className={errors.contact_email ? "border-red-500 p-1" : "p-1"}
            />
            {errors.contact_email && (
              <p className="text-sm text-red-500">{errors.contact_email}</p>
            )}
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Department Type *</Label>
            <select
              id="type"
              value={departmentData.type}
              onChange={(e) => handleChange("type", e.target.value)}
              className={`w-full rounded-md border ${errors.type ? "border-red-500" : "border-gray-300"} p-2`}
            >
              <option value="">-- Select Type --</option>
              <option value="nitda">NITDA</option>
              <option value="stakeholder">External Stakeholder</option>
            </select>
            {errors.type && (
              <p className="text-sm text-red-500">{errors.type}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleSubmit}
              disabled={loading || !departmentData.name || !departmentData.contact_email || !departmentData.type}
              className="flex items-center justify-center text-white w-full sm:w-auto"
            >
              <Save className="h-4 w-4 mr-1" />
              {loading ? "Creating..." : "Create Department"}
            </Button>
            <Button
              className="flex items-center justify-center w-full sm:w-auto"
              variant="outline"
              onClick={() => {
                setDepartmentData({ name: "", contact_email: "", type: "" });
                if (onCancel) onCancel();
              }}
            >
              <X className="h-4 w-4 mr-1" /> {onCancel ? "Cancel" : "Clear Form"}
            </Button>
          </div>

          {/* API error */}
          {error && <p className="text-red-500 mt-3">{typeof error === 'string' ? error : error?.message || 'An error occurred'}</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default DepartmentCreation;
