'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react';
import MaterialBtn from '@/components/action-btns/materialBtn';
import NewOrderBtn from '@/components/action-btns/newOrderWashingBtn';
import DetailingCompletedTable from '@/components/detailing-completed';
import DetailingInprogressTable from '@/components/detailing-inprogress';
import DetailingNewTable from '@/components/detailing-new';
import DetailOrders from '@/components/detailing-orders';
import FilterUi from '@/components/filters';
import Layout from '@/components/layout/layout';
import MaterialInstock from '@/components/material-instock';
import OrdersCards from '@/components/orders-cards';
import UiFolder from '@/components/ui/ui-folder';
import WashingCompletedTable from '@/components/washing-completed';
import WashingInprogressTable from '@/components/washing-inprogress';
import WashingNew from '@/components/washing-new';
import WashingPendingTable from '@/components/washing-pending';

const folderArr = [
  {
    title: 'В ожидании',
    link: 'new',
  },
  {
    title: 'В работе',
    link: 'inprogress',
  },
  {
    title: 'Выполненные',
    link: 'done',
  },
];

const OrdersScreen = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentTab = searchParams.get('tab');
  const period = searchParams.get('period');
  const type = searchParams.get('type');

  useEffect(() => {
    if (!currentTab) {
      router.push('/applications?tab=new&period=day&type=washing', { scroll: false });
    }
  }, [currentTab, router, period]);

  const renderConstent = () => {
    switch (currentTab) {
      case 'new':
        return type == 'washing' ? (
          <>
            <OrdersCards />
            <WashingNew />
          </>
        ) : (
          <>
            <DetailOrders />
            <DetailingNewTable />
          </>
        );
      case 'inprogress':
        return type == 'washing' ? (
          <>
            <WashingInprogressTable />
          </>
        ) : (
          <DetailingInprogressTable />
        );
      case 'done':
        return type == 'washing' ? (
          <>
            <WashingCompletedTable />
          </>
        ) : (
          <DetailingCompletedTable />
        );
    }
  };

  return (
    <Layout>
      <FilterUi
        title={'Заявки'}
        underTitle={'Основная информация'}
        showCalendar={false}
        showButton={true}
        btn={<NewOrderBtn />}
        showSearchInput={true}
        type={true}
      />
      {/* eslint-disable-next-line react/no-children-prop */}
      <UiFolder folderArr={folderArr} children={renderConstent()} />
    </Layout>
  );
};

export default OrdersScreen;
