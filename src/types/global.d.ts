/**
 * Global Ambient Type Augmentations
 */

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.svg?react' {
  import React from 'react';
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

interface Window {
  Razorpay?: new (options: Record<string, any>) => {
    open: () => void;
    on: (event: string, callback: Function) => void;
  };
  turnstile?: {
    render: (container: string | HTMLElement, options: Record<string, any>) => string;
    reset: (widgetId?: string) => void;
    getResponse: (widgetId?: string) => string;
  };
  gtag?: (command: string, action: string, params?: Record<string, any>) => void;
}
