import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore as useFeatureAuthStore } from '@/features/auth/auth.store';
import { useAuthStore as useMemoryAuthStore } from '@/store/authStore';
import ErrorBoundary from '@/components/shared/ErrorBoundary';

/**
 * Dedicated Admin & Operator Protected Route Guard
 * Enforces authentication AND operator/admin role authorization for all /admin routes.
 * Redirects unauthenticated users to /login and unauthorized non-admin users to /403.
 * Encloses the admin dashboard inside a dedicated Error Boundary.
 */
export default function AdminRoute() {
  const featureAuth = useFeatureAuthStore();
  const memoryAuth = useMemoryAuthStore();
  const location = useLocation();

  const isAuthed = Boolean(
    (featureAuth.isAuthenticated && (featureAuth.accessToken || featureAuth.phone)) ||
    (memoryAuth.isAuthenticated && (memoryAuth.accessToken || memoryAuth.owner))
  );

  // 1. Unauthenticated -> Redirect to Login
  if (!isAuthed) {
    const returnTo = encodeURIComponent(location.pathname || '/admin');
    return <Navigate to={`/login?returnTo=${returnTo}`} replace />;
  }

  // 2. Check Role Authorization (must be 'admin' or 'operator')
  const userRole = memoryAuth.owner?.role || featureAuth.owner?.role || featureAuth.role;
  const isAdminOrOperator = userRole === 'admin' || userRole === 'operator';

  if (!isAdminOrOperator) {
    return <Navigate to="/403" replace />;
  }

  return (
    <ErrorBoundary>
      <Outlet />
    </ErrorBoundary>
  );
}
