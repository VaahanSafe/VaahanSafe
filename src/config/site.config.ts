/**
 * Centralized Site Metadata & Navigation Configuration
 */
export const siteConfig = {
  name: 'VaahanSafe',
  shortName: 'VaahanSafe',
  description: 'India\'s Premium Masked Vehicle Safety, Privacy & Emergency Dispatch Platform',
  url: 'https://vaahansafe.in',
  supportEmail: 'support@vaahansafe.in',
  copyright: `© ${new Date().getFullYear()} VaahanSafe Technologies India Ltd. All rights reserved.`,

  socialLinks: {
    twitter: 'https://twitter.com/vaahansafe',
    linkedin: 'https://linkedin.com/company/vaahansafe',
    instagram: 'https://instagram.com/vaahansafe.in',
    github: 'https://github.com/vaahansafe',
  },

  navigationLinks: [
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'Pricing Plans', path: '/pricing' },
    { label: 'Help & FAQ', path: '/faq' },
    { label: 'Legal & DPDP', path: '/legal' },
  ],

  footerLinks: [
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Terms of Service', path: '/terms' },
    { label: 'Grievance Redressal', path: '/legal' },
    { label: 'Admin Access', path: '/admin/login' },
  ],

  seo: {
    defaultTitle: 'VaahanSafe — Masked Calling & Vehicle Emergency System',
    titleTemplate: '%s | VaahanSafe Privacy',
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      url: 'https://vaahansafe.in',
      siteName: 'VaahanSafe',
      images: [
        {
          url: 'https://vaahansafe.in/og-banner.png',
          width: 1200,
          height: 630,
          alt: 'VaahanSafe Vehicle Emergency Platform',
        },
      ],
    },
  },
} as const;

export default siteConfig;
