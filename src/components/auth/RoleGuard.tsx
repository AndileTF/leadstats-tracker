import { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

type RoleGuardProps = {
  children: ReactNode;
  requiredRoles?: ('admin' | 'team_lead' | 'agent')[];
  requiredPermissions?: (keyof ReturnType<typeof usePermissions>['permissions'])[];
  fallback?: ReactNode;
  showError?: boolean;
};

export const RoleGuard = ({
  children,
  requiredRoles,
  requiredPermissions,
  fallback,
  showError = false,
}: RoleGuardProps) => {
  const { hasAnyRole, permissions, loading } = usePermissions();

  if (loading) {
    return null;
  }

  // Check role-based access
  if (requiredRoles && !hasAnyRole(requiredRoles)) {
    if (showError) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access this content.
          </AlertDescription>
        </Alert>
      );
    }
    return fallback ? <>{fallback}</> : null;
  }

  // Check permission-based access
  if (requiredPermissions) {
    const hasPermission = requiredPermissions.every(
      (permission) => permissions[permission]
    );
    
    if (!hasPermission) {
      if (showError) {
        return (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You don't have permission to access this content.
            </AlertDescription>
          </Alert>
        );
      }
      return fallback ? <>{fallback}</> : null;
    }
  }

  return <>{children}</>;
};
