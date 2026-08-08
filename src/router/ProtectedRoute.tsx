import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore as useFeatureAuthStore } from '@/features/auth/auth.store';
import { useAuthStore as useMemoryAuthStore } from '@/store/authStore';
import ErrorBoundary from '@/components/shared/ErrorBoundary';

const ALLOWED_USER_PATHS = [
  '/dashboard',
  '/dashboard/vehicles',
  '/dashboard/contacts',
  '/dashboard/medical',
  '/dashboard/billing',
  '/dashboard/profile',
  '/dashboard/security',
  '/dashboard/notifications'
];

/**
 * User / Owner Protected Route Guard
 * Enforces mandatory authentication for all vehicle owner dashboard pages.
 * Encloses the dashboard tree within a dedicated Error Boundary.
 */
export default function ProtectedRoute() {
  const featureAuth = useFeatureAuthStore();
  const memoryAuth = useMemoryAuthStore();
  const location = useLocation();

  const isAuthed = Boolean(
    (featureAuth.isAuthenticated && (featureAuth.accessToken || featureAuth.phone)) ||
    (memoryAuth.isAuthenticated && (memoryAuth.accessToken || memoryAuth.owner))
  );

  if (!isAuthed) {
    const targetPath = location.pathname;
    const isValidPath = ALLOWED_USER_PATHS.some((path) => targetPath.startsWith(path));
    const returnTo = isValidPath ? encodeURIComponent(targetPath) : encodeURIComponent('/dashboard');
    return <Navigate to={`/login?returnTo=${returnTo}`} replace />;
  }

  return (
    <ErrorBoundary>
      <Outlet />
    </ErrorBoundary>
  );
}
