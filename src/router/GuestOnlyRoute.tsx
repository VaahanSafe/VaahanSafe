import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function GuestOnlyRoute() {
  const { phone } = useAuthStore();

  if (phone) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
