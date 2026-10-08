import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  createDepartment,
  getDepartmentById,
  updateDepartment,
  clearCurrentDepartment,
} from "@/Slices/departmentSlice";
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

const EditDepartmentForm = ({ deptId, onSuccess, onCancel }) => {
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();

  const id = deptId || params.id;

  const { currentDepartment, loading, error } = useSelector(
    (state) => state.departments
  );

  const [formData, setFormData] = useState({
    name: "",
    contact_email: "",
    type: "",
  });

  const [errors, setErrors] = useState({});

  // Fetch department for edit mode
  useEffect(() => {
    if (id) {
      dispatch(getDepartmentById(id));
    } else {
      dispatch(clearCurrentDepartment());
    }
  }, [id, dispatch]);

  // Populate state when currentDepartment is loaded
  useEffect(() => {
    if (currentDepartment) {
      setFormData({
        name: currentDepartment.name || "",
        contact_email: currentDepartment.contact_email || "",
        type: currentDepartment.type || "",
      });
    }
  }, [currentDepartment]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Department name is required";
    if (!formData.contact_email.trim()) {
      newErrors.contact_email = "Contact email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.contact_email)) {
      newErrors.contact_email = "Enter a valid email address";
    }
    if (!formData.type)
      newErrors.type = "Department type is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      if (id) {
        await dispatch(updateDepartment({ id, data: formData })).unwrap();
        toast({
          title: "Department updated successfully!",
          description: `${formData.name} has been updated.`,
        });
      } else {
        await dispatch(createDepartment(formData)).unwrap();
        toast({
          title: "Department created successfully!",
          description: `${formData.name} has been added.`,
        });
      }

      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/dashboard/departments");
      }
    } catch (err) {
      toast({
        title: "Error Saving Department",
        description: getErrorMessage(err),
        variant: "destructive",
      });
    }
  };

  if (loading) {
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
          <h1 className="text-3xl font-bold">
            {id ? "Edit Department" : "Create Department"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {id
              ? "Update the department details below"
              : "Enter details to create a new department"}
          </p>
        </div>
      </div>

      <Card className="nitda-card">
        <CardHeader>
          <CardTitle>Department Details</CardTitle>
          <CardDescription>
            {id ? "Modify existing information" : "Fill in the information"}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-6">
          {/* Department Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Department Name *</Label>
            <Input
              id="name"
              value={formData.name}
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
              value={formData.contact_email}
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
              value={formData.type}
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
              disabled={loading}
              className="flex items-center justify-center text-white w-full sm:w-auto"
            >
              <Save className="h-4 w-4 mr-1" />
              {loading
                ? id
                  ? "Updating..."
                  : "Creating..."
                : id
                  ? "Update Department"
                  : "Create Department"}
            </Button>
            <Button
              className="flex items-center justify-center w-full sm:w-auto"
              variant="outline"
              onClick={() => {
                setFormData({ name: "", contact_email: "", type: "" });
                if (onCancel) onCancel();
              }}
            >
              <X className="h-4 w-4 mr-1" /> {onCancel ? "Cancel" : "Clear Form"}
            </Button>
          </div>

          {/* API error */}
          {error && <p className="text-red-500 mt-3">{getErrorMessage(error)}</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default EditDepartmentForm;
