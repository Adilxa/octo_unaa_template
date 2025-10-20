import $api from '@/api/http';
import { useQuery } from '@tanstack/react-query';
import { ChevronsUpDown } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import CoreTable from '@/components/ui/table/index';
import TabSwitcher from '@/components/ui/tabs/index';

const fetchPackagesMetrics = async (search: string, page: string, size: string) => {
  const res = await $api.get('/packages/analytics/', {
    params: {
      search: search,
      page: page,
      size: size,
    },
  });
  return res.data;
};

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

const PackageTableHeader = [
  {
    title: 'Рейтинг',
    isIcon: false,
  },
  {
    title: 'Название пакета',
    isIcon: true,
  },
  {
    title: 'Статус',
    isIcon: true,
  },
  {
    title: 'Количество заказов',
    isIcon: true,
  },
  {
    title: 'Сумма общая',
    isIcon: true,
  },
];

const PackageMetrics = () => {
  const searchParams = useSearchParams();
  const search: any = searchParams.get('search');
  const size: any = searchParams.get('size');
  const page: any = searchParams.get('page');

  const { data, isLoading } = useQuery({
    queryKey: ['packageMetrics', search, page, size],
    queryFn: () => fetchPackagesMetrics(search, page, size),
  });

  console.log(data);

  const [selectedPackageMetric, setSelectedPackageMetric] = useState<any>(null);

  const handleRowClick = (service: any) => {
    setSelectedPackageMetric(service);
  };

  const renderHeaderTable = () => (
    <TableHeader>
      <TableRow>
        {PackageTableHeader.map((el: any) => (
          <TableHead className={'px-5 py-8'} key={el.title}>
            <div className={'flex items-center gap-2 text-[#30B4E7]'}>
              {el.title} {el.isIcon && <ChevronsUpDown width={15} height={15} />}
            </div>
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );

  const renderBodyTable = () => (
    <TableBody>
      {data?.results.map((el: any) => (
        <TableRow
          onClick={() => handleRowClick(el)}
          className='group transition-colors duration-200 hover:bg-[#0A63F0]'
          key={el.id}
        >
          <TableCell className={'px-5 py-5'}>{el.usage_count}</TableCell>
          <TableCell className={'px-5 py-5'}>{el.package_name}</TableCell>
          <TableCell className={'px-5 py-5'}>
            <div
              className={
                'w-fit rounded-full bg-[#0A63F0] px-2 py-1 text-center font-semibold group-hover:bg-white group-hover:text-[#0A63F0]'
              }
            >
              {el.is_active ? 'Активно' : 'Неактивно'}
            </div>
          </TableCell>
          <TableCell className={'px-5 py-5'}>{el.usage_count} заказов</TableCell>
          <TableCell className={'px-5 py-5'}>{el.total_revenue} cом</TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
  const totalPages = size > 0 ? Math.ceil(data?.count / size) : 0;

  if (isLoading) return <h1>Loading</h1>;
  return (
    <>
      <CoreTable
        totalPages={totalPages}
        tableHeader={renderHeaderTable()}
        tableBody={renderBodyTable()}
      />

      <Drawer open={!!selectedPackageMetric} onClose={() => setSelectedPackageMetric(null)}>
        <DrawerContent className={'mb-5 flex flex-col items-center justify-center gap-5'}>
          <DrawerHeader>
            <DrawerTitle className={'text-[48px] font-semibold'}>
              {selectedPackageMetric?.package_name}
            </DrawerTitle>
          </DrawerHeader>
          {selectedPackageMetric && <TabSwitcher tabArr={tabsArr} />}
          <h2 className={'text-[20px] font-medium text-[#71717A]'}>
            {selectedPackageMetric?.usage_count} заказов
          </h2>
          <h1 className={'text-[64px] font-semibold text-[#0A63F0]'}>
            {selectedPackageMetric?.total_revenue} cом
          </h1>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default PackageMetrics;
