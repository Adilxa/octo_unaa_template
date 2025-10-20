'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FC, Fragment, PropsWithChildren, useState } from 'react';
import { Toaster } from 'sonner';

const Provider: FC<PropsWithChildren> = ({ children }) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <Fragment>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Fragment>
  );
};

export default Provider;
