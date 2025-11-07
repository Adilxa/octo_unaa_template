import $api from '@/api/http';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, ChevronsUpDown, EllipsisVertical, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import FormInput from '@/components/ui/form-input';
import PackagesCategoriesInput from '@/components/ui/form-input/PackagesCategoriesInput';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Props {
  id: number;
}

const fetchPackage = async (id: number) => {
  const res = await $api.get(`/packages/${id}/`);
  return res.data;
};

const fetchServiceList = async () => {
  const res = await $api.get('/services/list/', {
    params: {
      size: 1000,
    },
  });
  return res.data;
};

const fetchMaterialList = async () => {
  const res = await $api.get('/material/list/');
  return res.data;
};

const EditPackageBtn: React.FC<Props> = ({ id }) => {
  const queryClient: any = useQueryClient();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || '';
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [pickedData, setPickedData] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const { data: packageData, isLoading: packageLoading } = useQuery({
    queryKey: ['uniqePackage', id],
    queryFn: () => fetchPackage(id),
    enabled: isOpen,
  });

  const { data: serviceList, isLoading: serviceLoading } = useQuery({
    queryKey: ['serviceList'],
    queryFn: () => fetchServiceList(),
    enabled: isOpen,
  });

  const { data: materialList, isLoading: materialLoading } = useQuery({
    queryKey: ['materialList'],
    queryFn: () => fetchMaterialList(),
    enabled: isOpen,
  });

  // Populate form with existing package data when it loads
  useEffect(() => {
    if (packageData && !packageLoading) {
      console.log(packageData);
      setTitle(packageData.name || '');
      setCategory(packageData.category_id || '');
      setDescription(packageData.description || '');

      // Initialize pickedData with services and materials
      const initialPickedData: any[] = [];

      // Add services
      if (packageData.services && Array.isArray(packageData.services)) {
        packageData.services.forEach((serviceItem: any) => {
          const service = serviceList?.results.find((s: any) => s.id === serviceItem.service);
          if (service) {
            for (let i = 0; i < (serviceItem.quantity || 1); i++) {
              initialPickedData.push({ ...service, type: 'services' });
            }
          }
        });
      }

      // Add materials directly from package_materials
      if (packageData.package_materials && Array.isArray(packageData.package_materials)) {
        packageData.package_materials.forEach((materialItem: any) => {
          const matchedMaterial = materialList?.results.find(
            (m: any) => m.id === materialItem.material,
          );

          const material = {
            id: materialItem.material,
            name: materialItem.material_name,
            quantity: materialItem.quantity,
            unit: materialItem.unit,
            sell_price: matchedMaterial?.sell_price || null,
            type: 'materials', // Добавляем поле type для материалов
          };

          const quantity = materialItem.quantity ? parseFloat(materialItem.quantity) : 1;

          initialPickedData.push({
            ...material,
            packageQuantity: quantity,
          });
        });
      }

      setPickedData(initialPickedData);
      console.log(initialPickedData);
    }
  }, [packageData, packageLoading, serviceList, materialList]);

  const onSetService = (service: any) => {
    setPickedData((prev: any) => {
      // Проверяем наличие сервиса с таким же id и type
      const serviceExists = prev.some(
        (item: any) => item.id === service.id && item.type === 'service',
      );

      if (serviceExists) {
        toast('Этот сервис уже добавлен');
        return prev;
      }

      // Добавляем новый сервис
      return [...prev, { ...service, type: 'services' }];
    });
  };

  const onSetMaterial = (material: any) => {
    setPickedData((prev: any) => {
      // Проверяем наличие MATERIAL с таким же id
      if (prev.some((item: any) => item.id === material.id && item.type === 'material')) {
        toast('Этот материал уже добавлен');
        return prev;
      }
      return [...prev, { ...material, type: 'material', quantity: 1 }];
    });
  };

  const pickedItemsSum = (item: any, pricePerUnit: any) => {
    // Проверяем, что у элемента есть quantity
    const quantity = parseFloat(item.quantity) || 1;

    // Проверяем, что цена есть и она число
    const price = parseFloat(pricePerUnit) || 0;

    // Выполняем расчет без округления, сохраняя числовой тип
    const total = quantity * price;

    return total;
  };

  const calculateTotalSum = (): number => {
    return pickedData.reduce((total, item) => {
      const price = item.price ? parseFloat(item.price) : 0;
      const quantity = item.quantity ? parseFloat(item.quantity) : 1; // Если quantity нет, устанавливаем 1
      const materialCost = item.sell_price ? parseFloat(item.sell_price) * quantity : 0;

      return total + price + materialCost;
    }, 0);
  };

  const preparePackageData = () => {
    const services: any[] = [];
    const materials: any[] = [];

    console.log(pickedData);

    pickedData.forEach((el: any) => {
      // Исправляем проверку на 'service' и 'material'
      if (el.type === 'services') {
        services.push(el.id);
      } else if (el.type === 'material') {
        materials.push({
          material: el.id,
          quantity: el.quantity || 1, // Если quantity нет, устанавливаем 1
        });
      }
    });

    return {
      name: title,
      description: description,
      services,
      price: calculateTotalSum().toString(),
      materials,
    };
  };

  const handleArchive = async () => {
    try {
      const response = await $api.patch(`/packages/${id}/`, {
        is_active: tab == 'archiv' ? true : false,
      });
      console.log('Успешно обновлено:', response.data);
      toast(tab == 'archiv' ? 'Успешно разархивировано' : 'Успешно архивировано');
      setIsOpen(false);
    } catch (error) {
      toast('Ошибка при обновлении пакета');
      console.error(error);
    }
  };

  const updateItemQuantity = (
    id: number,
    value: string | number,
    type: 'services' | 'materials',
  ) => {
    // Если тип 'services', игнорируем обновление количества
    if (type === 'services') {
      return;
    }

    // Оставляем только цифры и точку
    const inputValue = String(value)
      .replace(',', '.')
      .replace(/[^0-9.]/g, '');

    // Функция обработки значения
    const processValue = () => {
      if (/^\d*\.?\d*$/.test(inputValue)) {
        const parts = inputValue.split('.');
        return parts.length > 2
          ? `${parts[0]}.${parts.slice(1).join('')}` // Убираем лишнюю точку
          : inputValue;
      }
      return '1'; // Если введено некорректное значение, ставим 1
    };

    const processedValue = processValue();

    setPickedData((prevData: any) =>
      prevData.map((item: any) =>
        item.id === id && item.type === 'material' // Проверяем и на тип
          ? { ...item, quantity: parseFloat(processedValue) || 1 } // Приводим к числу
          : item,
      ),
    );
  };

  const handleUpdatePackage = async () => {
    try {
      const packageData = preparePackageData();
      console.log(packageData);
      const response = await $api.patch(`/packages/${id}/`, packageData);
      queryClient.invalidateQueries(['packagesInfo']);
      queryClient.invalidateQueries(['uniqePackage', id]);
      toast('Пакет успешно обновлен');
      setIsOpen(false);
    } catch (error) {
      toast('Ошибка при обновлении пакета');
      console.error(error);
    }
  };

  const removeItem = (id: number, type: string) => {
    setPickedData((prevData: any) =>
      prevData.filter(
        (item: any) =>
          // Удаляем по совпадению и id, и индекса, и типа
          !(item.id === id && item.type === type),
      ),
    );

    toast('Элемент удалён');
  };

  const handleDialogOpen = () => {
    setIsOpen(true);
  };

  const handleDialogClose = () => {
    setIsOpen(false);
  };

  console.log(pickedData);

  if (packageLoading) return <p>Loading...</p>;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className={'rounded-[6px] bg-[#131520] px-2 py-2'} onClick={handleDialogOpen}>
        <EllipsisVertical width={20} height={20} />
      </DialogTrigger>
      <DialogContent className={'w-full max-w-[700px] rounded-xl bg-[#131520] px-10 py-10'}>
        <DialogHeader className={'border-b-[1px] border-[#1D3253] pb-5'}>
          <div className={'mb-2 flex items-center justify-between gap-20'}>
            <h1 className={'text-[18px] font-bold'}>Редактировать пакет</h1>
            <div className={'flex items-center gap-5'}>
              <Button onClick={handleUpdatePackage} className={'rounded-[4px] bg-[#171928]'}>
                <Check /> Сохранить
              </Button>
              <Button onClick={handleArchive} className={'rounded-[4px] bg-[#171928]'}>
                <X /> {tab == 'archiv' ? 'Разархивировать' : 'Архивировать'}
              </Button>
            </div>
          </div>
          <p className={'text-[12px] font-medium text-[#1D3253]'}>
            После изменения информации <br /> обязательно нажмите кнопку сохранить
          </p>
        </DialogHeader>
        <div className={'flex flex-col gap-5'}>
          <FormInput
            title={'Название *'}
            placeholder={'Введите название '}
            value={title}
            onChange={setTitle}
          />
          <FormInput
            title={'Описание'}
            placeholder={'Опциональное поле'}
            value={description}
            onChange={setDescription}
            isTextArea={true}
          />
        </div>
        <div className={'flex w-full items-center justify-center'}>
          <Drawer>
            <DrawerTrigger asChild>
              <Button className={'w-fit rounded-xl bg-[#0A63F0] px-4 py-2'}>
                + Услуги, материалы
              </Button>
            </DrawerTrigger>
            <DrawerContent className={'bg-[#131524]'}>
              <div
                className={
                  'mb-[10vh] mt-5 flex flex-col items-center justify-center gap-10 bg-[#131524]'
                }
              >
                <Tabs defaultValue='service' className={'w-[500px]'}>
                  <TabsList className='flex rounded-xl bg-[#191C27] px-4 py-12'>
                    <TabsTrigger
                      value='service'
                      className='flex-1 rounded-lg py-2 text-[16px] font-semibold text-white transition-all data-[state=active]:rounded-xl data-[state=active]:bg-[#0A63F0] data-[state=active]:text-white data-[state=inactive]:text-[#A0A0A0] data-[state=active]:shadow-[0px_0px_24.7px_0px_rgba(10,99,240,0.5)]'
                    >
                      <h1 className={'text-[35px] font-bold'}>Услуги</h1>
                    </TabsTrigger>
                    <TabsTrigger
                      value='material'
                      className='flex-1 rounded-lg py-2 text-[16px] font-semibold text-white transition-all data-[state=active]:rounded-xl data-[state=active]:bg-[#0A63F0] data-[state=active]:text-white data-[state=inactive]:text-[#A0A0A0] data-[state=active]:shadow-[0px_0px_24.7px_0px_rgba(10,99,240,0.5)]'
                    >
                      <h1 className={'text-[35px] font-bold'}>Материалы</h1>
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value='service'>
                    <ScrollArea className='h-[300px] w-full'>
                      <Table className='w-full'>
                        <TableHeader>
                          <TableRow>
                            <TableHead className='flex items-center gap-2 font-light text-[#30B4E7]'>
                              Наименование
                              <ChevronsUpDown width={15} height={15} />
                            </TableHead>
                            <TableHead className='text-right font-light text-[#30B4E7]'>
                              Цена
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {serviceList?.results?.map((el: any) => (
                            <TableRow
                              onClick={() => onSetService(el)}
                              className={'cursor-pointer'}
                              key={el.id}
                            >
                              <TableCell className='flex-1 py-3'>{el.name}</TableCell>
                              <TableCell className='text-right'>{el.price} с</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value='material'>
                    <ScrollArea className='h-[300px] w-full'>
                      <Table className='w-full'>
                        <TableHeader>
                          <TableRow>
                            <TableHead className='flex items-center gap-2 font-light text-[#30B4E7]'>
                              Наименование
                              <ChevronsUpDown width={15} height={15} />
                            </TableHead>
                            <TableHead className='text-right font-light text-[#30B4E7]'>
                              Цена
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {materialList?.results.map((el: any) => (
                            <TableRow
                              onClick={() => onSetMaterial(el)}
                              className={'cursor-pointer'}
                              key={el.id}
                            >
                              <TableCell className='flex-1 py-3'>{el.name}</TableCell>
                              <TableCell className='text-right'>{el.sell_price} с</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
        <ScrollArea className='h-[250px] w-full'>
          <Table className='w-full'>
            <TableHeader>
              <TableRow>
                <TableHead className='flex items-center gap-2 font-light text-[#30B4E7]'>
                  Наименование
                  <ChevronsUpDown width={15} height={15} />
                </TableHead>
                <TableHead className='text-right font-light text-[#30B4E7]'>Цена</TableHead>
                <TableHead className='text-right font-light text-[#30B4E7]'>Кол-во</TableHead>
                <TableHead className='text-right font-light text-[#30B4E7]'>Сумма</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pickedData?.map((el: any, index: any) => (
                <TableRow className='cursor-pointer' key={`${el.id}_${el.type}`}>
                  <TableCell className='flex-1 py-3 text-white'>{el.name}</TableCell>
                  <TableCell className='text-right'>{el.price || el.sell_price} с</TableCell>
                  <TableCell className='text-right'>
                    {/* {pickedData.filter((elem: any) => elem.id === el.id).length} */}
                    {el.type === 'services' ? (
                      1
                    ) : (
                      <input
                        type='text'
                        value={el.quantity}
                        onChange={e => updateItemQuantity(el.id, e.target.value, el.type)}
                        className='w-16 rounded border border-gray-500 bg-transparent text-center'
                      />
                    )}
                  </TableCell>
                  <TableCell className='text-right'>
                    {pickedItemsSum(el, el.price || el.sell_price)} с
                  </TableCell>
                  <TableCell className='flex items-center justify-center'>
                    <img
                      className='ml-4 cursor-pointer'
                      src='/images/close-square.svg'
                      alt='close'
                      onClick={() => removeItem(el.id, el.type)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
        <div className={'flex flex-col gap-5'}>
          <div className={'flex justify-end'}>
            <div className={'w-fit rounded-[6px] bg-[#0B0C1A] p-2'}>
              Итого {calculateTotalSum()} c
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditPackageBtn;
