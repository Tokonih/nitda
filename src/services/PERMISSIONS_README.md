# Permission Service Documentation

A comprehensive permission management system for role-based access control (RBAC) in the NITDA Dashboard application.

## Overview

The permission service provides:
- Automatic permission fetching based on user's role_id
- In-memory caching with 5-minute expiration
- Easy-to-use React hook for components
- Multiple permission checking utilities
- TypeScript-friendly API

## Files

- `src/services/permissionService.js` - Core permission service with caching
- `src/hooks/usePermissions.js` - React hook for components
- `src/Slices/Utils/Api/permissions.js` - API functions
- `src/services/permissionService.example.js` - Usage examples

## Quick Start

### 1. Using the Hook in Components

```jsx
import { usePermissions } from "@/hooks/usePermissions";

function MyComponent() {
  const { can, loading } = usePermissions();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {can("kpis.create") && (
        <Button>Create KPI</Button>
      )}
    </div>
  );
}
```

### 2. Check Multiple Permissions

```jsx
const { canAny, canAll } = usePermissions();

// User needs ANY of these permissions
{canAny(["kpis.update", "kpis.delete"]) && (
  <Button>Edit or Delete</Button>
)}

// User needs ALL of these permissions
{canAll(["kpis.view", "kpis.create"]) && (
  <Button>Full Access</Button>
)}
```

### 3. Protect Routes

```jsx
import { Navigate } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";

function ProtectedRoute({ children, permission }) {
  const { can, loading } = usePermissions();

  if (loading) return <div>Loading...</div>;
  if (!can(permission)) return <Navigate to="/unauthorized" />;

  return children;
}

// Usage
<ProtectedRoute permission="kpis.create">
  <KpiCreationPage />
</ProtectedRoute>
```

## API Reference

### Hook: `usePermissions()`

Returns an object with:

- `permissions` (Array): Full list of permission objects
- `loading` (boolean): Loading state
- `error` (string|null): Error message if any
- `can(permissionName)`: Check single permission
- `canAny(permissionNames)`: Check if user has any of the permissions
- `canAll(permissionNames)`: Check if user has all permissions
- `getPermissionsFor(resource)`: Get all permissions for a resource

### Service Functions

#### `fetchRolePermissions(roleId, forceRefresh)`
Fetches permissions for a role. Uses cache unless `forceRefresh` is true.

```js
import { fetchRolePermissions } from "@/services/permissionService";

const permissions = await fetchRolePermissions(1);
```

#### `hasPermission(permissions, permissionName)`
Check if permission array includes a specific permission.

```js
import { hasPermission } from "@/services/permissionService";

const canCreate = hasPermission(permissions, "kpis.create");
```

#### `hasAnyPermission(permissions, permissionNames)`
Check if user has any of the specified permissions.

```js
const canManage = hasAnyPermission(permissions, [
  "kpis.update",
  "kpis.delete"
]);
```

#### `hasAllPermissions(permissions, permissionNames)`
Check if user has all of the specified permissions.

```js
const hasFullAccess = hasAllPermissions(permissions, [
  "kpis.view",
  "kpis.create",
  "kpis.update"
]);
```

#### `getResourcePermissions(permissions, resource)`
Get all permissions for a specific resource.

```js
const kpiPerms = getResourcePermissions(permissions, "kpis");
// Returns: ["kpis.view", "kpis.create", "kpis.update", ...]
```

#### `clearPermissionsCache()`
Clear the in-memory permission cache.

```js
import { clearPermissionsCache } from "@/services/permissionService";

clearPermissionsCache();
```

## Permission Naming Convention

Permissions follow the format: `resource.action`

Examples:
- `kpis.view` - View KPIs
- `kpis.create` - Create KPIs
- `users.delete` - Delete users
- `roles.assign-permissions` - Assign permissions to roles

## Common Use Cases

### 1. Conditional Button Rendering

```jsx
function ActionButtons() {
  const { can } = usePermissions();

  return (
    <div className="flex gap-2">
      {can("kpis.update") && <Button>Edit</Button>}
      {can("kpis.delete") && <Button variant="destructive">Delete</Button>}
      {can("kpis.approve") && <Button>Approve</Button>}
    </div>
  );
}
```

### 2. Sidebar Menu Items

```jsx
function Sidebar() {
  const { can } = usePermissions();

  return (
    <nav>
      {can("users.view") && <MenuItem to="/users">Users</MenuItem>}
      {can("roles.view") && <MenuItem to="/roles">Roles</MenuItem>}
      {can("kpis.view") && <MenuItem to="/kpis">KPIs</MenuItem>}
    </nav>
  );
}
```

### 3. Form Field Visibility

```jsx
function KpiForm() {
  const { can } = usePermissions();

  return (
    <form>
      <Input name="name" />
      <Input name="description" />
      
      {can("kpis.approve") && (
        <Select name="status">
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
        </Select>
      )}
    </form>
  );
}
```

### 4. API Call Protection

```jsx
async function handleDelete(id) {
  const { can } = usePermissions();

  if (!can("kpis.delete")) {
    toast.error("You don't have permission to delete KPIs");
    return;
  }

  await deleteKpiApi(id);
}
```

## Caching

The service uses in-memory caching with:
- **Duration**: 5 minutes
- **Key**: role_id
- **Auto-refresh**: On role_id change
- **Manual clear**: Use `clearPermissionsCache()`

## Integration with Existing Code

### Update Login Flow (Optional)

You can preload permissions on login:

```js
import { fetchRolePermissions } from "@/services/permissionService";

// In your login success handler
const handleLoginSuccess = async (userData) => {
  // Existing login logic...
  
  // Preload permissions
  if (userData.role_id) {
    await fetchRolePermissions(userData.role_id);
  }
};
```

### Clear Cache on Logout

```js
import { clearPermissionsCache } from "@/services/permissionService";

const handleLogout = () => {
  dispatch(logout());
  clearPermissionsCache();
  navigate("/login");
};
```

## Available Permissions

Based on your API response, here are all available permissions:

### Authentication
- `auth.login`
- `auth.logout`
- `auth.register`

### Users
- `users.view`
- `users.create`
- `users.update`
- `users.delete`

### Roles
- `roles.view`
- `roles.create`
- `roles.update`
- `roles.delete`
- `roles.assign-permissions`

### KPIs
- `kpis.view`
- `kpis.create`
- `kpis.update`
- `kpis.delete`
- `kpis.approve`
- `kpis.disapprove`

### KPI Values
- `kpi-values.view`
- `kpi-values.create`
- `kpi-values.update`
- `kpi-values.delete`
- `kpi-values.verify`

### Departments
- `departments.view`
- `departments.create`
- `departments.update`
- `departments.delete`

### Pillars
- `pillars.view`
- `pillars.create`
- `pillars.update`
- `pillars.delete`

### SRAP Initiatives
- `srap-initiatives.view`
- `srap-initiatives.create`
- `srap-initiatives.update`
- `srap-initiatives.delete`

### SRAP Objectives
- `srap-objectives.create`
- `srap-objectives.update`
- `srap-objectives.delete`
- `srap-objectives.approve`
- `srap-objectives.disapprove`
- `srap-objectives.lock`
- `srap-objectives.unlock`

### SRAP Records
- `srap-records.view`
- `srap-records.create`
- `srap-records.update`
- `srap-records.delete`

### Stakeholder Activities
- `stakeholder-activity-values.verify`

### Dashboard Access Requests
- `dashboard-access-requests.view`
- `dashboard-access-requests.approve`
- `dashboard-access-requests.reject`

### Infrastructure Projects
- `infra-projects.view`
- `infra-projects.create`
- `infra-projects.update`
- `infra-projects.delete`

### Security Initiatives
- `security-initiatives.view`
- `security-initiatives.create`
- `security-initiatives.update`
- `security-initiatives.delete`

### Data Inputs
- `data-inputs.view`
- `data-inputs.create`
- `data-inputs.update`
- `data-inputs.delete`
- `data-inputs.bulk-update`

### Audit Logs
- `audit-logs.view`

### Permissions
- `permissions.view`

## Troubleshooting

### Permissions not loading
- Check if user has `role_id` in Redux state
- Verify API endpoint is accessible
- Check browser console for errors

### Cache not updating
- Use `forceRefresh` parameter: `fetchRolePermissions(roleId, true)`
- Or clear cache manually: `clearPermissionsCache()`

### Permission check always returns false
- Verify permission name matches exactly (case-sensitive)
- Check if permissions array is populated
- Ensure user is logged in and has role_id

## Best Practices

1. **Use the hook in components**: Prefer `usePermissions()` over direct service calls
2. **Check permissions early**: Validate permissions before rendering expensive components
3. **Combine with role checks**: Use both role and permission checks for sensitive operations
4. **Handle loading state**: Always show loading indicator while permissions load
5. **Cache wisely**: Don't force refresh unless necessary
6. **Clear on logout**: Always clear cache when user logs out

## Support

For issues or questions, refer to:
- `src/services/permissionService.example.js` for more examples
- API documentation for endpoint details
- Redux auth slice for user data structure
