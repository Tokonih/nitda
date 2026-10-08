import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { createPillar, getSinglePillar, updatePillar } from "@/Slices/pillarSlice";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getVersionsApi } from "../Slices/Utils/Api/versions";
import { Save, X, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";

const EditPillarForm = ({ pillarId, onSuccess, onCancel }) => {
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();

  const id = pillarId || params.id;

  const { currentPillar, loading, error } = useSelector((state) => state.pillars);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    order: "",
    version_id: 1,
    version: "", // Store version name
    visible_to_stakeholders: false,
  });

  const [versions, setVersions] = useState([]);

  // Fetch versions
  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const response = await getVersionsApi();
        setVersions(response.data || []);
      } catch (error) {
        toast({
          title: "Error fetching versions",
          description: "Could not load versions list",
          variant: "destructive",
        });
      }
    };
    fetchVersions();
  }, []);

  // ✅ Fetch pillar if editing
  useEffect(() => {
    if (id) {
      dispatch(getSinglePillar(id));
    }
  }, [id, dispatch]);

  // ✅ Populate fields when pillar data is loaded
  useEffect(() => {
    if (currentPillar && versions.length > 0) { // Wait for versions to load to match name
      const foundVersion = versions.find(v => v.id === (currentPillar.version_id || 1));
      setFormData({
        name: currentPillar.name || "",
        description: currentPillar.description || "",
        order: currentPillar.order || "",
        version_id: currentPillar.version_id || 1,
        version: foundVersion ? foundVersion.name : "",
        visible_to_stakeholders: currentPillar.visible_to_stakeholders || false,
      });
    }
  }, [currentPillar, versions]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (id) {
        await dispatch(updatePillar({ id, data: formData })).unwrap();
        toast({ title: "Pillar updated successfully!" });
      } else {
        // Create logic if needed, but usually handled by PillarCreation
        await dispatch(createPillar(formData)).unwrap();
        toast({ title: "Pillar created successfully!" });
      }

      if (onSuccess) {
        onSuccess();
      } else {
        // navigate("/dashboard/pillars"); // Or wherever it should go
      }

    } catch (err) {
      toast({
        title: "Error Saving Pillar",
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
        <h1 className="text-3xl font-bold">{id ? "Edit Pillar" : "Create Pillar"}</h1>
      </div>

      <Card className="nitda-card">
        <CardHeader>
          <CardTitle>Pillar Details</CardTitle>
          <CardDescription>
            {id ? "Modify pillar details" : "Fill in the pillar details"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="version">Version</Label>
              <Select
                value={formData.version_id ? formData.version_id.toString() : "1"}
                onValueChange={(value) => {
                  const selectedId = parseInt(value);
                  const selectedVersion = versions.find((v) => v.id === selectedId);
                  setFormData((prev) => ({
                    ...prev,
                    version_id: selectedId,
                    version: selectedVersion ? selectedVersion.name : "",
                  }));
                }}
              >
                <SelectTrigger id="version" className="w-full">
                  <SelectValue placeholder="Select Version" />
                </SelectTrigger>
                <SelectContent>
                  {versions.map((version) => (
                    <SelectItem key={version.id} value={version.id.toString()}>
                      {version.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

          </div>

          {/* Pillar name */}
          <div className="space-y-2">
            <Label htmlFor="name">Pillar Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          {/* Pillar description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          {/* Order */}
          <div className="space-y-2">
            <Label htmlFor="order">Order</Label>
            <Input
              id="order"
              type="number"
              value={formData.order}
              onChange={(e) => handleChange("order", e.target.value)}
            />
          </div>

          {/* Visible to Stakeholders */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="visible_to_stakeholders"
              checked={formData.visible_to_stakeholders}
              onChange={(e) => handleChange("visible_to_stakeholders", e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="visible_to_stakeholders" className="cursor-pointer">
              Visible to Stakeholders
            </Label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center text-white"
            >
              <Save className="h-4 w-4 mr-1" />
              {loading ? "Saving..." : id ? "Update Pillar" : "Create Pillar"}
            </Button>
            <Button
              className="flex items-center"
              variant="outline"
              onClick={() => {
                setFormData({ name: "", description: "", order: "", version_id: 1 });
                if (onCancel) onCancel();
              }}
            >
              <X className="h-4 w-4 mr-1" /> {onCancel ? "Cancel" : "Clear Form"}
            </Button>
          </div>

          {error && <p className="text-red-500 mt-3">{getErrorMessage(error)}</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default EditPillarForm;
