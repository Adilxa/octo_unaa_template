import $api from '@/api/http';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { ChevronsUpDown, EllipsisVertical } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';
import DetailWashBtn from '@/components/action-btns/DetailWashBtn';
import EditEmployeeBtn from '@/components/action-btns/editEmployeeBtn';
import WashingOrderDetailsDialog from '@/components/order-washing-detail/index';
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

// Функция для получения завершенных заказов
const fetchWashing = async (search: string, page: string, size: string) => {
  const res = await $api.get('/washing/washing_orders/list/?status=completed', {
    params: {
      search: search,
      page: page,
      size: size,
    },
  });
  return res.data;
};

const TableHeaderData = [
  // {
  //   title: '',
  //   isIcon: false,
  //   checkbox: true,
  // },
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
];

const WashingCompletedTable = () => {
  const searchParams = useSearchParams();
  const size: any = searchParams.get('size') || 10;
  const queryClient: any = useQueryClient();
  const search: any = searchParams.get('search') || '';
  const page: any = searchParams.get('page') || 1;

  // Состояние для управления выбором всех чекбоксов
  const [selectAll, setSelectAll] = useState(false);

  // Состояние для модального окна с деталями
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Функция для удаления заказа
  const deleteWashing = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      await $api.delete(`washing/washing_orders/${id}/`);
      await queryClient.invalidateQueries({ queryKey: ['washingList'] });
      toast('Успешно удален');
    } catch (error) {
      toast('Ошибка при удалении');
      console.error('Delete error:', error);
    }
  };

  // Запрос на получение данных
  const { data, isLoading } = useQuery({
    queryKey: ['washingList', search, page, size],
    queryFn: () => fetchWashing(search, page, size),
  });

  // Обработчик клика по строке для показа деталей заказа
  const handleRowClick = async (order: any) => {
    try {
      setIsLoadingDetails(true);
      setSelectedOrder(order);
      setIsDetailsOpen(true);
    } catch (error) {
      console.error('Error handling row click:', error);
      toast('Ошибка при загрузке деталей заказа');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Простой обработчик для переключения состояния "выбрать все"
  const handleSelectAll = () => {
    setSelectAll(!selectAll);
  };

  // Словарь для перевода статусов
  const statusTranslations: { [key: string]: string } = {
    pending: 'В ожидании',
    in_progress: 'В процессе',
    completed: 'Завершено',
    in_stock: 'В наличии',
    replenished: 'Пополнить',
  };

  // Рендер заголовка таблицы
  const renderHeaderTable = () => (
    <TableHeader>
      <TableRow>
        {TableHeaderData.map((el: any) => (
          <TableHead className={'px-5 py-8'} key={el.title}>
            <div className={'flex items-center gap-2 text-[#30B4E7]'}>
              {/* {el.checkbox && (
                <Checkbox
                  className={'group-hover:border-white'}
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                />
              )} */}
              {el.title} {el.isIcon && <ChevronsUpDown width={15} height={15} />}
            </div>
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );

  // Рендер тела таблицы
  const renderBodyTable = () => {
    if (!data || !data.results || data.results.length === 0) {
      return (
        <TableBody>
          <TableRow>
            <TableCell colSpan={TableHeaderData.length} className='py-10 text-center'>
              Нет данных для отображения
            </TableCell>
          </TableRow>
        </TableBody>
      );
    }

    return (
      <TableBody>
        {data?.results.map((el: any) => (
          <TableRow
            onClick={() => handleRowClick(el)}
            className='group cursor-pointer transition-colors duration-200 hover:bg-[#0A63F0]'
            key={el.id}
          >
            {/* <TableCell className={'px-5 py-5'}>
              <Checkbox
                className={'group-hover:border-white'}
                checked={selectAll}
                onClick={e => e.stopPropagation()}
              />
            </TableCell> */}
            <TableCell className={'px-5 py-5'}>{el.order_number}</TableCell>
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
            <TableCell className={'px-5 py-5'}>{el.license_plate}</TableCell>
            <TableCell className={'px-5 py-5'}>
              <ul>
                {el?.package_names?.map((packageName: any, i: number) => (
                  <li key={`${packageName}_${i}`}>{packageName}</li>
                ))}
              </ul>
            </TableCell>
            <TableCell className={'px-5 py-5'}>{el.employee_name}</TableCell>
            <TableCell className={'px-5 py-5'}>
              {el.created_at ? dayjs(el.created_at).format('DD.MM.YYYY  HH:mm') : '-'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    );
  };

  // Вычисление общего количества страниц
  const totalPages = Math.ceil(data?.count / (parseInt(size) || 10));

  // Рендер компонента
  return (
    <>
      {isLoading ? (
        <div className='flex items-center justify-center p-10'>
          <p>Загрузка данных...</p>
        </div>
      ) : (
        <CoreTable
          totalPages={totalPages}
          tableHeader={renderHeaderTable()}
          tableBody={renderBodyTable()}
        />
      )}

      {selectedOrder && (
        <WashingOrderDetailsDialog
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          orderData={selectedOrder}
          isLoading={isLoadingDetails}
        />
      )}
    </>
  );
};

export default WashingCompletedTable;
