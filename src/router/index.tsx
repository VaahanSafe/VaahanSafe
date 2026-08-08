import { createBrowserRouter } from 'react-router-dom';
import { marketingRoutes } from './routes.marketing';
import { authRoutes } from './routes.auth';
import { dashboardRoutes } from './routes.dashboard';
import { scanRoutes } from './routes.scan';
import { adminRoutes } from './routes.admin';
import React, { Suspense } from 'react';
import SkeletonBlock from '@/components/shared/SkeletonBlock';
import App from '@/App';

const ServerErrorPage = React.lazy(() => import('@/pages/errors/ServerErrorPage'));
const NotFoundPage = React.lazy(() => import('@/pages/errors/NotFoundPage'));
const ForbiddenPage = React.lazy(() => import('@/pages/errors/ForbiddenPage'));
const OfflinePage = React.lazy(() => import('@/pages/errors/OfflinePage'));

const lazyErrorElement = (Component: React.ComponentType) => (
  <Suspense fallback={<SkeletonBlock />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    element: <App />,
    errorElement: lazyErrorElement(ServerErrorPage),
    children: [
      marketingRoutes,
      authRoutes,
      dashboardRoutes,
      scanRoutes,
      adminRoutes,
      {
        path: '/403',
        element: lazyErrorElement(ForbiddenPage)
      },
      {
        path: '/offline',
        element: lazyErrorElement(OfflinePage)
      },
      {
        path: '/500',
        element: lazyErrorElement(ServerErrorPage)
      },
      {
        path: '*',
        element: lazyErrorElement(NotFoundPage)
      }
    ]
  }
]);
