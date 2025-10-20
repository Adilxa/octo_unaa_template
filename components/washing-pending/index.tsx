import $api from '@/api/http';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { ChevronsUpDown, EllipsisVertical } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';
import DetailWashBtn from '@/components/action-btns/DetailWashBtn';
import EditEmployeeBtn from '@/components/action-btns/editEmployeeBtn';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import CoreTable from '@/components/ui/table/index';

const fetchWashing = async (search: string, page: string, size: string) => {
  const res = await $api.get('/washing/washing_orders/list/?status=pending', {
    params: {
      search: search,
      page: page,
      size: size,
    },
  });
  return res.data;
};

const TableHeaderData = [
  {
    title: '',
    isIcon: false,
    checkbox: true,
  },
  {
    title: 'Личный номер',
    isIcon: true,
  },
  {
    title: 'Статус',
    isIcon: true,
  },
  {
    title: 'Клиент',
    isIcon: true,
  },
  {
    title: 'Номер авто',
    isIcon: true,
  },
  {
    title: 'Услуги',
    isIcon: true,
  },
  {
    title: 'Сотрудник',
    isIcon: true,
  },
  {
    title: 'Дата и время',
    isIcon: true,
  },
  {
    title: '',
    isIcon: false,
  },
];

const WashingPendingTable = () => {
  const searchParams = useSearchParams();
  const queryClient: any = useQueryClient();
  const search: any = searchParams.get('search');
  const size: any = searchParams.get('size');
  const page: any = searchParams.get('page');

  // Состояние для управления выбором всех чекбоксов
  const [selectAll, setSelectAll] = useState(false);

  const deleteWashing = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      await $api.delete(`washing/washing_orders/${id}/`);
      await queryClient.invalidateQueries(['washingList']);
      toast('Успешно удален');
    } catch (error) {
      toast('Ошибка при удалении');
      console.error('Delete error:', error);
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: ['washingList_pending', search],
    queryFn: () => fetchWashing(search, page, size),
  });

  // Простой обработчик для переключения состояния "выбрать все"
  const handleSelectAll = () => {
    setSelectAll(!selectAll);
  };

  const renderHeaderTable = () => (
    <TableHeader>
      <TableRow>
        {TableHeaderData.map((el: any) => (
          <TableHead className={'px-5 py-8'} key={el.title}>
            <div className={'flex items-center gap-2 text-[#30B4E7]'}>
              {el.checkbox && (
                <Checkbox
                  className={'group-hover:border-white'}
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                />
              )}
              {el.title} {el.isIcon && <ChevronsUpDown width={15} height={15} />}
            </div>
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );

  const statusTranslations: { [key: string]: string } = {
    pending: 'В ожидании',
    in_progress: 'В процессе',
    completed: 'Завершено',
    in_stock: 'В наличии',
    replenished: 'Пополнить',
  };

  const renderBodyTable = () => (
    <TableBody>
      {data?.map((el: any) => (
        <TableRow
          // onClick={() => handleRowClick(el.id)}
          className='group cursor-pointer transition-colors duration-200 hover:bg-[#0A63F0]'
          key={el.id}
        >
          <TableCell className={'px-5 py-5'}>
            <Checkbox
              className={'group-hover:border-white'}
              checked={selectAll}
              // Для индивидуальных чекбоксов не добавляем обработчик клика,
              // так как они должны только отражать состояние главного чекбокса
            />
          </TableCell>
          <TableCell className={'px-5 py-5'}>111000</TableCell>
          <TableCell className={'px-5 py-5'}>
            <div
              className={
                'w-fit rounded-full bg-[#0A63F0] px-2 py-1 text-center font-semibold group-hover:bg-white group-hover:text-[#0A63F0]'
              }
            >
              {statusTranslations[el.status] || 'Неизвестный статус'}
            </div>
          </TableCell>
          <TableCell className={'px-5 py-5'}>{el.client_name}</TableCell>
          <TableCell className={'px-5 py-5'}>02 VJ2938HK</TableCell>
          <TableCell className={'px-5 py-5'}>Пакет 2-х этапная...</TableCell>
          <TableCell className={'px-5 py-5'}>{el.employee_name}</TableCell>
          <TableCell className={'px-5 py-5'}>
            {dayjs(el.created_at).format('DD.MM.YYYY  HH:mm')}
          </TableCell>
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
                {/*<DropdownMenuItem onClick={e => deleteWashing(el.id, e)}>Удалить</DropdownMenuItem>*/}
                <DropdownMenuItem onClick={e => e.stopPropagation()}>
                  <DetailWashBtn id={el.id} />
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
    <>
      <CoreTable
        totalPages={totalPages}
        tableHeader={renderHeaderTable()}
        tableBody={renderBodyTable()}
      />
    </>
  );
};

export default WashingPendingTable;
