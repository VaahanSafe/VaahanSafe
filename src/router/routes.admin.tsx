import type { RouteObject } from 'react-router-dom';
import AdminLayout from '@/layouts/AdminLayout';
import AdminRoute from '@/router/AdminRoute';
import React, { Suspense } from 'react';
import SkeletonBlock from '@/components/shared/SkeletonBlock';

const AdminDashboardPage = React.lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminScansPage = React.lazy(() => import('@/pages/admin/AdminScansPage'));
const AdminScanDetailPage = React.lazy(() => import('@/pages/admin/AdminScanDetailPage'));
const AdminFlaggedScansPage = React.lazy(() => import('@/pages/admin/AdminFlaggedScansPage'));
const AdminOwnersPage = React.lazy(() => import('@/pages/admin/AdminOwnersPage'));
const AdminOwnerDetailPage = React.lazy(() => import('@/pages/admin/AdminOwnerDetailPage'));
const AdminVehiclesPage = React.lazy(() => import('@/pages/admin/AdminVehiclesPage'));
const AdminAlertFailuresPage = React.lazy(() => import('@/pages/admin/AdminAlertFailuresPage'));
const AdminDeadLetterPage = React.lazy(() => import('@/pages/admin/AdminDeadLetterPage'));
const AdminAbuseReportsPage = React.lazy(() => import('@/pages/admin/AdminAbuseReportsPage'));
const AdminAuditLogPage = React.lazy(() => import('@/pages/admin/AdminAuditLogPage'));

const lazyRoute = (Component: React.ComponentType) => (
  <Suspense fallback={<SkeletonBlock />}>
    <Component />
  </Suspense>
);

export const adminRoutes: RouteObject = {
  path: '/admin',
  element: <AdminRoute />,
  children: [
    {
      element: <AdminLayout />,
      children: [
        { path: '', element: lazyRoute(AdminDashboardPage) },
        { path: 'scans', element: lazyRoute(AdminScansPage) },
        { path: 'scans/flagged', element: lazyRoute(AdminFlaggedScansPage) },
        { path: 'scans/:scanId', element: lazyRoute(AdminScanDetailPage) },
        { path: 'owners', element: lazyRoute(AdminOwnersPage) },
        { path: 'owners/:ownerId', element: lazyRoute(AdminOwnerDetailPage) },
        { path: 'vehicles', element: lazyRoute(AdminVehiclesPage) },
        { path: 'alert-failures', element: lazyRoute(AdminAlertFailuresPage) },
        { path: 'dead-letter', element: lazyRoute(AdminDeadLetterPage) },
        { path: 'abuse-reports', element: lazyRoute(AdminAbuseReportsPage) },
        { path: 'audit-log', element: lazyRoute(AdminAuditLogPage) }
      ]
    }
  ]
};
