'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const HomeScreen = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const hasToken = document.cookie.includes('access_token=');

    if (hasToken) {
      router.push('/dashboard');
    } else {
      router.push('/auth');
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [router]);

  if (isLoading) {
    return (
      <div className='flex h-screen w-full items-center justify-center bg-[#01030e]'>
        <Loader2 className='h-8 w-8 animate-spin text-[#0A63F0]' />
      </div>
    );
  }

  return null;
};

export default HomeScreen;
