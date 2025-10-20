import $api from '@/api/http';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { ChevronsUpDown, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
// Import shadcn/ui drawer components
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import CoreTable from '@/components/ui/table/index';

const fetchMaterials = async (
  search: string,
  period: string,
  page: string,
  size: string,
  start_date: string,
  end_date: string,
) => {
  const res = await $api.get('/employee/expenses-payment-history/', {
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

const fetchEmployeeEarnings = async (employeeId: any) => {
  const res = await $api.get(`/employee/employee/${employeeId}/earnings-summary/`);
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

const serviceTableHeader = [
  {
    title: 'Дата',
    isIcon: true,
  },
  {
    title: 'Фио',
    isIcon: false,
  },
  {
    title: 'Статус',
    isIcon: true,
  },
  {
    title: 'Номер заказа',
    isIcon: true,
  },
  {
    title: 'Зарплата ',
    isIcon: true,
  },
];

const ExpensesSalaryList = () => {
  const searchParams = useSearchParams();
  const search: any = searchParams.get('search');
  const period = searchParams.get('period') || '';
  const size: any = searchParams.get('size');
  const page: any = searchParams.get('page');
  const start_date: any = searchParams.get('start_date');
  const end_date: any = searchParams.get('end_date');

  // State for drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [selectedEmployeeName, setSelectedEmployeeName] = useState('');

  // Query client for fetching employee earnings
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['expensesSalaryList', search, period, page, size, start_date, end_date],
    queryFn: () => fetchMaterials(search, period, page, size, start_date, end_date),
  });

  const { data: employeeEarnings, isLoading: isLoadingEarnings } = useQuery({
    queryKey: ['employeeEarnings', selectedEmployeeId],
    queryFn: () => fetchEmployeeEarnings(selectedEmployeeId),
    enabled: !!selectedEmployeeId && isDrawerOpen,
  });

  const handleRowClick = (employeeId: any, employeeName: any) => {
    setSelectedEmployeeId(employeeId);
    setSelectedEmployeeName(employeeName);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

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

  console.log(data);

  const renderBodyTable = () => (
    <TableBody>
      {data?.map((el: any) => (
        <TableRow
          className='group cursor-pointer transition-colors duration-200 hover:bg-[#0A63F0]'
          key={el.id}
          onClick={() => handleRowClick(el.employee_id, el.employee_name)}
        >
          <TableCell className={'px-5 py-5 group-hover:text-white'}>
            {dayjs(el.timestamp).format('DD.MM.YYYY')}
          </TableCell>
          <TableCell className={'px-5 py-5 group-hover:text-white'}>{el.employee_name}</TableCell>
          <TableCell className={'px-5 py-5'}>
            <div
              className={
                'w-fit rounded-full bg-[#0A63F0] px-2 py-1 text-center font-semibold group-hover:bg-white group-hover:text-[#0A63F0]'
              }
            >
              {el.status_working == 'online'
                ? 'Онлайн'
                : el.status_working == 'rest'
                  ? 'Отдых'
                  : 'Завершил работу'}{' '}
            </div>
          </TableCell>
          <TableCell className={'px-5 py-5 group-hover:text-white'}>{el.order_number}</TableCell>
          <TableCell className={'px-5 py-5 group-hover:text-white'}>{el.amount} сом</TableCell>
        </TableRow>
      ))}
    </TableBody>
  );

  const totalPages = size > 0 ? Math.ceil(data?.count / size) : 0;
  console.log(data);

  if (isLoading) return <h1>Loading</h1>;

  return (
    <>
      <CoreTable
        totalPages={totalPages}
        tableHeader={renderHeaderTable()}
        tableBody={renderBodyTable()}
      />

      {/* Employee Earnings Drawer using shadcn/ui */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className='bg-[#131620] p-0'>
          <div className='flex flex-col items-center py-8'>
            <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-500 text-2xl text-white'>
              {selectedEmployeeName ? selectedEmployeeName.charAt(0) : 'A'}
            </div>
            <h2 className='text-xl font-medium text-white'>
              {selectedEmployeeName || 'Алмаз Маратов'}
            </h2>
            <p className='mt-1 text-sm text-[#30B4E7]'>МОЙЩИК</p>
            <p className='mt-4 text-gray-400'>
              {employeeEarnings?.earnings_history.length || 10} заказов
            </p>
          </div>

          <div className='w-full overflow-auto px-4'>
            {isLoadingEarnings ? (
              <div className='flex h-40 items-center justify-center'>
                <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-[#0A63F0]'></div>
              </div>
            ) : (
              <Table className='w-full'>
                <TableHeader>
                  <TableRow className='border-b-0'>
                    <TableHead className='h-10 text-left font-normal text-[#30B4E7]'>
                      Вид услуги
                    </TableHead>
                    <TableHead className='h-10 text-left font-normal text-[#30B4E7]'>
                      Статус
                    </TableHead>
                    <TableHead className='h-10 text-left font-normal text-[#30B4E7]'>
                      Ставка
                    </TableHead>
                    <TableHead className='h-10 text-right font-normal text-[#30B4E7]'>
                      Зарплата
                    </TableHead>
                    <TableHead className='h-10 text-right font-normal text-[#30B4E7]'>
                      Дата
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeEarnings?.earnings_history.map((earning: any, index: number) => (
                    <TableRow key={index} className='border-t border-gray-800 hover:bg-transparent'>
                      <TableCell className='py-4 font-normal text-white'>
                        {earning.order_id
                          ? `Заказ ${earning.order_id}`
                          : earning.washing_order_id
                            ? `Заказ ${earning.washing_order_id}`
                            : 'Заказ'}
                      </TableCell>
                      <TableCell className='py-4 font-normal'>
                        <span
                          className={`rounded-full px-3 py-1 text-sm text-white ${
                            earning.transaction_type === 'payment' ? 'bg-[#0A63F0]' : 'bg-[#0A63F0]'
                          }`}
                        >
                          {earning.transaction_type === 'payment' ? 'Оплата' : 'Заработок'}
                        </span>
                      </TableCell>
                      <TableCell className='py-4 font-normal text-white'>
                        {earning.commission_rate ? `${earning.commission_rate}%` : '-'}
                      </TableCell>
                      <TableCell className='py-4 text-right font-normal text-white'>
                        {earning.amount} сом
                      </TableCell>
                      <TableCell className='py-4 text-right font-normal text-white'>
                        {earning.timestamp}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default ExpensesSalaryList;
