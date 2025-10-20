import $api from '@/api/http';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { ChevronsUpDown, EllipsisVertical } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import CoreTable from '@/components/ui/table/index';
import TabSwitcher from '@/components/ui/tabs/index';

// Updated function to fetch materials with the new endpoint
const fetchMaterials = async (
  search: string,
  period: string,
  page: string,
  size: string,
  start_date: string,
  end_date: string,
) => {
  // Assuming the new endpoint is slightly different
  const res = await $api.get('expenses/material-expenses/list/', {
    params: {
      search: search,
      period: period,
      page: page,
      size: size,
      start_date: start_date,
      end_date: end_date,
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

// Updated table headers based on the new data structure
const serviceTableHeader = [
  {
    title: 'Номер заказа',
    isIcon: true,
  },
  {
    title: 'Материал',
    isIcon: true,
  },
  {
    title: 'Количество',
    isIcon: true,
  },
  {
    title: 'Цена за единицу',
    isIcon: true,
  },
  {
    title: 'Общая сумма',
    isIcon: true,
  },
  {
    title: 'Дата',
    isIcon: false,
  },
];

const ExpensesMaterialsList = () => {
  const searchParams = useSearchParams();
  const search: any = searchParams.get('search');
  const period = searchParams.get('period') || '';
  const size: any = searchParams.get('size');
  const page: any = searchParams.get('page');
  const start_date: any = searchParams.get('start_date');
  const end_date: any = searchParams.get('end_date');

  const { data, isLoading } = useQuery({
    queryKey: ['materialConsumptionList', search, period, page, size, start_date, end_date],
    queryFn: () => fetchMaterials(search, period, page, size, start_date, end_date),
  });

  const renderHeaderTable = () => (
    <TableHeader>
      <TableRow>
        {serviceTableHeader.map((el: any) => (
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
      {data &&
        data?.results?.map((item: any, index: number) => (
          <TableRow
            className='group cursor-pointer transition-colors duration-200 hover:bg-[#0A63F0]'
            key={index}
          >
            <TableCell className={'px-5 py-5'}>{item.order_number || '-'}</TableCell>
            <TableCell className={'px-5 py-5'}>{item.material_name}</TableCell>
            <TableCell className={'px-5 py-5'}>{item.quantity}</TableCell>
            <TableCell className={'px-5 py-5'}>{item.unit_price_at_exit} сом</TableCell>
            <TableCell className={'px-5 py-5'}>{item.total_price} сом</TableCell>
            <TableCell className={'px-5 py-5'}>
              {item.timestamp ? dayjs(item.timestamp).format('DD.MM.YYYY HH:mm') : '-'}
            </TableCell>
          </TableRow>
        ))}
    </TableBody>
  );

  const totalPages = size > 0 ? Math.ceil(data?.count / size) : 0;
  console.log(totalPages);

  if (isLoading) return <h1>Loading</h1>;

  return (
    <>
      <CoreTable
        totalPages={totalPages}
        tableHeader={renderHeaderTable()}
        tableBody={renderBodyTable()}
      />
    </>
  );
};

export default ExpensesMaterialsList;
