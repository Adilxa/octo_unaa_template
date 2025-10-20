'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react';
import BlockedClientsTable from '@/components/blocked-clients-table';
import ClientsTable from '@/components/clients-table';
import FilterUi from '@/components/filters';
import Layout from '@/components/layout/layout';
import UiFolder from '@/components/ui/ui-folder';

const folderArr = [
  {
    title: 'Основная информаия',
    link: 'main',
  },
  {
    title: 'Заблокированные',
    link: 'blocked',
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

const ClientsScreen = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentTab = searchParams.get('tab');
  const period = searchParams.get('period');

  useEffect(() => {
    if (!currentTab) {
      router.push('/clients?tab=main&period=day', { scroll: false });
    }
  }, [currentTab, router, period]);

  const renderContent = () => {
    switch (currentTab) {
      case 'main':
        return <ClientsTable />;
      case 'blocked':
        return <BlockedClientsTable />;
    }
  };

  return (
    <Layout>
      <FilterUi
        title={'Клиенты'}
        underTitle={'Метрика'}
        showCalendar={true}
        criteriaArr={tabsArr}
        showSearchInput={true}
      />
      {/* eslint-disable-next-line react/no-children-prop */}
      <UiFolder folderArr={folderArr} children={renderContent()} />
    </Layout>
  );
};

export default ClientsScreen;
