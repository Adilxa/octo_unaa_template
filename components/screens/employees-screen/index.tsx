'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react';
import DownloadAppBtn from '@/components/action-btns/DownloadAppBtn';
import NewEmployeeBtn from '@/components/action-btns/newEmployeeBtn';
import PackegesBtn from '@/components/action-btns/PackegesBtn';
import SalaryBtn from '@/components/action-btns/SalaryBtn';
import EmployeeAnalytics from '@/components/employee-analytics';
import EmployeeArchiv from '@/components/employee-archiv';
import EmployeesInfo from '@/components/employees-info';
import FilterUi from '@/components/filters';
import Layout from '@/components/layout/layout';
import UiFolder from '@/components/ui/ui-folder';

const folderArr = [
  {
    title: 'Основная информация',
    link: 'main-info',
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

const EmployeesScreen = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentTab = searchParams.get('tab');
  const period = searchParams.get('period');

  useEffect(() => {
    if (!currentTab) {
      router.push('/employees?tab=main-info&period=day', { scroll: false });
    }
  }, [currentTab, router, period]);

  const renderConstent = () => {
    switch (currentTab) {
      case 'main-info':
        return <EmployeesInfo />;
      case 'analytics':
        return <EmployeeAnalytics />;
      case 'archiv':
        return <EmployeeArchiv />;
    }
  };

  return (
    <Layout>
      <FilterUi
        title={'Сотрудники'}
        underTitle={'Основная информация'}
        showCalendar={false}
        showButton={true}
        btn={
          <div className={'flex items-center gap-5'}>
            {/* <DownloadAppBtn /> */}
            <NewEmployeeBtn />
          </div>
        }
        showSearchInput={true}
        // criteriaArr={tabsArr}
        // byCriteriaText={'Дата/Период'}
      />
      {/* eslint-disable-next-line react/no-children-prop */}
      <UiFolder folderArr={folderArr} children={renderConstent()} />
    </Layout>
  );
};

export default EmployeesScreen;
