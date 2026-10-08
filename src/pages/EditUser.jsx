import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getSingleUser, updateUser } from "@/Slices/userSlice";
import { getRoles } from "@/Slices/roleSlice";
import { fetchDepartments } from "@/Slices/departmentSlice";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";
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
import { ArrowLeft, Save } from "lucide-react";

const UserEdit = ({ userId, onSuccess, onCancel }) => {
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();

  const id = userId || params.id;

  const { currentUser, loading: userLoading } = useSelector(
    (state) => state.users
  );
  const { list: roles } = useSelector((state) => state.roles);
  const { list: departments } = useSelector((state) => state.departments);

  const [userData, setUserData] = useState({
    firstname: "",
    middlename: "",
    lastname: "",
    email: "",
    gender: "",
    role_id: "",
    department_id: "",
    password: "", // optional
    password_confirmation: "",
    staff_id: "",
  });

  const [errors, setErrors] = useState({});

  // Fetch user + roles + departments
  useEffect(() => {
    if (id) {
      dispatch(getSingleUser(id));
    }
    dispatch(getRoles({ per_page: 100 }));
    dispatch(fetchDepartments());
  }, [dispatch, id]);


  // Populate form when currentUser loads
  useEffect(() => {
    if (currentUser) {
      let rId = currentUser.role_id || currentUser.role?.id || "";
      // Fallback: lookup by name if role is a string
      if (!rId && typeof currentUser.role === "string" && roles?.length > 0) {
        const match = roles.find((r) => r.name === currentUser.role);
        if (match) rId = match.id;
      }

      let dId =
        currentUser.department_id || currentUser.department?.id || "";
      // Fallback: lookup by name if department is a string
      if (
        !dId &&
        typeof currentUser.department === "string" &&
        departments?.length > 0
      ) {
        const match = departments.find((d) => d.name === currentUser.department);
        if (match) dId = match.id;
      }

      setUserData({
        firstname: currentUser.firstname || "",
        middlename: currentUser.middlename || "",
        lastname: currentUser.lastname || "",
        email: currentUser.email || "",
        gender: currentUser.gender || "",
        role_id: rId,
        department_id: dId,
        staff_id: currentUser.staff_id || "",
        password: "",
        password_confirmation: "",
      });
    }
  }, [currentUser, roles, departments]);

  const handleChange = (field, value) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!userData.firstname?.trim()) newErrors.firstname = "First name is required";
    if (!userData.lastname?.trim()) newErrors.lastname = "Last name is required";
    if (!userData.gender) newErrors.gender = "Gender is required";
    if (!userData.email?.trim()) newErrors.email = "Email is required";
    if (!userData.role_id) newErrors.role_id = "Role is required";
    if (!userData.department_id)
      newErrors.department_id = "Department is required";
    if (!userData.staff_id?.trim())
      newErrors.staff_id = "Staff ID is required";

    // Only validate password if user typed something
    if (userData.password) {
      if (userData.password.length < 6)
        newErrors.password = "Password must be at least 6 characters";
      if (userData.password !== userData.password_confirmation)
        newErrors.password_confirmation = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    // Only send password if it's filled
    const payload = {
      firstname: userData.firstname,
      middlename: userData.middlename,
      lastname: userData.lastname,
      gender: userData.gender,
      email: userData.email,
      role_id: userData.role_id,
      department_id: userData.department_id,
      staff_id: userData.staff_id,
    };

    if (userData.password) {
      payload.password = userData.password;
      payload.password_confirmation = userData.password_confirmation;
    }

    try {
      await dispatch(updateUser({ id, userData: payload })).unwrap();
      toast({
        title: "Success",
        description: "User updated successfully!",
      });
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/dashboard/users");
      }
    } catch (err) {
      toast({
        title: "Update failed",
        description: getErrorMessage(err),
        variant: "destructive",
      });
    }
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {onCancel ? (
          <Button variant="outline" size="icon" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div>
          <h1 className="text-3xl font-bold">Edit User</h1>
          <p className="text-muted-foreground">Update user information</p>
        </div>
      </div>

      <Card className="nitda-card">
        <CardHeader>
          <CardTitle>User Details</CardTitle>
          <CardDescription>Make changes to the user profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstname">First Name *</Label>
              <Input
                id="firstname"
                placeholder="Enter first name"
                value={userData.firstname}
                onChange={(e) => handleChange("firstname", e.target.value)}
                className={errors.firstname ? "border-red-500 p-1" : "p-1"}
              />
              {errors.firstname && (
                <p className="text-sm text-red-500">{errors.firstname}</p>
              )}
            </div>

            {/* Middle Name (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="middlename">Middle Name</Label>
              <Input
                id="middlename"
                placeholder="Enter middle name"
                value={userData.middlename}
                onChange={(e) => handleChange("middlename", e.target.value)}
                className="p-1"
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastname">Last Name *</Label>
              <Input
                id="lastname"
                placeholder="Enter last name"
                value={userData.lastname}
                onChange={(e) => handleChange("lastname", e.target.value)}
                className={errors.lastname ? "border-red-500 p-1" : "p-1"}
              />
              {errors.lastname && (
                <p className="text-sm text-red-500">{errors.lastname}</p>
              )}
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <select
                id="gender"
                value={userData.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.gender ? "border-red-500" : ""
                  }`}
              >
                <option value="">-- Select Gender --</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {errors.gender && (
                <p className="text-sm text-red-500">{errors.gender}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={userData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className={errors.email ? "border-red-500 p-1" : "p-1"}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Staff ID *</Label>
              <Input
                value={userData.staff_id}
                onChange={(e) => handleChange("staff_id", e.target.value)}
                className={errors.staff_id ? "border-red-500" : ""}
                placeholder="Enter staff ID"
              />
              {errors.staff_id && (
                <p className="text-sm text-red-500">{errors.staff_id}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>New Password (leave blank to keep current)</Label>
              <Input
                type="password"
                value={userData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={userData.password_confirmation}
                onChange={(e) =>
                  handleChange("password_confirmation", e.target.value)
                }
                placeholder="••••••••"
                className={errors.password_confirmation ? "border-red-500" : ""}
              />
              {errors.password_confirmation && (
                <p className="text-sm text-red-500">
                  {errors.password_confirmation}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Role *</Label>
              <select
                value={userData.role_id}
                onChange={(e) => handleChange("role_id", e.target.value)}
                className={`w-full rounded-md border p-2 ${errors.role_id ? "border-red-500" : ""
                  }`}
              >
                <option value="">-- Select Role --</option>
                {roles?.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
              {errors.role_id && (
                <p className="text-sm text-red-500">{errors.role_id}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Department *</Label>
              <select
                value={userData.department_id}
                onChange={(e) => handleChange("department_id", e.target.value)}
                className={`w-full rounded-md border p-2 ${errors.department_id ? "border-red-500" : ""
                  }`}
              >
                <option value="">-- Select Department --</option>
                {departments?.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {errors.department_id && (
                <p className="text-sm text-red-500">{errors.department_id}</p>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              disabled={
                userLoading ||
                !userData.firstname ||
                !userData.lastname ||
                !userData.gender ||
                !userData.email ||
                !userData.role_id ||
                !userData.department_id ||
                !userData.staff_id
              }
            >
              <Save className="h-4 w-4 mr-2" />
              {userLoading ? "Updating..." : "Update User"}
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserEdit;
