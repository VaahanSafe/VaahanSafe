import type { RouteObject } from 'react-router-dom';
import MarketingLayout from '@/layouts/MarketingLayout';
import React, { Suspense } from 'react';
import SkeletonBlock from '@/components/shared/SkeletonBlock';

const LandingPage = React.lazy(() => import('@/pages/marketing/LandingPage'));
const PricingPage = React.lazy(() => import('@/pages/marketing/PricingPage'));
const HowItWorksPage = React.lazy(() => import('@/pages/marketing/HowItWorksPage'));
const FeaturesPage = React.lazy(() => import('@/pages/marketing/FeaturesPage'));
const FaqPage = React.lazy(() => import('@/pages/marketing/FaqPage'));
const ContactSalesPage = React.lazy(() => import('@/pages/marketing/ContactSalesPage'));
const PrivacyPolicyPage = React.lazy(() => import('@/pages/marketing/PrivacyPolicyPage'));
const TermsOfServicePage = React.lazy(() => import('@/pages/marketing/TermsOfServicePage'));

const lazyRoute = (Component: React.ComponentType) => (
  <Suspense fallback={<SkeletonBlock />}>
    <Component />
  </Suspense>
);

export const marketingRoutes: RouteObject = {
  element: <MarketingLayout />,
  children: [
    { path: '/', element: lazyRoute(LandingPage) },
    { path: '/pricing', element: lazyRoute(PricingPage) },
    { path: '/how-it-works', element: lazyRoute(HowItWorksPage) },
    { path: '/features', element: lazyRoute(FeaturesPage) },
    { path: '/faq', element: lazyRoute(FaqPage) },
    { path: '/contact-sales', element: lazyRoute(ContactSalesPage) },
    { path: '/legal', element: lazyRoute(PrivacyPolicyPage) },
    { path: '/privacy', element: lazyRoute(PrivacyPolicyPage) },
    { path: '/terms', element: lazyRoute(TermsOfServicePage) }
  ]
};
