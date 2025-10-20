'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react';
import FilterUi from '@/components/filters';
import DahboardBranches from '@/components/ui/dashboard-branches';
import DashboardMetrics from '@/components/ui/dashboard-metrics';
import UiFolder from '@/components/ui/ui-folder';

const folderArr = [
  {
    title: 'Основные метрики',
    link: 'metrics',
  },
  // {
  //   title: 'Филиалы',
  //   link: 'fillials',
  // },
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

const DashboardScreen = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentTab = searchParams.get('tab');
  const period = searchParams.get('period');

  useEffect(() => {
    if (!currentTab) {
      router.push('/dashboard?tab=metrics&period=day&expensePeriod=day&revenuePeriod=day', {
        scroll: false,
      });
    }
  }, [currentTab, router, period]);

  const renderConstent = () => {
    switch (currentTab) {
      case 'metrics':
        return <DashboardMetrics />;
      case 'fillials':
        return <div>fillials</div>;
    }
  };

  return (
    <div>
      <FilterUi
        title={'Сводка'}
        byCriteriaText={'Дата/Период'}
        criteriaArr={tabsArr}
        underTitle={'Анализ бизнеса'}
        showCalendar={true}
      />
      {/* eslint-disable-next-line react/no-children-prop */}
      <UiFolder folderArr={folderArr} children={renderConstent()} />
    </div>
  );
};

export default DashboardScreen;
