'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react';
import MaterialBtn from '@/components/action-btns/materialBtn';
import FilterUi from '@/components/filters';
import Layout from '@/components/layout/layout';
import MaterialInstock from '@/components/material-instock';
import MaterialsWrittenOff from '@/components/materials-writtenoff';
import UiFolder from '@/components/ui/ui-folder';

const folderArr = [
  {
    title: 'На складе',
    link: 'instock',
  },
  {
    title: 'Списанные',
    link: 'writtenoff',
  },
];

const MaterialsScreen = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentTab = searchParams.get('tab');
  const period = searchParams.get('period');

  useEffect(() => {
    if (!currentTab) {
      router.push('/materials?tab=instock&period=day', { scroll: false });
    }
  }, [currentTab, router, period]);

  const renderConstent = () => {
    switch (currentTab) {
      case 'instock':
        return <MaterialInstock />;
      case 'writtenoff':
        return <MaterialsWrittenOff />;
    }
  };

  return (
    <Layout>
      <FilterUi
        title={'Материалы'}
        underTitle={'Список'}
        showCalendar={false}
        showButton={true}
        btn={<MaterialBtn />}
        showSearchInput={true}
      />
      {/* eslint-disable-next-line react/no-children-prop */}
      <UiFolder folderArr={folderArr} children={renderConstent()} />
    </Layout>
  );
};

export default MaterialsScreen;
