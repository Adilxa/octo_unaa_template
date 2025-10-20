import $api from '@/api/http';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import dayjs from 'dayjs';
import { ChevronsUpDown, EllipsisVertical } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import ClientsDialog from '@/components/clients-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import CoreTable from '@/components/ui/table/index';

const serviceTableHeader = [
  {
    title: 'ID',
    isIcon: false,
  },
  {
    title: 'ФИО',
    isIcon: true,
  },
  {
    title: 'Номер Телефона',
    isIcon: true,
  },
  {
    title: 'Номер  авто',
    isIcon: true,
  },
  {
    title: 'Бред',
    isIcon: true,
  },
  {
    title: 'Модель',
    isIcon: true,
  },
  {
    title: '',
    isIcon: false,
  },
];

const clientBlock = async (clientId: number) => {
  try {
    const res = await $api.post('clients/block/', {
      is_blocked: false,
      client_id: clientId,
    });
    return res.data;
  } catch (e: any) {
    return e.response.data;
  }
};

const fetchClients = async (page: any, search: any, size: any) => {
  try {
    const res = await $api.get('clients/blocked/', {
      params: {
        page,
        search,
        size,
      },
    });
    return res.data;
  } catch (e: any) {
    return e.response.data;
  }
};

const BlockedClientsTable = () => {
  const searchParams = useSearchParams();
  const queryClient: any = useQueryClient();
  const search: any = searchParams.get('search');
  const size: any = searchParams.get('size');
  const page: any = searchParams.get('page');

  const [actualClient, setActualClient] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['BlockedClientsTable', search, size, page],
    queryFn: () => fetchClients(page, search, size),
  });

  const mutation = useMutation({
    mutationFn: (client_id: number) => clientBlock(client_id),
    onSuccess: () => {
      queryClient.invalidateQueries(['BlockedClientsTable']);
    },
  });

  const totalPages = size > 0 ? Math.ceil(data?.count / size) : 0;

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

  const renderBodyTable = () => {
    return (
      <TableBody>
        {data?.blocked_clients?.map((el: any) => (
          <TableRow onClick={() => setActualClient(el.id)} key={el.id}>
            <TableCell className={'px-5 py-5'}>{el.id}</TableCell>
            <TableCell className={'px-5 py-5'}>
              {el?.first_name} {el?.last_name}
            </TableCell>
            <TableCell className={'px-5 py-5'}>{el?.phone}</TableCell>
            <TableCell className={'px-5 py-5'}>{el?.car?.license_plate}</TableCell>
            <TableCell className={'px-5 py-5'}>{el?.car?.brand.name}</TableCell>
            <TableCell className={'px-5 py-5'}>{el?.car?.model.name}</TableCell>
            <TableCell className={'px-5 py-5'}>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <EllipsisVertical width={20} height={20} />
                </DropdownMenuTrigger>
                <DropdownMenuContent className={'bg-[#171928]'}>
                  <DropdownMenuItem
                    onClick={(e: any) => {
                      e.stopPropagation();
                      mutation.mutate(el.id);
                    }}
                  >
                    Разблокировать
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    );
  };

  if (isLoading) return <h1> loading</h1>;
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

export default BlockedClientsTable;
