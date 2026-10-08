import { getRolePermissionsApi } from "../Slices/Utils/Api/permissions";

/**
 * Permission Service
 * Handles fetching and caching user permissions based on role_id
 */

// In-memory cache for permissions
let permissionsCache = {
  roleId: null,
  permissions: [],
  timestamp: null,
};

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

/**
 * Fetch permissions for a given role_id
 * @param {number} roleId - The role ID to fetch permissions for
 * @param {boolean} forceRefresh - Force refresh the cache
 * @returns {Promise<Array>} Array of permission objects
 */
export const fetchRolePermissions = async (roleId, forceRefresh = false) => {
  if (!roleId) {
    console.warn("No role_id provided to fetchRolePermissions");
    return [];
  }

  // Check if cache is valid
  const now = Date.now();
  const isCacheValid =
    permissionsCache.roleId === roleId &&
    permissionsCache.permissions.length > 0 &&
    permissionsCache.timestamp &&
    now - permissionsCache.timestamp < CACHE_DURATION;

  if (isCacheValid && !forceRefresh) {
    return permissionsCache.permissions;
  }

  try {
    const response = await getRolePermissionsApi(roleId);

    if (response.status === "success" && response.data) {
      // Update cache
      permissionsCache = {
        roleId,
        permissions: response.data,
        timestamp: now,
      };

      return response.data;
    }

    return [];
  } catch (error) {
    console.error("Error fetching role permissions:", error);
    return [];
  }
};

/**
 * Check if user has a specific permission
 * @param {Array} permissions - Array of permission objects
 * @param {string} permissionName - Permission name to check (e.g., "kpis.create")
 * @returns {boolean} True if user has the permission
 */
export const hasPermission = (permissions, permissionName) => {
  if (!permissions || !Array.isArray(permissions)) {
    return false;
  }

  return permissions.some((perm) => perm.name === permissionName);
};

/**
 * Check if user has any of the specified permissions
 * @param {Array} permissions - Array of permission objects
 * @param {Array<string>} permissionNames - Array of permission names to check
 * @returns {boolean} True if user has at least one of the permissions
 */
export const hasAnyPermission = (permissions, permissionNames) => {
  if (!permissions || !Array.isArray(permissions) || !Array.isArray(permissionNames)) {
    return false;
  }

  return permissionNames.some((permName) => hasPermission(permissions, permName));
};

/**
 * Check if user has all of the specified permissions
 * @param {Array} permissions - Array of permission objects
 * @param {Array<string>} permissionNames - Array of permission names to check
 * @returns {boolean} True if user has all of the permissions
 */
export const hasAllPermissions = (permissions, permissionNames) => {
  if (!permissions || !Array.isArray(permissions) || !Array.isArray(permissionNames)) {
    return false;
  }

  return permissionNames.every((permName) => hasPermission(permissions, permName));
};

/**
 * Get all permissions for a specific resource
 * @param {Array} permissions - Array of permission objects
 * @param {string} resource - Resource name (e.g., "kpis", "users")
 * @returns {Array} Array of permission names for the resource
 */
export const getResourcePermissions = (permissions, resource) => {
  if (!permissions || !Array.isArray(permissions)) {
    return [];
  }

  return permissions
    .filter((perm) => perm.name.startsWith(`${resource}.`))
    .map((perm) => perm.name);
};

/**
 * Clear the permissions cache
 */
export const clearPermissionsCache = () => {
  permissionsCache = {
    roleId: null,
    permissions: [],
    timestamp: null,
  };
};

/**
 * Get cached permissions without making an API call
 * @returns {Array} Cached permissions or empty array
 */
export const getCachedPermissions = () => {
  return permissionsCache.permissions || [];
};
