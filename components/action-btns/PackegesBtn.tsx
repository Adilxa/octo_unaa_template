import $api from '@/api/http';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import Container from '@/components/ui/container';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/shadcn/select';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NewPackageCategory from './newPackageCategory';

const fetchServiceList = async () => {
  const res = await $api.get('/services/list/?is_active=true', {
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

const PackegesBtn = () => {
  const queryClient: any = useQueryClient();
  const [title, setTitle] = React.useState<string>('');
  const [category, setCategory] = useState('');
  const [kuzov, setKuzov] = useState('');
  const [description, setDescription] = React.useState('');
  const [open, setOpen] = useState(false);

  const [pickedData, setPickedData] = React.useState<any>({
    services: [],
    materials: [],
  });

  const { data: serviceList, isLoading: serviceLoading } = useQuery({
    queryKey: ['serviceList'],
    queryFn: () => fetchServiceList(),
  });
  console.log(serviceList);

  const { data: materialList, isLoading: materialLoading } = useQuery({
    queryKey: ['materialList'],
    queryFn: () => fetchMaterialList(),
  });

  const fetchCategories = async () => {
    const res = await $api.get('/packages/package-categories/');
    return res.data;
  };

  const fetchKuzov = async () => {
    const res = await $api.get('/shared/car-body-types/');
    return res.data;
  };

  const onSetService = (service: any) => {
    setPickedData((prev: any) => {
      // Initialize services array if it doesn't exist
      const prevServices = prev?.services || [];

      // Проверяем, существует ли уже сервис с таким ID
      const serviceExists = prevServices.some((item: any) => item.id === service.id);

      if (serviceExists) {
        toast('Этот сервис уже добавлен');
        return prev; // Возвращаем предыдущее состояние без изменений
      }
      toast('Успешно добавлено');
      // Добавляем новый сервис, если его еще нет
      return {
        ...prev,
        services: [...prevServices, { ...service, type: 'services' }],
      };
    });
  };

  const onSetMaterial = (material: any) => {
    setPickedData((prev: any) => {
      // Проверяем, существует ли уже материал с таким ID
      const materialExists = prev?.materials.some((item: any) => item.id === material.id);

      if (materialExists) {
        toast('Этот материал уже добавлен');
        return prev; // Возвращаем предыдущее состояние без изменений
      }

      // Добавляем новый материал, если его еще нет
      const result = {
        ...prev,
        materials: [...prev.materials, { ...material, type: 'materials', quantity: 1 }],
      };

      toast('Успешно добавлено');
      return result;
    });
  };

  const [selectedOption, setSelectedOption] = useState('washing');

  const pickedItemsSum = (item: any, pricePerUnit: any) => {
    // Проверяем, что у элемента есть quantity
    const quantity = parseFloat(item.quantity) || 1;

    // Проверяем, что цена есть и она число
    const price = parseFloat(pricePerUnit) || 0;

    // Выполняем расчет и округляем до 2 десятичных знаков
    const total = (quantity * price).toFixed(2);

    return total;
  };

  const removeItemById = (id: number, type: 'services' | 'materials') => {
    console.log('Removing item:', id, 'of type:', type); // Добавим лог для отладки

    setPickedData((prevData: any) => {
      // Проверяем, существует ли элемент в указанном массиве перед удалением
      const itemExists = prevData[type]?.some((item: any) => item.id === id);

      if (!itemExists) {
        console.warn(`Элемент с id ${id} не найден в ${type}`);
        return prevData;
      }

      return {
        ...prevData,
        [type]: prevData[type]?.filter((item: any) => item.id !== id) || [],
      };
    });

    toast('Элемент удалён');
  };

  const calculateTotalSum = () => {
    let total = 0;

    // Суммируем все сервисы
    pickedData?.services?.forEach((service: any) => {
      const price = parseFloat(service.price) || 0;
      const quantity = parseFloat(service.quantity) || 1;
      total += price * quantity;
    });

    // Суммируем все материалы
    pickedData?.materials?.forEach((material: any) => {
      const price = parseFloat(material.sell_price) || 0;
      const quantity = parseFloat(material.quantity) || 1;

      // Используем точное умножение без предварительного округления
      total += Number((price * quantity).toFixed(2));
    });

    // Возвращаем число с двумя знаками после запятой
    return Number(total.toFixed(2));
  };

  const preparePackageData = () => {
    const servicesIds: any = [];
    const materialsWithQuantity: any = [];

    // Обрабатываем массив с услугами
    pickedData?.services.forEach((el: any) => {
      const quantity = el.quantity ?? 1; // Если quantity не задано, используем 1 по умолчанию

      if (el.price !== undefined) {
        servicesIds.push(el.id); // Добавляем id услуги в массив servicesIds
      }
    });

    // Обрабатываем массив с материалами
    pickedData.materials.forEach((el: any) => {
      const quantity = el.quantity ?? 1; // Если quantity не задано, используем 1 по умолчанию

      if (el.sell_price !== undefined) {
        materialsWithQuantity.push({
          material: el.id,
          quantity: quantity, // Сохраняем количество для материала
        });
      }
    });

    return {
      name: title,
      description: description,
      services: servicesIds, // Список услуг
      category_id: category,
      price: calculateTotalSum().toString(), // Можно раскомментировать, если нужно добавить цену
      materials: materialsWithQuantity, // Список материалов с количеством
      body_type: kuzov,
      package_type: selectedOption,
    };
  };

  const handleCreatePackage = async () => {
    try {
      const packageData = preparePackageData();
      console.log(packageData);
      await $api.post('/packages/create/', packageData).then(data => {
        toast('Пакет успешно создан');
        setOpen(false);
      });
      queryClient.invalidateQueries(['packageList']);
      setTitle('');
      setCategory('');
      setDescription('');
      setPickedData([]);
    } catch (error) {
      toast('Ошибка при создании пакета');
      console.error(error);
      const packageData = preparePackageData();

      console.log(packageData);
    }
  };

  const updateItemQuantity = (
    id: number,
    value: string | number,
    arrayType: 'services' | 'materials',
  ) => {
    // Если тип 'services', всегда возвращаем 1
    if (arrayType === 'services') {
      return;
    }

    // Оставляем только цифры и точку
    const inputValue = String(value)
      .replace(',', '.')
      .replace(/[^0-9.]/g, '');

    setPickedData((prevData: any) => {
      // Создаем глубокую копию предыдущего состояния
      const newData = {
        ...prevData,
        services: [...prevData.services],
        materials: [...prevData.materials],
      };

      // Проверяем, является ли значение корректным
      const processValue = () => {
        // Разрешаем только цифры и одну точку
        if (/^\d*\.?\d*$/.test(inputValue)) {
          // Убираем лишние точки, оставляем только первую
          const parts = inputValue.split('.');
          return parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : inputValue;
        }

        // Если введено некорректное значение, возвращаем текущее
        return inputValue;
      };

      const processedValue = processValue();

      // Находим индекс элемента в выбранном массиве
      const targetIndex = newData[arrayType].findIndex((item: any) => item.id === id);

      if (targetIndex !== -1) {
        // Создаем новый объект с обновленным quantity
        newData[arrayType][targetIndex] = {
          ...newData[arrayType][targetIndex],
          quantity: processedValue,
        };
      }

      return newData;
    });
  };
  console.log(pickedData);
  console.log(materialList);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={
          'rounded-[6px] bg-[#0A63F0] px-3 py-2 shadow-[0px_0px_24.7px_0px_rgba(10,99,240,0.5)]'
        }
      >
        + Добавить пакет
      </DialogTrigger>
      <DialogContent className='scrollable max-h-[90vh] w-full max-w-[700px] overflow-y-auto rounded-xl bg-[#131520] px-10 py-10'>
        <DialogHeader className={'border-b-[1px] border-[#1D3253] pb-5'}>
          <div className={'mb-2 flex items-center justify-between gap-20'}>
            <h1 className={'text-[18px] font-bold'}>Новый пакет</h1>
          </div>
          <p className={'text-[12px] font-medium text-[#1D3253]'}>
            После добавления информации <br /> обязательно нажмите кнопку сохранить
          </p>
        </DialogHeader>
        <div className={'flex flex-col gap-5'}>
          <FormInput
            title={'Название *'}
            placeholder={'Введите название '}
            value={title}
            onChange={setTitle}
          />
          <PackagesCategoriesInput
            fetchData={fetchCategories}
            fetchPath={'packagesCategoriesList'}
            title={'Категория *'}
            placeholder={'Выберите категорию'}
            value={category}
            onChange={setCategory}
          />

          <PackagesCategoriesInput
            fetchData={fetchKuzov}
            fetchPath={'packagesKuzovList'}
            title={'Кузов *'}
            placeholder={'Выберите кузов'}
            value={kuzov}
            onChange={setKuzov}
          />
          <div className='grid grid-cols-[120px_1fr] items-center gap-4'>
            <h1 className='w-[120px] text-[14px] font-semibold text-white'>Выберите тип</h1>
            <Select onValueChange={setSelectedOption} defaultValue={selectedOption}>
              <SelectTrigger className={'w-full rounded-[6px] border-[1px] border-[#1D3253] py-5'}>
                <SelectValue placeholder={'Выберите тип'} />
                <SelectContent className={'bg-[#131520]'}>
                  <SelectItem
                    value='washing'
                    className='w-full text-sm text-white hover:bg-[#2A2E39]'
                  >
                    Мойка
                  </SelectItem>
                  <SelectItem value='detailing' className='text-sm text-white hover:bg-[#2A2E39]'>
                    Детейлинг
                  </SelectItem>
                </SelectContent>
              </SelectTrigger>
            </Select>
          </div>
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
        <ScrollArea className='h-[250px] w-full rounded-tl-[14px] rounded-tr-[14px]'>
          <Table className='w-full'>
            <TableHeader className='bg-[#0B0C1A]'>
              <TableRow>
                <TableHead className='flex items-center gap-2 font-light text-[#30B4E7]'>
                  Наименование
                  <ChevronsUpDown width={15} height={15} />
                </TableHead>
                <TableHead className='text-right font-light text-[#30B4E7]'>Цена</TableHead>
                <TableHead className='text-right font-light text-[#30B4E7]'>Кол-во</TableHead>
                <TableHead className='text-right font-light text-[#30B4E7]'>Сумма</TableHead>
                <TableHead className='text-right font-light text-[#30B4E7]'>Удалить</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...(pickedData?.services || []), ...(pickedData?.materials || [])].map(
                (el: any) => (
                  <TableRow className='cursor-pointer' key={`${el.id}_${el.type}`}>
                    <TableCell className='flex-1 py-3 text-white'>{el.name}</TableCell>

                    <TableCell className='text-right'>{el.price || el.sell_price} с</TableCell>
                    <TableCell className='text-right'>
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
                        onClick={() => {
                          const itemType =
                            el.type ||
                            (pickedData.services.some((s: any) => s.id === el.id)
                              ? 'services'
                              : 'materials');
                          removeItemById(el.id, itemType);
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        </ScrollArea>
        <div className={'flex flex-col gap-5'}>
          <div className={'flex justify-end'}>
            <div className={'w-fit rounded-[6px] bg-[#0B0C1A] p-2'}>
              Итого {calculateTotalSum()} c
            </div>
          </div>
          <Button onClick={() => handleCreatePackage()} className={'w-fit rounded-[6px] px-8'}>
            Создать
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PackegesBtn;
