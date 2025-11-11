import $api from '@/api/http';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronsUpDown, EllipsisVertical } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import React, { useRef, useState } from 'react';
import { toast } from 'sonner';
import EditEmployeeBtn from '@/components/action-btns/editEmployeeBtn';
import EmployeeSalaryBtn from '@/components/action-btns/EmployeeSalaryBtn';
import EmployeeDetails from '@/components/qrCode/QrCodeEmployee';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import CoreTable from '@/components/ui/table/index';
import TabSwitcher from '@/components/ui/tabs/index';

const fetchEmployees = async (search: string, page: string, size: string) => {
  const res = await $api.get('/employee/employees/', {
    params: {
      search: search,
      page: page,
      size: size,
    },
  });
  return res.data;
};

const fetchEmployee = async (id: number) => {
  const res = await $api.get('/employee/employees/' + id + '/');
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
    title: 'Баланс',
    isIcon: false,
  },
  {
    title: '',
    isIcon: false,
  },
];

const EmployeesInfo = () => {
  const searchParams = useSearchParams();
  const queryClient: any = useQueryClient();
  const search: any = searchParams.get('search');

  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const drawerContentRef = useRef<HTMLDivElement>(null);

  // Состояние для контроля открытия/закрытия выпадающих меню
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const size: any = searchParams.get('size');
  const page: any = searchParams.get('page');

  const { data, isLoading } = useQuery({
    queryKey: ['employeeList', search, page, size],
    queryFn: () => fetchEmployees(search, page, size),
  });

  const { data: employee, isLoading: employeeLoading } = useQuery({
    queryKey: ['employee', selectedEmployee],
    queryFn: () => fetchEmployee(selectedEmployee),
    enabled: !!selectedEmployee,
  });

  const deleteEmployee = async (id: number, e: React.MouseEvent) => {
    // Prevent event propagation to the table row
    e.stopPropagation();

    // Закрываем меню после действия
    setOpenMenuId(null);

    try {
      await $api.delete(`employee/employees/${id}/delete/`);
      await queryClient.invalidateQueries(['employeeList']);
      toast('Рабочий успешно удален');
    } catch (error) {
      toast('Ошибка при удалении сотрудника');
      console.error('Delete error:', error);
    }
  };

  const handleRowClick = (id: number) => {
    setSelectedEmployee(id);
  };

  const archiveEmployee = async (id: any, e: any) => {
    e.stopPropagation();

    // Закрываем меню после действия
    setOpenMenuId(null);

    try {
      await $api.patch('employee/employees/' + id + '/update/', {
        id,
        is_active: false,
      });
      await queryClient.invalidateQueries(['employeeList']);
      toast('Успешно архивирован');
    } catch (e: any) {
      toast(e.message);
    }
  };

  const statusText: any = {
    online: 'На линии',
    rest: 'Отдых',
    terminated: 'Завершил работу',
  };

  const totalPages = size > 0 ? Math.ceil(data?.count / size) : 0;
  console.log(data);
  // Handle click on drawer background (dark part)
  const handleDrawerBackdropClick = (e: React.MouseEvent) => {
    // Check if the click is directly on the DrawerContent and not on its children
    if (e.target === drawerContentRef.current) {
      setSelectedEmployee(null);
    }
  };

  // Обработчик для отслеживания нажатия кнопки меню
  const handleMenuTriggerClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Предотвращаем срабатывание клика на строке
    setOpenMenuId(openMenuId === id ? null : id);
  };

  // Обработчик для закрытия меню
  const closeMenu = () => {
    setOpenMenuId(null);
  };

  // Обработчик для запуска компонента и закрытия меню
  const handleComponentClick = (id: number) => {
    // Закрываем меню
    closeMenu();
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

  const renderBodyTable = () => (
    <TableBody>
      {data?.results.map((el: any) => (
        <TableRow
          onClick={() => handleRowClick(el.id)}
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
              {statusText[el.status_working] || 'Неактивно'}
            </div>
          </TableCell>
          <TableCell className={'px-5 py-5'}>{el.branch_name}</TableCell>
          <TableCell className={'px-5 py-5'}>{el.phone}</TableCell>
          <TableCell className={'px-5 py-5'}>{el.commission_rate} %</TableCell>
          <TableCell className={'px-5 py-5'}>{el.salary} с</TableCell>

          <TableCell align={'right'} className={'px-5 py-5'}>
            <DropdownMenu
              open={openMenuId === el.id}
              onOpenChange={open => {
                if (!open) {
                  setOpenMenuId(null);
                }
              }}
            >
              <DropdownMenuTrigger asChild onClick={e => handleMenuTriggerClick(e, el.id)}>
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
                <DropdownMenuItem
                  onClick={e => {
                    deleteEmployee(el.id, e);
                  }}
                >
                  Удалить
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={e => {
                    e.stopPropagation();
                    closeMenu();
                  }}
                >
                  <div onClick={e => e.stopPropagation()}>
                    <EditEmployeeBtn id={el.id} />
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={e => {
                    archiveEmployee(el.id, e);
                  }}
                >
                  Архивировать
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={e => {
                    e.stopPropagation();
                    closeMenu();
                  }}
                >
                  <div onClick={e => e.stopPropagation()}>
                    <EmployeeDetails id={el.id} />
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={e => {
                    e.stopPropagation();
                    closeMenu();
                  }}
                >
                  <div onClick={e => e.stopPropagation()}>
                    <EmployeeSalaryBtn id={el.id} />
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );

  if (isLoading) return <h1>Loading</h1>;
  return (
    <>
      <CoreTable
        totalPages={totalPages}
        tableHeader={renderHeaderTable()}
        tableBody={renderBodyTable()}
      />
      {/* Закомментированная часть с Drawer */}
    </>
  );
};

export default EmployeesInfo;
