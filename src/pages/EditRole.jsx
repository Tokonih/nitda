import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { getRoleById, uppdateRole } from "@/Slices/roleSlice";
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
import { getPermissionApi } from "../Slices/Utils/Api/permissions";

const EditRoleForm = ({ roleId, onSuccess, onCancel }) => {
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();

  // Use prop ID if available, otherwise fall back to URL params
  const id = roleId || params.id;

  const { currentRole, loading, error } = useSelector((state) => state.roles);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [],
  });

  const [permissions, setPermissions] = useState([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  const formatPermissionName = (name) => {
    let cleaned = name.replace(/[.\-]/g, " ");

    return cleaned
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Fetch all permissions
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setLoadingPermissions(true);
        const res = await getPermissionApi();
        setPermissions(res.data);
      } catch (err) {
        // Failed to fetch permissions
      } finally {
        setLoadingPermissions(false);
      }
    };
    fetchPermissions();
  }, []);

  // Fetch role by id
  useEffect(() => {
    if (id) {
      dispatch(getRoleById(id));
    }
  }, [id, dispatch]);

  // Populate when role is loaded
  useEffect(() => {
    if (currentRole) {
      setFormData({
        name: currentRole.name || "",
        description: currentRole.description || "",
        permissions: currentRole.permissions?.map((p) => p.id) || [],
      });
    }
  }, [currentRole]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const togglePermission = (permId) => {
    setFormData((prev) => {
      const exists = prev.permissions.includes(permId);
      return {
        ...prev,
        permissions: exists
          ? prev.permissions.filter((id) => id !== permId)
          : [...prev.permissions, permId],
      };
    });
  };

  const handleSubmit = async () => {
    try {
      await dispatch(uppdateRole({ id, data: formData })).unwrap();
      toast({ title: "Role updated successfully!" });

      if (onSuccess) {
        onSuccess();
      } else {
        // navigate("/dashboard/roles");
      }
    } catch (err) {
      toast({
        title: "Error Updating Role",
        description: getErrorMessage(err),
        variant: "destructive",
      });
    }
  };

  if (loading || loadingPermissions) {
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
        <h1 className="text-3xl font-bold">
          {id ? "Edit Role" : "Create Role"}
        </h1>
      </div>

      <Card className="nitda-card">
        <CardHeader>
          <CardTitle>Role Details</CardTitle>
          <CardDescription>
            {id ? "Modify role details and permissions" : "Fill in the details"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Role name */}
          <div className="space-y-2">
            <Label htmlFor="name">Role Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          {/* Role description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          {/* Permissions */}
          <div className="space-y-2">
            <Label>Permissions</Label>
            {loadingPermissions ? (
              <p>Loading permissions...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-96 overflow-y-auto border p-2 rounded">
                {permissions.map((perm) => (
                  <label
                    key={perm.id}
                    className="flex items-center gap-2 border p-2 rounded hover:bg-slate-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(perm.id)}
                      onChange={() => togglePermission(perm.id)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm">
                      {formatPermissionName(perm.name)}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center text-white"
            >
              <Save className="h-4 w-4 mr-1" />
              {loading ? "Saving..." : "Update Role"}
            </Button>
            <Button
              className="flex items-center"
              variant="outline"
              onClick={() => {
                setFormData({ name: "", description: "", permissions: [] });
                if (onCancel) onCancel();
              }}
            >
              <X className="h-4 w-4 mr-1" />{" "}
              {onCancel ? "Cancel" : "Clear Form"}
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

export default EditRoleForm;
