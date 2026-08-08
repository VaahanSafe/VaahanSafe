import { useEffect } from 'react';

interface MetaConfig {
  title: string;
  description?: string;
  ogImage?: string;
  jsonLd?: Record<string, any>;
}

export function useDocumentHead({ title, description, ogImage, jsonLd }: MetaConfig) {
  useEffect(() => {
    document.title = `${title} | VaahanSafe - Windshield QR System`;

    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);
    }

    const targetOgImage = ogImage || 'https://vaahansafe.com/logo.png';
    let metaOg = document.querySelector('meta[property="og:image"]');
    if (!metaOg) {
      metaOg = document.createElement('meta');
      metaOg.setAttribute('property', 'og:image');
      document.head.appendChild(metaOg);
    }
    metaOg.setAttribute('content', targetOgImage);

    let metaTwitterOg = document.querySelector('meta[name="twitter:image"]');
    if (metaTwitterOg) {
      metaTwitterOg.setAttribute('content', targetOgImage);
    }

    if (jsonLd) {
      let scriptLd = document.querySelector('script[type="application/ld+json"]');
      if (!scriptLd) {
        scriptLd = document.createElement('script');
        scriptLd.setAttribute('type', 'application/ld+json');
        document.head.appendChild(scriptLd);
      }
      scriptLd.innerHTML = JSON.stringify(jsonLd);
    }
  }, [title, description, ogImage, jsonLd]);
}
