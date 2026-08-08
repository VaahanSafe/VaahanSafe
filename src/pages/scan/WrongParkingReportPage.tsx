import ParkingFlow from '@/views/scan/ParkingFlow';
import { useParams, useNavigate } from 'react-router-dom';

export default function WrongParkingReportPage() {
  const { qrCodeId } = useParams<{ qrCodeId: string }>();
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate(`/s/${qrCodeId || 'vehicle-1'}`);
  };

  const handleComplete = () => {
    navigate(`/s/${qrCodeId || 'vehicle-1'}`);
  };

  return (
    <ParkingFlow
      vehicleId={qrCodeId || 'vehicle-1'}
      onCancel={handleCancel}
      onComplete={handleComplete}
    />
  );
}
