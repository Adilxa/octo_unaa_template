import $api from '@/api/http';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { ChevronsUpDown, EllipsisVertical } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';
import OrderDetailsDialog from '@/components/order-details-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import CoreTable from '@/components/ui/table/index';

const fetchWashing = async (search: string, page: string, size: string) => {
  const res = await $api.get('/master/order-groups/?status=in_progress', {
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
    title: 'Сумма',
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

const DetailingInprogressTable = () => {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const search = searchParams.get('search') || '';
  const size: any = searchParams.get('size');
  const page: any = searchParams.get('page');

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const handleRowClick = async (orderId: any) => {
    try {
      setIsLoadingDetails(true);

      // Fetch detailed order data from the API
      const response = await $api.get(`/master/order-groups/${orderId}/`);
      const detailedOrder = response.data;

      console.log('Detailed order data:', detailedOrder);
      setSelectedOrder(detailedOrder);
      setIsDetailsOpen(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast('Ошибка при загрузке деталей заказа');
      setIsDetailsOpen(false);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: ['detailingList', search, page, size],
    queryFn: () => fetchWashing(search, page, size),
  });

  const renderHeaderTable = () => (
    <TableHeader>
      <TableRow>
        {TableHeaderData.map(el => (
          <TableHead className={'px-5 py-8'} key={el.title}>
            <div className={'flex items-center gap-2 text-[#30B4E7]'}>
              {/* {el.checkbox && <Checkbox className={'group-hover:border-white'} />} */}
              {el.title} {el.isIcon && <ChevronsUpDown width={15} height={15} />}
            </div>
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );

  const statusTranslations: any = {
    pending: 'В ожидании',
    in_progress: 'В процессе',
    completed: 'Завершено',
    in_stock: 'В наличии',
  };

  const renderBodyTable = () => {
    if (!data || data.length === 0) {
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
        {data?.results?.map((el: any) => (
          <TableRow
            onClick={() => handleRowClick(el.id)}
            className='group cursor-pointer transition-colors duration-200 hover:bg-[#0A63F0]'
            key={el.id}
          >
            {/* <TableCell className={'px-5 py-5'}>
              <Checkbox className={'group-hover:border-white'} onClick={e => e.stopPropagation()} />
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
            <TableCell className={'px-5 py-5'}>{el.total_price} с</TableCell>
            <TableCell className={'px-5 py-5'}>{el.services_count}</TableCell>
            <TableCell className={'px-5 py-5'}>{el.staff_names}</TableCell>
            <TableCell className={'px-5 py-5'}>
              {el.created_at ? dayjs(el.created_at).format('DD.MM.YYYY  HH:mm') : '—'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    );
  };

  const totalPages = size > 0 ? Math.ceil(data?.count / size) : 0;

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
        <OrderDetailsDialog
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          orderData={selectedOrder}
        />
      )}
    </>
  );
};

export default DetailingInprogressTable;
