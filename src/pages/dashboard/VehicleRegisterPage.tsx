import RegisterVehicle from '@/views/dashboard/RegisterVehicle';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

export default function VehicleRegisterPage() {
  const { phone } = useAuthStore();
  const navigate = useNavigate();

  const handleRegisterSuccess = () => {
    navigate('/dashboard/vehicles');
  };

  const handleCancel = () => {
    navigate('/dashboard/vehicles');
  };

  return (
    <RegisterVehicle 
      ownerPhone={phone || ''}
      onRegisterSuccess={handleRegisterSuccess}
      onCancel={handleCancel}
    />
  );
}
