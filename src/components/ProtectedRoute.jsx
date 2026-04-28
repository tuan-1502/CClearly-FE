import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, ROLES } from '@/contexts/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If roles are specified, check permission
  if (allowedRoles && allowedRoles.length > 0) {
    if (!hasRole(allowedRoles)) {
      // Redirect to appropriate dashboard based on role
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

// Helper components for specific role routes
export const CustomerRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>{children}</ProtectedRoute>
);

export const StaffRoute = ({ children }) => (
  <ProtectedRoute
    allowedRoles={[ROLES.SALES, ROLES.OPERATIONS, ROLES.MANAGER, ROLES.ADMIN]}
  >
    {children}
  </ProtectedRoute>
);

export const AdminRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>{children}</ProtectedRoute>
);

export const ManagerRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={[ROLES.MANAGER]}>{children}</ProtectedRoute>
);

export const SalesRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={[ROLES.SALES]}>{children}</ProtectedRoute>
);

export const OperationsRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={[ROLES.OPERATIONS]}>{children}</ProtectedRoute>
);

