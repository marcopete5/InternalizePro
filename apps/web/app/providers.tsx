'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type PropsWithChildren } from 'react';

export function Providers({ children }: PropsWithChildren): React.JSX.Element {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <QueryClientProvider client={queryClient}>{children as any}</QueryClientProvider>;
}
