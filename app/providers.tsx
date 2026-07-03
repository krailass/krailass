'use client';

import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ConfirmProvider } from '@/components/ui/confirm';

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 15_000, refetchOnWindowFocus: false, retry: 1 },
        },
      }),
  );

  // Register the service worker for PWA + push.
  React.useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  return (
    <QueryClientProvider client={client}>
      <ConfirmProvider>{children}</ConfirmProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#16231F',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontFamily: 'var(--font-thai)',
            fontWeight: 600,
          },
        }}
      />
    </QueryClientProvider>
  );
}
