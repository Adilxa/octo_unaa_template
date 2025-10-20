'use client';

import { usePathname } from 'next/navigation';
import { FC, PropsWithChildren } from 'react';
import { Toaster } from 'sonner';
import ScreenSizeWarning from '../screen-warning';
import Footer from './footer';
import Header from './header';

const Layout: FC<PropsWithChildren> = ({ children }) => {
  const pathname = usePathname();
  return (
    <div className={'px-[10px] py-[15px]'}>
      <Header />
      <ScreenSizeWarning />
      {children} <Toaster />
    </div>
  );
};

export default Layout;
