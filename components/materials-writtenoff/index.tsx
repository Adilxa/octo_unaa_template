import $api from '@/api/http';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { ChevronsUpDown } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import React from 'react';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import CoreTable from '@/components/ui/table/index';

const fetchMaterialsWrittenoff = async (search: string, page: string, size: string) => {
  const res = await $api.get('/material/written-off-materials/', {
    params: {
      search: search,
      page: page,
      size: size,
    },
  });
  return res.data;
};

const materialTableHeader = [
  {
    title: 'Материала',
    isIcon: false,
  },
  {
    title: 'Количество',
    isIcon: true,
  },
  {
    title: 'Стоимость',
    isIcon: true,
  },
  {
    title: 'Дата',
    isIcon: true,
  },
];

const MaterialsWrittenOff = () => {
  const searchParams = useSearchParams();

  const search: any = searchParams.get('search');
  const size: any = searchParams.get('size');
  const page: any = searchParams.get('page');

  const { data, isLoading } = useQuery({
    queryKey: ['materialsWrittenoff', search, page, size],
    queryFn: () => fetchMaterialsWrittenoff(search, page, size),
  });

  const renderHeaderTable = () => (
    <TableHeader>
      <TableRow>
        {materialTableHeader.map((el: any) => (
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
        <TableRow className='group transition-colors duration-200 hover:bg-[#0A63F0]' key={el.id}>
          <TableCell className={'px-5 py-5'}>{el.material_name}</TableCell>
          <TableCell className={'px-5 py-5'}>{el.stock_quantity}</TableCell>

          <TableCell className={'px-5 py-5'}>{el.unit_price} сом</TableCell>
          <TableCell className={'px-5 py-5'}>{dayjs(el.created_at).format('DD.MM.YYYY')}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  );

  const totalPages = size > 0 ? Math.ceil(data?.count / size) : 0;
  console.log(data);

  if (isLoading) return <h1>Loading</h1>;
  return (
    <CoreTable
      totalPages={totalPages}
      tableHeader={renderHeaderTable()}
      tableBody={renderBodyTable()}
    />
  );
};

export default MaterialsWrittenOff;
