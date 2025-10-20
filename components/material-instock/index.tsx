import $api from '@/api/http';
import { useQuery } from '@tanstack/react-query';
import { ChevronsUpDown } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import EditWriteOff from '@/components/action-btns/editWriteOffBtn';
import { MaterialDrawer } from '@/components/action-btns/materialDrawer';
import WriteOff from '@/components/action-btns/writeOffBtn';
import MaterialUpdateForm from '@/components/ui/forms/MaterialUpdateForm';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import CoreTable from '@/components/ui/table/index';

const fetchMaterialsInstock = async (search: string, page: string, size: string) => {
  const res = await $api.get('/material/list/', {
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
    title: 'Название материала',
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
    title: 'Количество',
    isIcon: true,
  },
  {
    title: 'Ед. измерения',
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

const fetchMaterialCategories = async () => {
  const res = await $api.get('/material/categories/');
  return res.data;
};

const fetchMaterialUnits = async () => {
  const res = await $api.get('/material/units/');
  return res.data;
};

const MaterialInstock = () => {
  const searchParams = useSearchParams();

  const search: any = searchParams.get('search');
  const size: any = searchParams.get('size');
  const page: any = searchParams.get('page');

  const { data, isLoading } = useQuery({
    queryKey: ['materialsInstock', search, page, size],
    queryFn: () => fetchMaterialsInstock(search, page, size),
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['materialCategoriesList'],
    queryFn: fetchMaterialCategories,
  });

  const { data: units, isLoading: unitsLoading } = useQuery({
    queryKey: ['materialUnits'],
    queryFn: fetchMaterialUnits,
  });

  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const handleRowClick = (material: any) => {
    setSelectedMaterial(material);
  };

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

  const statusTranslations: { [key: string]: string } = {
    pending: 'В ожидании',
    in_progress: 'В процессе',
    completed: 'Завершено',
    in_stock: 'В наличии',
    replenished: 'Пополнить',
  };

  const renderBodyTable = () => (
    <TableBody>
      {data?.results.map((el: any) => (
        <TableRow
          onClick={() => handleRowClick(el)}
          className='group cursor-pointer transition-colors duration-200 hover:bg-[#0A63F0]'
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
              {statusTranslations[el.status] || 'Неизвестный статус'}
            </div>
          </TableCell>
          <TableCell className={'px-5 py-5'}>{el.stock_quantity}</TableCell>
          <TableCell className={'px-5 py-5'}>
            {' '}
            {units?.find((unit: any) => unit.id === el.unit)?.name || 'N/A'}
          </TableCell>
          <TableCell className={'px-5 py-5'}>{el.sell_price} сом</TableCell>
          <TableCell className={'flex gap-2 px-5 py-5'} onClick={e => e.stopPropagation()}>
            <WriteOff
              materialId={el.id}
              materialName={el.name}
              unit={units?.find((unit: any) => unit.id === el.unit)?.name || 'N/A'}
              currentStock={el.stock_quantity}
              category={
                categories?.find((category: any) => category.id === el.category)?.name || 'N/A'
              }
              price={`${el.sell_price} сом`}
            />
            <EditWriteOff
              materialId={el.id}
              materialName={el.name}
              unit={units?.find((unit: any) => unit.id === el.unit)?.name || 'N/A'}
              currentStock={el.stock_quantity}
              category={
                categories?.find((category: any) => category.id === el.category)?.name || 'N/A'
              }
              price={`${el.sell_price} сом`}
            />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
  const totalPages = size > 0 ? Math.ceil(data?.count / size) : 0;
  if (isLoading || categoriesLoading || unitsLoading) return <h1>Loading</h1>;
  return (
    <div className='relative'>
      <CoreTable
        totalPages={totalPages}
        tableHeader={renderHeaderTable()}
        tableBody={renderBodyTable()}
      />
      {selectedMaterial && <MaterialDrawer title={selectedMaterial.name} />}
      {selectedMaterial && (
        <MaterialUpdateForm
          materialId={selectedMaterial.id}
          initialData={selectedMaterial}
          onClose={() => setSelectedMaterial(null)}
        />
      )}
      {/* Кнопка с тремя точками удалена */}
    </div>
  );
};

export default MaterialInstock;
