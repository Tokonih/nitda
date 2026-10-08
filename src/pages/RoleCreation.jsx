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
import { Save, X, ArrowLeft } from "lucide-react";
import { createRole } from "@/Slices/roleSlice";
import { useToast } from "@/hooks/use-toast";
import { getPermissionApi } from "../Slices/Utils/Api/permissions";
import { getErrorMessage } from "@/lib/utils";
import Select from "react-select";

const RoleCreation = ({ onSuccess, onCancel }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { loading, error } = useSelector((state) => state.roles);
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [roleData, setRoleData] = useState({
    name: "",
    description: "",
    permissions: [],
  });

  const formatPermissionName = (name) => {
    let cleaned = name.replace(/[.\-]/g, " ");

    return cleaned
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  useEffect(() => {
    const getPermissions = async () => {
      try {
        setLoadingPermissions(true);
        const response = await getPermissionApi();
        setPermissions(response.data);
      } catch (err) {
        toast({
          title: "Error fetching permissions",
          description: getErrorMessage(err),
          variant: "destructive",
        });
      } finally {
        setLoadingPermissions(false);
      }
    };
    getPermissions();
  }, []);

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setRoleData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!roleData.name.trim()) newErrors.name = "Role name is required";
    if (!roleData.description.trim())
      newErrors.description = "Role description is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await dispatch(createRole(roleData)).unwrap();

      toast({
        title: "Role created successfully!",
        description: `${roleData.name} has been added.`,
      });

      setRoleData({ name: "", description: "", permissions: [] });
      if (onSuccess) onSuccess();
    } catch (err) {
      toast({
        title: "Error Creating Role",
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
          <h1 className="text-3xl font-bold">Create Role</h1>
          <p className="text-muted-foreground mt-2">
            Enter details to create a new role
          </p>
        </div>
      </div>

      <Card className="nitda-card">
        <CardHeader>
          <CardTitle>Role Details</CardTitle>
          <CardDescription>
            Fill in the information to create a role
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Role Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Role Name *</Label>
              <Input
                id="name"
                value={roleData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={errors.name ? "border-red-500 p-1" : "p-1"}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Role Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={roleData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className={errors.description ? "border-red-500 p-1" : "p-1"}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>
          </div>
          {/* Permissions Checkboxes */}
          <div className="space-y-2">
            <Label>Permissions</Label>
            {loadingPermissions ? (
              <p>Loading permissions...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {permissions.map((perm) => (
                  <label
                    key={perm.id}
                    className="flex items-center gap-2 border p-2 rounded hover:bg-slate-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      value={perm.id}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      checked={roleData.permissions.includes(perm.id)}
                      onChange={() => {
                        const exists = roleData.permissions.includes(perm.id);
                        handleChange(
                          "permissions",
                          exists
                            ? roleData.permissions.filter(
                              (id) => id !== perm.id
                            )
                            : [...roleData.permissions, perm.id]
                        );
                      }}
                    />
                    <span className="text-sm">{formatPermissionName(perm.name)}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              disabled={loading || !roleData.name || !roleData.description}
              className="flex items-center text-white"
            >
              <Save className="h-4 w-4 mr-1" />
              {loading ? "Creating..." : "Create Role"}
            </Button>
            <Button
              className="flex items-center"
              variant="outline"
              onClick={() => {
                setRoleData({ name: "", description: "", permissions: [] });
                if (onCancel) onCancel();
              }}
            >
              <X className="h-4 w-4 mr-1" /> {onCancel ? "Cancel" : "Clear Form"}
            </Button>
          </div>

          {/* API error */}
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

export default RoleCreation;
