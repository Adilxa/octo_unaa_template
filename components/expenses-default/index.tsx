import $api from '@/api/http';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { ChevronsUpDown } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import React from 'react';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import CoreTable from '@/components/ui/table/index';

const fetchNotDefaultList = async (
  id: any,
  page: string,
  size: string,
  start_date: string,
  end_date: string,
) => {
  const res = await $api.get(`/expenses/list/?category=${id}`, {
    params: {
      page: page,
      size: size,
      start_date: start_date,
      end_date: end_date,
    },
  });
  return res.data;
};

const serviceTableHeader = [
  {
    title: 'Дата',
    isIcon: true,
  },
  {
    title: 'Описание',
    isIcon: true,
  },
  {
    title: 'Наименование расходов',
    isIcon: true,
  },
  {
    title: 'Филиал',
    isIcon: true,
  },
  {
    title: 'Сумма',
    isIcon: true,
  },
];

const ExpensesDefaultList = ({ id }: any) => {
  const searchParams = useSearchParams();
  const page: any = searchParams.get('page') || '';
  const size: any = searchParams.get('size') || '';
  const start_date: any = searchParams.get('start_date');
  const end_date: any = searchParams.get('end_date');

  const { data, isLoading } = useQuery({
    queryKey: ['notDefaultList', id, page, size, start_date, end_date],
    queryFn: () => fetchNotDefaultList(id, page, size, start_date, end_date),
  });

  console.log(data);

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
      {data?.results.map((el: any) => (
        <TableRow
          className='group cursor-pointer transition-colors duration-200 hover:bg-[#0A63F0]'
          key={el.id}
        >
          <TableCell className={'px-5 py-5'}>{el.date}</TableCell>
          <TableCell className={'px-5 py-5'}>{el.description}</TableCell>
          <TableCell className={'px-5 py-5'}>{el.subcategory_name || ''}</TableCell>
          <TableCell className={'px-5 py-5'}>
            <div
              className={
                'w-fit rounded-full bg-[#0A63F0] px-2 py-1 text-center font-semibold group-hover:bg-white group-hover:text-[#0A63F0]'
              }
            >
              {el.branch_name}
            </div>
          </TableCell>
          <TableCell className={'px-5 py-5'}>{el.amount} сом</TableCell>
        </TableRow>
      ))}
    </TableBody>
  );

  console.log(data);

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

export default ExpensesDefaultList;
