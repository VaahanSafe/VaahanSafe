import type { RouteObject } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import ProtectedRoute from '@/router/ProtectedRoute';
import React, { Suspense } from 'react';
import SkeletonBlock from '@/components/shared/SkeletonBlock';

const DashboardHomePage = React.lazy(() => import('@/pages/dashboard/DashboardHomePage'));
const VehiclesListPage = React.lazy(() => import('@/pages/dashboard/VehiclesListPage'));
const VehicleRegisterPage = React.lazy(() => import('@/pages/dashboard/VehicleRegisterPage'));
const VehicleDetailPage = React.lazy(() => import('@/pages/dashboard/VehicleDetailPage'));
const VehicleOverviewPage = React.lazy(() => import('@/pages/dashboard/VehicleOverviewPage'));
const VehicleContactsPage = React.lazy(() => import('@/pages/dashboard/VehicleContactsPage'));
const VehicleMedicalPage = React.lazy(() => import('@/pages/dashboard/VehicleMedicalPage'));
const VehicleScanHistoryPage = React.lazy(() => import('@/pages/dashboard/VehicleScanHistoryPage'));
const VehicleAlertHistoryPage = React.lazy(() => import('@/pages/dashboard/VehicleAlertHistoryPage'));
const BillingPage = React.lazy(() => import('@/pages/dashboard/BillingPage'));
const CheckoutPage = React.lazy(() => import('@/pages/dashboard/CheckoutPage'));
const ProfileSettingsPage = React.lazy(() => import('@/pages/dashboard/ProfileSettingsPage'));
const SecuritySettingsPage = React.lazy(() => import('@/pages/dashboard/SecuritySettingsPage'));
const NotificationsPage = React.lazy(() => import('@/pages/dashboard/NotificationsPage'));

const lazyRoute = (Component: React.ComponentType) => (
  <Suspense fallback={<SkeletonBlock />}>
    <Component />
  </Suspense>
);

export const dashboardRoutes: RouteObject = {
  path: '/dashboard',
  element: <ProtectedRoute />,
  children: [
    {
      element: <DashboardLayout />,
      children: [
        { path: '', element: lazyRoute(DashboardHomePage) },
        { path: 'vehicles', element: lazyRoute(VehiclesListPage) },
        { path: 'vehicles/register', element: lazyRoute(VehicleRegisterPage) },
        { 
          path: 'vehicles/:vehicleId', 
          element: lazyRoute(VehicleDetailPage),
          children: [
            { path: '', element: lazyRoute(VehicleOverviewPage) },
            { path: 'contacts', element: lazyRoute(VehicleContactsPage) },
            { path: 'medical', element: lazyRoute(VehicleMedicalPage) },
            { path: 'scans', element: lazyRoute(VehicleScanHistoryPage) },
            { path: 'alerts', element: lazyRoute(VehicleAlertHistoryPage) }
          ]
        },
        { path: 'billing', element: lazyRoute(BillingPage) },
        { path: 'checkout', element: lazyRoute(CheckoutPage) },
        { path: 'profile', element: lazyRoute(ProfileSettingsPage) },
        { path: 'security', element: lazyRoute(SecuritySettingsPage) },
        { path: 'notifications', element: lazyRoute(NotificationsPage) }
      ]
    }
  ]
};
