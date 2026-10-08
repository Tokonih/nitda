import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getVersionsApi } from "../Slices/Utils/Api/versions";
import { Save, X, ArrowLeft } from "lucide-react";
import { createPillar } from "../Slices/pillarSlice";
import { useToast } from "@/hooks/use-toast";
import { useDispatch, useSelector } from "react-redux";
import { getErrorMessage } from "@/lib/utils";

const PillarCreation = ({ onSuccess, onCancel }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { loading, error } = useSelector((state) => state.pillars);
  const [pillarData, setPillarData] = useState({
    name: "",
    description: "",
    order: "",
    version_id: 1,
    version: "", // Store version name
    visible_to_stakeholders: false,
  });

  const [errors, setErrors] = useState({});
  const [versions, setVersions] = useState([]);

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const response = await getVersionsApi();
        setVersions(response.data || []);
      } catch (error) {
        toast({
          title: "Error fetching versions",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      }
    };
    fetchVersions();
  }, []);

  const handleChange = (field, value) => {
    setPillarData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!pillarData.name.trim()) newErrors.name = "Name is required";
    if (!pillarData.description.trim())
      newErrors.description = "Description is required";
    if (!pillarData.order) newErrors.order = "Order is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      await dispatch(createPillar(pillarData)).unwrap();
      toast({
        title: "Pillar created successfully!",
        description: `${pillarData.name} has been added.`,
      });

      setPillarData({
        name: "",
        description: "",
        order: "",
        version_id: 1,
        visible_to_stakeholders: false,
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      toast({
        title: "Error Creating Pillar",
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
          <h1 className="text-3xl font-bold">Create Pillar</h1>
          <p className="text-muted-foreground mt-2">
            Enter details to create a new strategic pillar
          </p>
        </div>
      </div>

      <Card className="nitda-card">
        <CardHeader>
          <CardTitle>Pillar Details</CardTitle>
          <CardDescription>
            Fill in the information to create a pillar
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="version">Version</Label>
              <Select
                value={pillarData.version_id.toString()}
                onValueChange={(value) => {
                  const selectedId = parseInt(value);
                  const selectedVersion = versions.find((v) => v.id === selectedId);
                  setPillarData((prev) => ({
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
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Enter pillar name"
                value={pillarData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={errors.name ? "border-red-500 p-1" : "p-1"}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Order */}
            <div className="space-y-2">
              <Label htmlFor="order">Order *</Label>
              <Input
                id="order"
                type="number"
                placeholder="Enter display order"
                value={pillarData.order}
                onChange={(e) => handleChange("order", e.target.value)}
                className={errors.order ? "border-red-500 p-1" : "p-1"}
              />
              {errors.order && (
                <p className="text-sm text-red-500">{errors.order}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Enter pillar description"
              value={pillarData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className={errors.description ? "border-red-500 p-1" : "p-1"}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Visible to Stakeholders */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="visible_to_stakeholders"
              checked={pillarData.visible_to_stakeholders}
              onChange={(e) => handleChange("visible_to_stakeholders", e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="visible_to_stakeholders" className="cursor-pointer">
              Visible to Stakeholders
            </Label>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              disabled={
                loading ||
                !pillarData.name ||
                !pillarData.description ||
                !pillarData.order
              }
              className="flex items-center text-white"
            >
              <Save className="h-4 w-4 mr-1" />
              {loading ? "Creating..." : "Create Pillar"}
            </Button>
            <Button
              className="flex items-center"
              variant="outline"
              onClick={() => {
                if (onCancel) {
                  onCancel();
                } else {
                  setPillarData({
                    name: "",
                    description: "",
                    order: "",
                    version_id: 1,
                    visible_to_stakeholders: false,
                  })
                }
              }}
            >
              <X className="h-4 w-4 mr-1" /> {onCancel ? "Cancel" : "Clear Form"}
            </Button>
          </div>
          {error && <p className="text-red-500 mt-3">{typeof error === 'string' ? error : error?.message || 'An error occurred'}</p>}
        </CardContent>
      </Card>

      {/* Preview */}
      {pillarData.name && (
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{pillarData.name}</p>
            <p className="text-sm text-muted-foreground">
              {pillarData.description}
            </p>
            <p className="text-sm">Order: {pillarData.order}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PillarCreation;
