import $api from '@/api/http';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronsUpDown, EllipsisVertical } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';
import EditEmployeeBtn from '@/components/action-btns/editEmployeeBtn';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import CoreTable from '@/components/ui/table/index';

const fetchArchiceEmployees = async () => {
  const res = await $api.get('/employee/employees/inactive/');
  return res.data;
};

const serviceTableHeader = [
  {
    title: 'ФИО сотрудника',
    isIcon: false,
  },
  {
    title: 'Должность',
    isIcon: true,
  },
  {
    title: 'Статус',
    isIcon: true,
  },
  {
    title: 'Филиал',
    isIcon: true,
  },
  {
    title: 'Телефон',
    isIcon: true,
  },
  {
    title: 'Зарплата',
    isIcon: true,
  },
  {
    title: '',
    isIcon: false,
  },
];

const EmployeeArchive = () => {
  const searchParams = useSearchParams();
  const size: any = searchParams.get('search');

  const queryClient: any = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['archiveEmployees'],
    queryFn: fetchArchiceEmployees,
  });

  const unArchiveEmployee = async (id: any, e: any) => {
    e.stopPropagation();
    try {
      await $api.patch('employee/employees/' + id + '/update/', {
        id,
        is_active: true,
      });
      queryClient.invalidateQueries('archiveEmployees');
      toast('Успешно архивирован');
    } catch (e: any) {
      toast(e.message);
    }
  };

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
          <TableCell className={'px-5 py-5'}>
            {el.first_name} {el.last_name}
          </TableCell>
          <TableCell className={'px-5 py-5'}>
            {el.position == 'washer' ? 'Мойщик' : 'Мастер'}
          </TableCell>
          <TableCell className={'px-5 py-5'}>
            <div
              className={
                'w-fit rounded-full bg-[#0A63F0] px-2 py-1 text-center font-semibold group-hover:bg-white group-hover:text-[#0A63F0]'
              }
            >
              {el.status == 'True' ? 'Активно' : 'Неактивно'}
            </div>
          </TableCell>
          <TableCell className={'px-5 py-5'}>{el.branch_name}</TableCell>
          <TableCell className={'px-5 py-5'}>{el.phone}</TableCell>
          <TableCell className={'px-5 py-5'}>{el.commission_rate} %</TableCell>
          <TableCell align={'right'} className={'px-5 py-5'}>
            <DropdownMenu>
              <DropdownMenuTrigger onClick={e => e.stopPropagation()}>
                <Button
                  className={
                    'rounded-[8px] bg-[#0A63F029] px-3 group-hover:bg-white group-hover:text-[#000]'
                  }
                >
                  <EllipsisVertical width={20} height={20} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className={'bg-[#171928]'}>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={e => unArchiveEmployee(el.id, e)}>
                  Разархивировать
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
  const totalPages = size > 0 ? Math.ceil(data?.count / size) : 0;

  if (isLoading) return <h1>Loading</h1>;
  return (
    <CoreTable
      totalPages={totalPages}
      tableHeader={renderHeaderTable()}
      tableBody={renderBodyTable()}
    />
  );
};

export default EmployeeArchive;
