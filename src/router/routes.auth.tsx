import type { RouteObject } from 'react-router-dom';
import AuthLayout from '@/layouts/AuthLayout';
import GuestOnlyRoute from '@/router/GuestOnlyRoute';
import React, { Suspense } from 'react';
import SkeletonBlock from '@/components/shared/SkeletonBlock';

const LoginPage = React.lazy(() => import('@/pages/auth/LoginPage'));
const SignupPage = React.lazy(() => import('@/pages/auth/SignupPage'));
const OtpVerifyPage = React.lazy(() => import('@/pages/auth/OtpVerifyPage'));
const OnboardingPage = React.lazy(() => import('@/pages/auth/OnboardingPage'));

const lazyRoute = (Component: React.ComponentType) => (
  <Suspense fallback={<SkeletonBlock />}>
    <Component />
  </Suspense>
);

export const authRoutes: RouteObject = {
  element: <GuestOnlyRoute />,
  children: [
    {
      element: <AuthLayout />,
      children: [
        { path: '/login', element: lazyRoute(LoginPage) },
        { path: '/signup', element: lazyRoute(SignupPage) },
        { path: '/verify-otp', element: lazyRoute(OtpVerifyPage) },
        { path: '/onboarding', element: lazyRoute(OnboardingPage) }
      ]
    }
  ]
};
