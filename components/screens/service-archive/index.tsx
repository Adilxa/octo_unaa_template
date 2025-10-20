import $api from '@/api/http';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import { MaterialDrawer } from '@/components/action-btns/materialDrawer';
import { Button } from '@/components/ui/button';
import ServiceUpdateForm from '@/components/ui/forms/ServiceUpdateForm'; // Assuming you have or will create this form
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import CoreTable from '@/components/ui/table/index';

const fetchServices = async (search: string, page: string, size: string) => {
  const res = await $api.get('/services/list/?is_active=false', {
    params: {
      search: search,
      page: page,
      size: size,
    },
  });
  return res.data;
};

const serviceTableHeader = [
  {
    title: 'Название услуги',
    isIcon: false,
  },
  {
    title: 'Категория',
    isIcon: true,
  },
  {
    title: 'Статус',
    isIcon: true,
  },
  {
    title: 'Длительность',
    isIcon: true,
  },
  {
    title: 'Стоимость',
    isIcon: true,
  },
  {
    title: 'Действия',
    isIcon: false,
  },
];

const fetchServiceCategories = async () => {
  const res = await $api.get('/services/service-categories/');
  return res.data;
};

const ServiceArchive = () => {
  const searchParams = useSearchParams();
  const search: any = searchParams.get('search');
  const size: any = searchParams.get('size');
  const page: any = searchParams.get('page');

  const { data, isLoading } = useQuery({
    queryKey: ['servicesList', search, page, size],
    queryFn: () => fetchServices(search, page, size),
  });

  const { data: categories } = useQuery({
    queryKey: ['serviceCategories'],
    queryFn: fetchServiceCategories,
  });

  const [selectedService, setSelectedService] = useState<any>(null);

  const handleRowClick = (service: any) => {
    setSelectedService(service);
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
      {data.results?.map((el: any) => (
        <TableRow
          onClick={() => handleRowClick(el)}
          className='group transition-colors duration-200 hover:bg-[#0A63F0]'
          key={el.id}
        >
          <TableCell className={'px-5 py-5'}>{el.name}</TableCell>
          <TableCell className={'px-5 py-5'}>
            {categories?.find((category: any) => category.id === el.category)?.name || 'N/A'}
          </TableCell>
          <TableCell className={'px-5 py-5'}>
            <div
              className={
                'w-fit rounded-full bg-[#0A63F0] px-2 py-1 text-center font-semibold group-hover:bg-white group-hover:text-[#0A63F0]'
              }
            >
              {el.is_active ? 'Активно' : 'Неактивно'}
            </div>
          </TableCell>
          <TableCell className={'px-5 py-5'}>{el.duration} мин</TableCell>
          <TableCell className={'px-5 py-5'}>{el.price} сом</TableCell>
          <TableCell className={'px-5 py-5'} onClick={e => e.stopPropagation()}>
            <Button
              onClick={() => handleRowClick(el)}
              className={
                'rounded-[6px] bg-[#0A63F0] px-3 py-2 shadow-[0px_0px_24.7px_0px_rgba(10,99,240,0.5)] group-hover:bg-white group-hover:text-[#0A63F0]'
              }
            >
              Изменить
            </Button>
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
      {selectedService && (
        <ServiceUpdateForm
          serviceId={selectedService.id}
          initialData={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}
    </>
  );
};

export default ServiceArchive;
