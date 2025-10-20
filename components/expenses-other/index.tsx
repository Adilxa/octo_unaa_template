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

const fetchMaterials = async (period: string, page: string, size: string) => {
  const res = await $api.get('expenses/list/?category=3', {
    params: {
      period: period,
      page: page,
      size: size,
    },
  });
  return res.data;
};

const serviceTableHeader = [
  {
    title: 'Сумма',
    isIcon: false,
  },
  {
    title: 'Описание',
    isIcon: true,
  },
  {
    title: 'Дата',
    isIcon: true,
  },
  {
    title: 'Категория',
    isIcon: true,
  },
];

const ExpensesOtherList = () => {
  const searchParams = useSearchParams();
  const period = searchParams.get('period') || '';
  const size: any = searchParams.get('size');
  const page: any = searchParams.get('page');

  const { data, isLoading } = useQuery({
    queryKey: ['expensesOther', period, page, size],
    queryFn: () => fetchMaterials(period, page, size),
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
      {data.results?.map((el: any) => (
        <TableRow
          className='group cursor-pointer transition-colors duration-200 hover:bg-[#0A63F0]'
          key={el.id}
        >
          <TableCell className={'px-5 py-5'}>{el.amount} сом</TableCell>
          <TableCell className={'px-5 py-5'}>{el.description}</TableCell>
          <TableCell className={'px-5 py-5'}>{dayjs(el.date).format('DD.MM.YYYY')}</TableCell>
          <TableCell className={'px-5 py-5'}>{el.category_name}</TableCell>
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
    </>
  );
};

export default ExpensesOtherList;
