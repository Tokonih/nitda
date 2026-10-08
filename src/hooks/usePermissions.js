import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  fetchRolePermissions,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getResourcePermissions,
} from "../services/permissionService";

/**
 * Custom hook for managing and checking user permissions
 * @returns {Object} Permission utilities and state
 */
export const usePermissions = () => {
  const user = useSelector((state) => state.auth.user);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPermissions = async () => {
      if (!user || !user.role_id) {
        setPermissions([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const perms = await fetchRolePermissions(user.role_id);
        setPermissions(perms);
        setError(null);
      } catch (err) {
        console.error("Error loading permissions:", err);
        setError(err.message || "Failed to load permissions");
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    loadPermissions();
  }, [user?.role_id]);

  /**
   * Check if user has a specific permission
   * @param {string} permissionName - Permission name to check
   * @returns {boolean}
   */
  const can = (permissionName) => {
    return hasPermission(permissions, permissionName);
  };

  /**
   * Check if user has any of the specified permissions
   * @param {Array<string>} permissionNames - Array of permission names
   * @returns {boolean}
   */
  const canAny = (permissionNames) => {
    return hasAnyPermission(permissions, permissionNames);
  };

  /**
   * Check if user has all of the specified permissions
   * @param {Array<string>} permissionNames - Array of permission names
   * @returns {boolean}
   */
  const canAll = (permissionNames) => {
    return hasAllPermissions(permissions, permissionNames);
  };

  /**
   * Get all permissions for a specific resource
   * @param {string} resource - Resource name (e.g., "kpis", "users")
   * @returns {Array<string>}
   */
  const getPermissionsFor = (resource) => {
    return getResourcePermissions(permissions, resource);
  };

  return {
    permissions,
    loading,
    error,
    can,
    canAny,
    canAll,
    getPermissionsFor,
  };
};
