import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  getSingleSrapInitiative,
  updateSrapInitiative,
} from "@/Slices/srapSlice";
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
import { Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";

const EditSrapInitiativeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();

  const { currentInitiative, loading, error } = useSelector(
    (state) => state.sraps
  );

  const [formData, setFormData] = useState({
    name: "",
    department: "",
    impact: "",
    year: "",
    initiative_code: "",
    description: "",
  });

  // ✅ Fetch initiative if editing
  useEffect(() => {
    if (id) {
      dispatch(getSingleSrapInitiative(id));
    }
  }, [id, dispatch]);

  // ✅ Populate fields when initiative data is loaded
  useEffect(() => {
    if (currentInitiative) {
      setFormData({
        name: currentInitiative.name || "",
        department: currentInitiative.department || "",
        impact: currentInitiative.impact || "",
        year: currentInitiative.year || "",
        initiative_code: currentInitiative.initiative_code || "",
        description: currentInitiative.description || "",
      });
    }
  }, [currentInitiative]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (id) {
        await dispatch(updateSrapInitiative({ id, data: formData })).unwrap();
        toast({ title: "Initiative updated successfully!" });
        navigate("/dashboard/srap-initiatives"); // redirect after success
      }
    } catch (err) {
      toast({
        title: "Error Updating Initiative",
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
      <h1 className="text-3xl font-bold">
        {id ? "Edit Initiative" : "Create Initiative"}
      </h1>

      <Card className="nitda-card">
        <CardHeader>
          <CardTitle>Initiative Details</CardTitle>
          <CardDescription>
            {id
              ? "Modify initiative details"
              : "Fill in the initiative details"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Initiative Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Initiative Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          {/* department */}
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => handleChange("department", e.target.value)}
            />
          </div>

          {/* Impact */}
          <div className="space-y-2">
            <Label htmlFor="impact">Impact</Label>
            <Input
              id="impact"
              value={formData.impact}
              onChange={(e) => handleChange("impact", e.target.value)}
            />
          </div>

          {/* Year */}
          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              type="number"
              value={formData.year}
              onChange={(e) => handleChange("year", e.target.value)}
            />
          </div>

          {/* Lead Agency */}
          <div className="space-y-2">
            <Label htmlFor="initiative_code">Lead Agency</Label>
            <Input
              id="initiative_code"
              value={formData.initiative_code}
              onChange={(e) => handleChange("initiative_code", e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
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
              {loading
                ? "Saving..."
                : id
                  ? "Update Initiative"
                  : "Create Initiative"}
            </Button>
            <Button
              className="flex items-center"
              variant="outline"
              onClick={() =>
                setFormData({
                  name: "",
                  department: "",
                  impact: "",
                  year: "",
                  initiative_code: "",
                  description: "",
                })
              }
            >
              <X className="h-4 w-4 mr-1" /> Clear Form
            </Button>
          </div>

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

export default EditSrapInitiativeForm;
