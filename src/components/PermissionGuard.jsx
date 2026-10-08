import { usePermissions } from "@/hooks/usePermissions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

/**
 * PermissionGuard Component
 * Protects components/routes based on required permissions
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to render if permission granted
 * @param {string} props.permission - Single permission required
 * @param {Array<string>} props.permissions - Multiple permissions (requires ANY by default)
 * @param {boolean} props.requireAll - If true, requires ALL permissions instead of ANY
 * @param {React.ReactNode} props.fallback - Custom fallback component
 * @param {boolean} props.showMessage - Show access denied message (default: true)
 * @param {boolean} props.redirect - Redirect to dashboard if no permission
 */
export const PermissionGuard = ({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  showMessage = true,
  redirect = false,
}) => {
  const { can, canAny, canAll, loading } = usePermissions();
  const navigate = useNavigate();

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading permissions...</p>
        </div>
      </div>
    );
  }

  // Check permissions
  let hasAccess = false;

  if (permission) {
    // Single permission check
    hasAccess = can(permission);
  } else if (permissions && Array.isArray(permissions)) {
    // Multiple permissions check
    hasAccess = requireAll ? canAll(permissions) : canAny(permissions);
  } else {
    // No permission specified, allow access
    hasAccess = true;
  }

  // If user has access, render children
  if (hasAccess) {
    return <>{children}</>;
  }

  // Handle redirect
  if (redirect) {
    navigate("/dashboard");
    return null;
  }

  // If custom fallback provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Show access denied message
  if (showMessage) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <Alert className="max-w-md border-destructive/50 bg-destructive/10">
          <ShieldAlert className="h-5 w-5 text-destructive" />
          <AlertTitle className="text-destructive font-semibold">Access Denied</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="text-sm text-muted-foreground mb-4">
              You don't have permission to access this feature. Please contact your administrator if you believe this is an error.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="w-full"
            >
              Return to Dashboard
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Don't render anything
  return null;
};

/**
 * PermissionButton Component
 * Conditionally renders a button based on permission
 */
export const PermissionButton = ({
  permission,
  permissions,
  requireAll = false,
  children,
  fallback = null,
  ...buttonProps
}) => {
  const { can, canAny, canAll, loading } = usePermissions();

  if (loading) {
    return null;
  }

  let hasAccess = false;

  if (permission) {
    hasAccess = can(permission);
  } else if (permissions && Array.isArray(permissions)) {
    hasAccess = requireAll ? canAll(permissions) : canAny(permissions);
  }

  if (!hasAccess) {
    return fallback;
  }

  return <>{children}</>;
};

/**
 * usePermissionCheck Hook
 * Simple hook to check permissions inline
 */
export const usePermissionCheck = (permission, permissions, requireAll = false) => {
  const { can, canAny, canAll, loading } = usePermissions();

  if (loading) {
    return { hasPermission: false, loading: true };
  }

  let hasPermission = false;

  if (permission) {
    hasPermission = can(permission);
  } else if (permissions && Array.isArray(permissions)) {
    hasPermission = requireAll ? canAll(permissions) : canAny(permissions);
  }

  return { hasPermission, loading: false };
};
