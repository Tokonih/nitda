

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
import { Save, X, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { createUser } from "@/Slices/userSlice";
import { getRoles } from "@/Slices/roleSlice";
import { fetchDepartments } from "@/Slices/departmentSlice";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";

const UserCreation = ({ onSuccess, onCancel }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const { list: roles } = useSelector((state) => state.roles);
  const { list: departments } = useSelector((state) => state.departments);
  const { loading, error } = useSelector((state) => state.users);

  const [userData, setUserData] = useState({
    firstname: "",
    middlename: "",
    lastname: "",
    gender: "",
    email: "",
    password: "",
    password_confirmation: "",
    role_id: "",
    department_id: "",
    staff_id: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});

  // 🚀 Fetch roles & departments on mount
  useEffect(() => {
    dispatch(getRoles({ per_page: 100 })); // get all roles
    dispatch(fetchDepartments()); // get all departments
  }, [dispatch]);

  const handleChange = (field, value) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!userData.firstname.trim()) newErrors.firstname = "First name is required";
    // Middle name is optional
    if (!userData.lastname.trim()) newErrors.lastname = "Last name is required";
    if (!userData.gender) newErrors.gender = "Gender is required";
    if (!userData.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      // Valid email check (lowercase and valid format)
      const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
      if (userData.email !== userData.email.toLowerCase()) {
        newErrors.email = "Email must be in lowercase";
      } else if (!emailRegex.test(userData.email)) {
        newErrors.email = "Please enter a valid email address (e.g., user@example.com)";
      }
    }
    if (!userData.password.trim()) newErrors.password = "Password is required";
    if (userData.password !== userData.password_confirmation) {
      newErrors.password_confirmation = "Passwords do not match";
    }
    if (!userData.role_id) newErrors.role_id = "Role is required";
    if (!userData.department_id)
      newErrors.department_id = "Department is required";
    if (!userData.staff_id.trim()) newErrors.staff_id = "Staff ID is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      try {
        const result = await dispatch(createUser(userData)).unwrap();
        // Clear form after successful creation
        setUserData({
          firstname: "",
          middlename: "",
          lastname: "",
          gender: "",
          email: "",
          password: "",
          password_confirmation: "",
          role_id: "",
          department_id: "",
          staff_id: "",
        });
        setErrors({});
        if (onSuccess) onSuccess();
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Failed to create user",
          description: getErrorMessage(err),
          className: "bg-destructive text-destructive-foreground"
        });
      }
    }
  };

  return (
    <div className="space-y-6 min-h-screen">
      <div className="flex items-center gap-4">
        {onCancel && (
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div>
          <h1 className="text-3xl font-bold">Create User</h1>
          <p className="text-muted-foreground mt-2">
            Enter details to create a new user
          </p>
        </div>
      </div>

      <Card className="nitda-card">
        <CardHeader>
          <CardTitle>User Details</CardTitle>
          <CardDescription>
            Fill in the information to create a system user
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
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

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email"
                value={userData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className={errors.email ? "border-red-500 p-1" : "p-1"}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Staff ID */}
            <div className="space-y-2">
              <Label htmlFor="staff_id">Staff ID *</Label>
              <Input
                id="staff_id"
                placeholder="Enter staff ID"
                value={userData.staff_id}
                onChange={(e) => handleChange("staff_id", e.target.value)}
                className={errors.staff_id ? "border-red-500 p-1" : "p-1"}
              />
              {errors.staff_id && (
                <p className="text-sm text-red-500">{errors.staff_id}</p>
              )}
            </div>


            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={userData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className={errors.password ? "border-red-500 p-1 pr-10" : "p-1 pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Password Confirmation */}
            <div className="space-y-2">
              <Label htmlFor="password_confirmation">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="password_confirmation"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={userData.password_confirmation}
                  onChange={(e) =>
                    handleChange("password_confirmation", e.target.value)
                  }
                  className={
                    errors.password_confirmation ? "border-red-500 p-1 pr-10" : "p-1 pr-10"
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password_confirmation && (
                <p className="text-sm text-red-500">
                  {errors.password_confirmation}
                </p>
              )}
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role_id">Role *</Label>
              <select
                id="role_id"
                value={userData.role_id}
                onChange={(e) => handleChange("role_id", e.target.value)}
                className={`w-full rounded-md border ${errors.role_id ? "border-red-500" : "border-gray-300"
                  } p-2`}
              >
                <option value="">-- Select a role --</option>
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

            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department_id">Department *</Label>
              <select
                id="department_id"
                value={userData.department_id}
                onChange={(e) => handleChange("department_id", e.target.value)}
                className={`w-full rounded-md border ${errors.department_id ? "border-red-500" : "border-gray-300"
                  } p-2`}
              >
                <option value="">-- Select a department --</option>
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
              disabled={loading || !userData.firstname || !userData.lastname || !userData.gender || !userData.email || !userData.password || !userData.role_id || !userData.department_id || !userData.staff_id}
              className="flex items-center text-white"
            >
              <Save className="h-4 w-4 mr-1" />
              {loading ? "Creating..." : "Create User"}
            </Button>
            <Button
              className="flex items-center"
              variant="outline"
              onClick={() =>
                setUserData({
                  firstname: "",
                  middlename: "",
                  lastname: "",
                  gender: "",
                  email: "",
                  password: "",
                  password_confirmation: "",
                  role_id: "",
                  department_id: "",
                  staff_id: "",
                })
              }
            >
              <X className="h-4 w-4 mr-1" /> Clear Form
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {(userData.firstname || userData.lastname) && (
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{userData.firstname} {userData.lastname}</p>
            <p className="text-sm text-muted-foreground">{userData.gender}</p>
            <p className="text-sm text-muted-foreground">{userData.email}</p>
            <p className="text-sm">Role: {userData.name}</p>
            <p className="text-sm">Department: {userData.name}</p>
            <p className="text-sm">Staff ID: {userData.staff_id}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserCreation;
