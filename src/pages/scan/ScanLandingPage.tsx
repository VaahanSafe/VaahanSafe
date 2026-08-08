import ScanLanding from '@/views/scan/ScanLanding';
import { useParams } from 'react-router-dom';

export default function ScanLandingPage() {
  const { qrCodeId } = useParams<{ qrCodeId: string }>();
  return <ScanLanding vehicleId={qrCodeId || 'vehicle-1'} />;
}
