import DashboardHome from '@/views/dashboard/DashboardHome';
import { authStore, useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

export default function DashboardHomePage() {
  const { phone } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    authStore.logout();
    navigate('/login');
  };

  const handleRegisterNew = () => {
    navigate('/dashboard/vehicles/register');
  };

  return (
    <DashboardHome 
      ownerPhone={phone || ''} 
      onLogout={handleLogout}
      onRegisterNew={handleRegisterNew}
    />
  );
}
