import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getDepartmentApi } from "@/Slices/Utils/Api/departments";
import { isAdmin as checkIsAdmin } from "@/lib/roleLabels";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building } from "lucide-react";

/**
 * DepartmentSelect
 *
 * Props:
 *   value        — current department id string (or "" for All)
 *   onChange     — (id: string) => void  — called with "" for All
 *   type         — optional API type filter, e.g. "nitda" | "stakeholder"
 *   placeholder  — optional trigger placeholder text
 *   allLabel     — optional label for the "All" option (default "All Departments")
 *   className    — optional extra classes on the trigger
 *   showIcon     — show Building icon in trigger (default true)
 *
 * Behaviour:
 *   - Admin users see an "All" option at the top.
 *   - Non-admin users only see their own department and cannot change it.
 *   - Defaults to "" (All) on mount for admins; non-admins default to their dept.
 */
const DepartmentSelect = ({
  value,
  onChange,
  type,
  placeholder = "All Departments",
  allLabel = "All Departments",
  className = "",
  showIcon = true,
}) => {
  const { user } = useSelector((state) => state.authSlice);
  const isAdmin = checkIsAdmin(user);
  const userDeptId = user?.department?.id?.toString() || "";

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Non-admins don't need to fetch the full list
    if (!isAdmin) return;

    setLoading(true);
    getDepartmentApi({ per_page: 200, type })
      .then((res) => {
        let list = res?.data || [];
        // When no type filter is specified, exclude stakeholder departments
        // (they appear in their own dedicated selectors)
        if (!type) {
          list = list.filter((d) => d.type !== "stakeholder");
        }
        setDepartments(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAdmin, type]);

  // Non-admin: locked to their own department
  if (!isAdmin) {
    const deptName = user?.department?.name || "My Department";
    return (
      <Select value={userDeptId} disabled>
        <SelectTrigger className={`bg-white border-gray-200 h-9 text-sm ${className}`}>
          {showIcon && <Building className="w-3.5 h-3.5 mr-2 text-gray-400 shrink-0" />}
          <SelectValue>{deptName}</SelectValue>
        </SelectTrigger>
      </Select>
    );
  }

  // Admin: full list + "All" option
  const currentValue = value === "" || value === undefined || value === null ? "__all__" : value;

  return (
    <Select
      value={currentValue}
      onValueChange={(val) => onChange?.(val === "__all__" ? "" : val)}
      disabled={loading}
    >
      <SelectTrigger className={`bg-white border-gray-200 h-9 text-sm ${className}`}>
        {showIcon && <Building className="w-3.5 h-3.5 mr-2 text-gray-400 shrink-0" />}
        <SelectValue placeholder={loading ? "Loading…" : placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        <SelectItem value="__all__">{allLabel}</SelectItem>
        {departments.map((dept) => (
          <SelectItem key={dept.id} value={dept.id.toString()}>
            {dept.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default DepartmentSelect;
