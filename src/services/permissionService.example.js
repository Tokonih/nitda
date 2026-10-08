/**
 * PERMISSION SERVICE USAGE EXAMPLES
 * 
 * This file demonstrates how to use the permission service and hook
 * in your React components.
 */

// ============================================
// EXAMPLE 1: Using the usePermissions hook
// ============================================

import { usePermissions } from "../hooks/usePermissions";
import { Button } from "@/components/ui/button";

function MyComponent() {
  const { can, canAny, canAll, loading, permissions } = usePermissions();

  if (loading) {
    return <div>Loading permissions...</div>;
  }

  return (
    <div>
      {/* Check single permission */}
      {can("kpis.create") && (
        <Button>Create KPI</Button>
      )}

      {/* Check if user has any of multiple permissions */}
      {canAny(["kpis.update", "kpis.delete"]) && (
        <Button>Edit or Delete KPI</Button>
      )}

      {/* Check if user has all permissions */}
      {canAll(["kpis.view", "kpis.create", "kpis.update"]) && (
        <Button>Full KPI Management</Button>
      )}

      {/* Conditional rendering based on permission */}
      {can("users.view") ? (
        <div>User Management Section</div>
      ) : (
        <div>Access Denied</div>
      )}
    </div>
  );
}

// ============================================
// EXAMPLE 2: Using permission service directly
// ============================================

import { 
  fetchRolePermissions, 
  hasPermission,
  hasAnyPermission,
  hasAllPermissions 
} from "../services/permissionService";

async function checkUserPermissions(roleId) {
  // Fetch permissions for a role
  const permissions = await fetchRolePermissions(roleId);

  // Check single permission
  const canCreateKPI = hasPermission(permissions, "kpis.create");
  console.log("Can create KPI:", canCreateKPI);

  // Check multiple permissions (any)
  const canManageKPI = hasAnyPermission(permissions, [
    "kpis.create",
    "kpis.update",
    "kpis.delete"
  ]);
  console.log("Can manage KPI:", canManageKPI);

  // Check multiple permissions (all)
  const hasFullAccess = hasAllPermissions(permissions, [
    "kpis.view",
    "kpis.create",
    "kpis.update",
    "kpis.delete"
  ]);
  console.log("Has full KPI access:", hasFullAccess);

  return permissions;
}

// ============================================
// EXAMPLE 3: Protecting routes/components
// ============================================

import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, requiredPermission }) {
  const { can, loading } = usePermissions();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!can(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

// Usage in routes:
// <ProtectedRoute requiredPermission="kpis.create">
//   <KpiCreationPage />
// </ProtectedRoute>

// ============================================
// EXAMPLE 4: Conditional button rendering
// ============================================

function KpiActionButtons({ kpiId }) {
  const { can } = usePermissions();

  return (
    <div className="flex gap-2">
      {can("kpis.view") && (
        <Button variant="outline">View</Button>
      )}
      
      {can("kpis.update") && (
        <Button variant="default">Edit</Button>
      )}
      
      {can("kpis.delete") && (
        <Button variant="destructive">Delete</Button>
      )}
      
      {can("kpis.approve") && (
        <Button variant="success">Approve</Button>
      )}
    </div>
  );
}

// ============================================
// EXAMPLE 5: Using with Redux selector
// ============================================

import { useSelector } from "react-redux";

function ComponentWithRedux() {
  const user = useSelector((state) => state.auth.user);
  const { can, permissions } = usePermissions();

  // You can combine user data with permissions
  const isAdminWithPermission = user?.role === "admin" && can("users.delete");

  return (
    <div>
      {isAdminWithPermission && (
        <Button variant="destructive">Delete User</Button>
      )}
    </div>
  );
}

// ============================================
// EXAMPLE 6: Checking resource permissions
// ============================================

function ResourcePermissionCheck() {
  const { getPermissionsFor } = usePermissions();

  // Get all KPI-related permissions
  const kpiPermissions = getPermissionsFor("kpis");
  console.log("KPI Permissions:", kpiPermissions);
  // Output: ["kpis.view", "kpis.create", "kpis.update", ...]

  // Get all user-related permissions
  const userPermissions = getPermissionsFor("users");
  console.log("User Permissions:", userPermissions);

  return (
    <div>
      <h3>Your KPI Permissions:</h3>
      <ul>
        {kpiPermissions.map((perm) => (
          <li key={perm}>{perm}</li>
        ))}
      </ul>
    </div>
  );
}

// ============================================
// COMMON PERMISSION NAMES (from your API)
// ============================================

/*
Authentication:
- auth.login
- auth.logout
- auth.register

Users:
- users.view
- users.create
- users.update
- users.delete

Roles:
- roles.view
- roles.create
- roles.update
- roles.delete
- roles.assign-permissions

KPIs:
- kpis.view
- kpis.create
- kpis.update
- kpis.delete
- kpis.approve
- kpis.disapprove

KPI Values:
- kpi-values.view
- kpi-values.create
- kpi-values.update
- kpi-values.delete
- kpi-values.verify

Departments:
- departments.view
- departments.create
- departments.update
- departments.delete

Pillars:
- pillars.view
- pillars.create
- pillars.update
- pillars.delete

SRAP Initiatives:
- srap-initiatives.view
- srap-initiatives.create
- srap-initiatives.update
- srap-initiatives.delete

SRAP Objectives:
- srap-objectives.create
- srap-objectives.update
- srap-objectives.delete
- srap-objectives.approve
- srap-objectives.disapprove
- srap-objectives.lock
- srap-objectives.unlock

Stakeholder Activities:
- stakeholder-activity-values.verify

Dashboard Access Requests:
- dashboard-access-requests.view
- dashboard-access-requests.approve
- dashboard-access-requests.reject

Audit Logs:
- audit-logs.view

Permissions:
- permissions.view

Data Inputs:
- data-inputs.view
- data-inputs.create
- data-inputs.update
- data-inputs.delete
- data-inputs.bulk-update
*/
