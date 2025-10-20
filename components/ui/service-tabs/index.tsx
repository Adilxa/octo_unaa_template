'use client';

import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface Tab {
  link: string;
  name: string;
}

interface Props {
  tabArr?: Tab[];
}

const ServiceSwitcher: React.FC<Props> = ({ tabArr }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab: any = searchParams.get('type');

  const onSetQueryParam = (param: string, additionalParams: Record<string, string> = {}) => {
    const params = new URLSearchParams(searchParams ? Array.from(searchParams.entries()) : []);
    params.set('type', param);

    Object.entries(additionalParams).forEach(([key, value]) => {
      params.set(key, value);
    });

    router.push(`${window.location.pathname}?${params.toString()}`, { scroll: false });
  };

  if (currentTab == null) return <Loader2 className='animate-spin' />;
  return (
    <Tabs defaultValue={currentTab}>
      <TabsList className='flex h-full w-fit gap-2 rounded-[8px]'>
        {tabArr?.map(el => (
          <TabsTrigger
            className='h-[37px] rounded-[6px] px-3 text-[#808080] data-[state=active]:bg-[#0A63F0] data-[state=active]:text-white data-[state=active]:shadow-[0px_0px_24.7px_0px_rgba(10,99,240,0.5)]'
            onClick={() => onSetQueryParam(el.link)}
            key={el.link}
            value={el.link}
          >
            {el.name}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default ServiceSwitcher;
