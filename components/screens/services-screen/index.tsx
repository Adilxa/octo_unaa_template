'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react';
import MaterialBtn from '@/components/action-btns/materialBtn';
import ServiceBtn from '@/components/action-btns/serviceBtn';
import FilterUi from '@/components/filters';
import Layout from '@/components/layout/layout';
import MaterialInstock from '@/components/material-instock';
import ServiceAnalytics from '@/components/service-analytics';
import ServiceInfo from '@/components/service-info';
import ServiceMetrics from '@/components/ui/service-metrics';
import UiFolder from '@/components/ui/ui-folder';
import ServiceArchive from '../service-archive';

const folderArr = [
  {
    title: 'Основная информация',
    link: 'main-info',
  },
  {
    title: 'Метрика',
    link: 'metrics',
  },
  {
    title: 'Аналитика',
    link: 'analytics',
  },
  {
    title: 'Архив',
    link: 'archiv',
  },
];

const ServicesScreen = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentTab = searchParams.get('tab');
  const period = searchParams.get('period');

  useEffect(() => {
    if (!currentTab) {
      router.push('/services?tab=main-info&period=day', { scroll: false });
    }
  }, [currentTab, router, period]);

  const renderConstent = () => {
    switch (currentTab) {
      case 'main-info':
        return <ServiceInfo />;
      case 'metrics':
        return <ServiceMetrics />;
      case 'analytics':
        return <ServiceAnalytics />;
      case 'archiv':
        return <ServiceArchive />;
    }
  };

  return (
    <Layout>
      <FilterUi
        title={'Услуги'}
        underTitle={'Основная \n информация'}
        showCalendar={false}
        showButton={true}
        btn={<ServiceBtn />}
        showSearchInput={true}
      />
      {/* eslint-disable-next-line react/no-children-prop */}
      <UiFolder folderArr={folderArr} children={renderConstent()} />
    </Layout>
  );
};

export default ServicesScreen;
