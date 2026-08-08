import EmergencyFlow from '@/views/scan/EmergencyFlow';
import { useParams, useNavigate } from 'react-router-dom';

export default function EmergencyReportPage() {
  const { qrCodeId } = useParams<{ qrCodeId: string }>();
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate(`/s/${qrCodeId || 'vehicle-1'}`);
  };

  const handleComplete = () => {
    navigate(`/s/${qrCodeId || 'vehicle-1'}/status`);
  };

  return (
    <EmergencyFlow
      vehicleId={qrCodeId || 'vehicle-1'}
      onCancel={handleCancel}
      onComplete={handleComplete}
    />
  );
}
