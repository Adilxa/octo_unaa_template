'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react';
import PackegesBtn from '@/components/action-btns/PackegesBtn';
import FilterUi from '@/components/filters';
import Layout from '@/components/layout/layout';
import PackageAnalytics from '@/components/package-analytics';
import PackageArchiv from '@/components/package-archiv';
import PackagesInfo from '@/components/packages-info';
import PackageMetrics from '@/components/ui/package-metrics';
import UiFolder from '@/components/ui/ui-folder';

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

const tabsArr = [
  {
    link: 'day',
    name: 'День',
  },
  {
    link: 'week',
    name: 'Неделя',
  },
  {
    link: 'month',
    name: 'Месяц',
  },
];

const PackegesScreen = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentTab = searchParams.get('tab');
  const period = searchParams.get('period');

  useEffect(() => {
    if (!currentTab) {
      router.push('/packages?tab=main-info&period=day', { scroll: false });
    }
  }, [currentTab, router, period]);

  const renderConstent = () => {
    switch (currentTab) {
      case 'main-info':
        return <PackagesInfo />;
      case 'metrics':
        return <PackageMetrics />;
      case 'analytics':
        return <PackageAnalytics />;
      case 'archiv':
        return <PackageArchiv />;
    }
  };

  return (
    <Layout>
      <FilterUi
        title={'Пакеты'}
        underTitle={'Основная информация'}
        showCalendar={false}
        showButton={true}
        btn={<PackegesBtn />}
        showSearchInput={true}
        // criteriaArr={tabsArr}
        // byCriteriaText={'Дата/Период'}
      />
      {/* eslint-disable-next-line react/no-children-prop */}
      <UiFolder folderArr={folderArr} children={renderConstent()} />
    </Layout>
  );
};

export default PackegesScreen;
