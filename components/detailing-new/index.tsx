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
import OrderDetailsDialog from '../order-details-dialog/index'; // Import the new component

// Define TypeScript interface for order data
interface OrderData {
  id: number;
  order_number: string;
  client_name: string;
  package_names: string[];
  service_names: string[];
  employee_first_name: string;
  employee_last_name: string;
  total_price: string;
  status: string;
  created_at: string;
}

const fetchWashing = async (search: string, page: string, size: string) => {
  const res = await $api.get('/master/order-groups/?status=pending', {
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

const DetailingNewTable = () => {
  const searchParams = useSearchParams();
  const queryClient: any = useQueryClient();
  const search: any = searchParams.get('search');
  const size: any = searchParams.get('size');
  const page: any = searchParams.get('page');

  // State for the details dialog
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const deleteWashing = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      await $api.delete(`/master/order-groups/${id}/`);
      await queryClient.invalidateQueries(['detailingList']);
      toast('Успешно удален');
    } catch (error) {
      toast('Ошибка при удалении');
      console.error('Delete error:', error);
    }
  };

  // FIX: Include page and size in the queryKey array to refetch when they change
  const { data, isLoading } = useQuery({
    queryKey: ['detailingList', search, page, size],
    queryFn: () => fetchWashing(search, page, size),
  });

  // Fetch detailed order data and open the dialog
  const handleRowClick = async (order: OrderData) => {
    try {
      setIsLoadingDetails(true);

      // Fetch detailed order data from the API
      const response = await $api.get(`/master/order-groups/${order.id}/`);
      const detailedOrder = response.data;

      console.log('Detailed order data:', detailedOrder);
      setSelectedOrder(detailedOrder);
      setIsDetailsOpen(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast('Ошибка при загрузке деталей заказа');

      // Fallback to the list data if detailed fetch fails
      setSelectedOrder(order);
      setIsDetailsOpen(true);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const renderHeaderTable = () => (
    <TableHeader>
      <TableRow>
        {TableHeaderData.map((el: any) => (
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

  const statusTranslations: { [key: string]: string } = {
    pending: 'В ожидании',
    in_progress: 'В процессе',
    completed: 'Завершено',
    in_stock: 'В наличии',
  };

  const renderBodyTable = () => (
    <TableBody>
      {data?.results?.map((el: any) => (
        <TableRow
          onClick={() => handleRowClick(el)}
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
          <TableCell className={'px-5 py-5'}>
            {el.services_count}
            {/* <ul>
              {Array.isArray(el?.package_names) &&
                el.package_names.map((pkg: string, i: number) => <li key={`pkg_${i}`}>{pkg}</li>)}
            </ul>
            <ul>
              {Array.isArray(el?.service_names) &&
                el.service_names.map((service: string, i: number) => (
                  <li key={`service_${i}`}>{service}</li>
                ))}
            </ul> */}
          </TableCell>
          <TableCell className={'px-5 py-5'}>{el.staff_names}</TableCell>
          <TableCell className={'px-5 py-5'}>
            {dayjs(el.created_at).format('DD.MM.YYYY  HH:mm')}
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

      {/* Order Details Dialog */}
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

export default DetailingNewTable;
