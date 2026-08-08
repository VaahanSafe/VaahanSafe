import type { RouteObject } from 'react-router-dom';
import ScanLayout from '@/layouts/ScanLayout';
import React, { Suspense } from 'react';
import SkeletonBlock from '@/components/shared/SkeletonBlock';

const ScanLandingPage = React.lazy(() => import('@/pages/scan/ScanLandingPage'));
const EmergencyReportPage = React.lazy(() => import('@/pages/scan/EmergencyReportPage'));
const WrongParkingReportPage = React.lazy(() => import('@/pages/scan/WrongParkingReportPage'));
const MedicalInfoGatePage = React.lazy(() => import('@/pages/scan/MedicalInfoGatePage'));
const MedicalInfoViewPage = React.lazy(() => import('@/pages/scan/MedicalInfoViewPage'));
const ScanStatusPage = React.lazy(() => import('@/pages/scan/ScanStatusPage'));
const ScanNotFoundPage = React.lazy(() => import('@/pages/scan/ScanNotFoundPage'));

const lazyRoute = (Component: React.ComponentType) => (
  <Suspense fallback={<SkeletonBlock />}>
    <Component />
  </Suspense>
);

export const scanRoutes: RouteObject = {
  path: '/s/:qrCodeId',
  element: <ScanLayout />,
  children: [
    { path: '', element: lazyRoute(ScanLandingPage) },
    { path: 'emergency', element: lazyRoute(EmergencyReportPage) },
    { path: 'wrong-parking', element: lazyRoute(WrongParkingReportPage) },
    { path: 'medical', element: lazyRoute(MedicalInfoGatePage) },
    { path: 'medical/view', element: lazyRoute(MedicalInfoViewPage) },
    { path: 'status', element: lazyRoute(ScanStatusPage) },
    { path: 'not-found', element: lazyRoute(ScanNotFoundPage) }
  ]
};
