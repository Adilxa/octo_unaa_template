'use client';

import $api from '@/api/http';
import { useQuery } from '@tanstack/react-query';
import { Minus, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Все типы заменены на any для предотвращения ошибок
interface MaterialsTabProps {
  miniOrders: any[];
  onAddMaterial: (miniOrderIndex: any, material: any) => void;
  onRemoveMaterial: (miniOrderIndex: any, materialId: any) => void;
  materials: any[];
}

// Функция получения материалов с бэкенда
const fetchMaterials = async (categoryId?: string): Promise<any> => {
  let res;

  // Если выбрана конкретная категория, используем специальный маршрут для получения материалов по категории
  if (categoryId && categoryId !== 'all') {
    res = await $api.get(`/material/material-categories/${categoryId}/materials/`);
  } else {
    // Если выбраны все категории, используем стандартный маршрут
    res = await $api.get('/material/list/');
  }

  return res.data;
};

// Функция получения категорий материалов
const fetchCategories = async (): Promise<any> => {
  const res = await $api.get('/material/categories/');
  return res.data;
};

const MaterialsTab: React.FC<MaterialsTabProps> = ({
  miniOrders,
  onAddMaterial,
  onRemoveMaterial,
  materials,
}) => {
  const [selectedMaterials, setSelectedMaterials] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<any>('all');
  const [quantityMap, setQuantityMap] = useState<any>({});
  const [selectedMiniOrder, setSelectedMiniOrder] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Локальное состояние для хранения отображаемых количеств
  const [displayQuantities, setDisplayQuantities] = useState<Record<string, string>>({});

  // Инициализируем displayQuantities при изменении materials
  useEffect(() => {
    const newQuantities: Record<string, string> = {};
    materials.forEach((material, index) => {
      newQuantities[`${material.material}-${index}`] = material.quantity || '1';
    });
    setDisplayQuantities(newQuantities);
  }, [materials]);

  // Запрос на получение категорий материалов
  const { data: categoriesData = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categoriesList'],
    queryFn: fetchCategories,
    enabled: dialogOpen, // Загружаем только когда диалог открыт
  });

  // Запрос на получение материалов с фильтрацией по категории
  const { data: availableMaterials = { results: [] }, isLoading } = useQuery({
    queryKey: ['materialsList', activeCategory],
    queryFn: () => fetchMaterials(activeCategory),
    enabled: dialogOpen, // Загружаем только когда диалог открыт
  });

  // Дополнительно отслеживаем изменения в miniOrders и обновляем selectedMiniOrder
  useEffect(() => {
    // Если есть miniOrders и нет выбранного, выбираем первый
    if (miniOrders?.length > 0 && selectedMiniOrder === null) {
      setSelectedMiniOrder(0); // Выбираем первый по умолчанию
    } else if (!miniOrders?.length) {
      setSelectedMiniOrder(null); // Сбрасываем, если нет miniOrders
    }
  }, [miniOrders, selectedMiniOrder]);

  // Функция валидации ввода для чисел, начинающихся с 0
  const validateZeroInput = (value: string): string => {
    // Если введена пустая строка, разрешаем ее (чтобы можно было стереть 0)
    if (value === '') return value;

    // Если введено только "0", возвращаем его как есть
    if (value === '0') return value;

    // Если первый символ "0" и второй - цифра (не точка), вставляем точку между ними
    if (value.length > 1 && value[0] === '0' && value[1] !== '.' && /\d/.test(value[1])) {
      return `0.${value.substring(1)}`;
    }

    return value;
  };

  // Обновленная функция для изменения количества вручную (для Drawer)
  const handleQuantityChange = (materialId: string, value: string) => {
    // Разрешаем пустую строку (чтобы можно было стереть 0) и проверяем базовую валидацию
    if (value === '' || /^(\d*\.?\d*)?$/.test(value)) {
      // Применяем дополнительную валидацию для чисел, начинающихся с 0
      const validatedValue = validateZeroInput(value);

      setQuantityMap((prev: any) => ({
        ...prev,
        [materialId]: validatedValue,
      }));
    }
  };

  // Исправленная функция для увеличения количества в диалоге
  const incrementDialogQuantity = (materialId: string) => {
    setQuantityMap((prev: any) => {
      // Получаем текущее значение из предыдущего состояния
      const currentValue = prev[materialId] || '1';
      // Преобразуем в число с плавающей точкой (или 0, если пусто)
      const numValue = currentValue === '' ? 0 : parseFloat(currentValue);
      return {
        ...prev,
        [materialId]: (numValue + 1).toString(),
      };
    });
  };

  // Исправленная функция для уменьшения количества в диалоге
  const decrementDialogQuantity = (materialId: string) => {
    setQuantityMap((prev: any) => {
      // Получаем текущее значение из предыдущего состояния
      const currentValue = prev[materialId] || '1';
      // Преобразуем в число с плавающей точкой (или 0, если пусто)
      const numValue = currentValue === '' ? 0 : parseFloat(currentValue);

      // Уменьшаем, но не позволяем опуститься ниже 0
      if (numValue > 0) {
        return {
          ...prev,
          [materialId]: Math.max(0, numValue - 1).toString(),
        };
      }
      return prev;
    });
  };

  // Функция выбора материала
  const handleMaterialSelection = (materialId: string) => {
    setSelectedMaterials(prev => {
      // Проверяем, выбран ли уже этот материал
      if (prev.includes(materialId)) {
        // Если выбран, удаляем его из списка выбранных
        return prev.filter(id => id !== materialId);
      } else {
        // Если не выбран, добавляем в список выбранных
        return [...prev, materialId];
      }
    });

    // Устанавливаем начальное значение 1, только если материал еще не имеет количества
    setQuantityMap((prev: any) => {
      if (!prev[materialId]) {
        return {
          ...prev,
          [materialId]: '1',
        };
      }
      return prev; // Если у материала уже есть количество, не меняем его
    });
  };

  // Обработчик для изменения категории
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    // Сбрасываем выбранные материалы при смене категории
    setSelectedMaterials([]);
    setQuantityMap({});
  };

  // Обновленный обработчик для изменения отображаемого количества (для основного списка)
  const handleDisplayQuantityChange = (key: string, value: string) => {
    // Разрешаем пустую строку (чтобы можно было стереть 0) и проверяем базовую валидацию
    if (value === '' || /^(\d*\.?\d*)?$/.test(value)) {
      // Применяем дополнительную валидацию для чисел, начинающихся с 0
      const validatedValue = validateZeroInput(value);

      setDisplayQuantities(prev => ({
        ...prev,
        [key]: validatedValue,
      }));
    }
  };

  // Функция для применения изменения количества к реальному материалу
  const applyQuantityChange = (index: number, newQuantity: string) => {
    // Создаем копию материала для обновления
    const material = materials[index];
    if (!material) return;

    // Если количество не изменилось, не делаем ничего
    if (material.quantity === newQuantity) return;

    // Удаляем старый материал
    onRemoveMaterial(index, material.material);

    // Добавляем обновленный материал
    const updatedMaterial = {
      ...material,
      quantity: newQuantity,
    };

    // Используем тот же miniOrderIndex
    onAddMaterial(material.miniOrderIndex || 0, updatedMaterial);
  };

  // Обработчик для увеличения количества
  const handleIncrement = (index: number, key: string) => {
    const currentQuantity = displayQuantities[key] || '';
    // Преобразуем в число с плавающей точкой (или 0, если пусто)
    const numValue = currentQuantity === '' ? 0 : parseFloat(currentQuantity);
    const newQuantity = (numValue + 1).toString();

    // Обновляем отображаемое количество
    handleDisplayQuantityChange(key, newQuantity);

    // Применяем изменение
    applyQuantityChange(index, newQuantity);
  };

  // Обработчик для уменьшения количества
  const handleDecrement = (index: number, key: string) => {
    const currentQuantity = displayQuantities[key] || '';
    // Преобразуем в число с плавающей точкой (или 0, если пусто)
    const numValue = currentQuantity === '' ? 0 : parseFloat(currentQuantity);

    // Не позволяем опуститься ниже 0
    if (numValue <= 0) return;

    const newQuantity = (numValue - 1).toString();

    // Обновляем отображаемое количество
    handleDisplayQuantityChange(key, newQuantity);

    // Применяем изменение
    applyQuantityChange(index, newQuantity);
  };

  // Обработчик для непосредственного изменения количества
  const handleDirectQuantityChange = (index: number, key: string, value: string) => {
    // Обновляем ТОЛЬКО отображаемое количество
    handleDisplayQuantityChange(key, value);
    // Не вызываем applyQuantityChange здесь, чтобы избежать перерисовки при каждом вводе
  };

  // Обработчик потери фокуса для применения изменений
  const handleBlur = (index: number, key: string) => {
    const value = displayQuantities[key] || '';

    // Если поле пустое, устанавливаем "0"
    if (value === '') {
      handleDisplayQuantityChange(key, '0');
      applyQuantityChange(index, '0');
    } else {
      // Применяем изменения к материалу только когда пользователь закончил ввод
      applyQuantityChange(index, value);
    }
  };

  // Функция для добавления выбранных материалов
  const handleAddMaterials = () => {
    if (selectedMiniOrder === null) return;

    selectedMaterials.forEach(materialId => {
      // Получаем количество
      let quantity = quantityMap[materialId] || '';

      // Если пустое, устанавливаем "0"
      if (quantity === '') {
        quantity = '0';
      }

      onAddMaterial(selectedMiniOrder, {
        material: materialId,
        quantity: quantity,
        miniOrderIndex: selectedMiniOrder,
      });
    });

    // Очищаем выбранные материалы и закрываем диалог
    setSelectedMaterials([]);
    setQuantityMap({});
    setDialogOpen(false);
  };

  // Название материала по ID
  const getMaterialName = (materialId: any): string => {
    // Обрабатываем все возможные форматы ответа API
    const formattedMaterials = Array.isArray(availableMaterials)
      ? availableMaterials
      : availableMaterials?.materials
        ? availableMaterials.materials
        : availableMaterials?.results || [];

    const material = formattedMaterials.find(
      (m: any) => m.id.toString() === materialId?.toString(),
    );
    return material ? material.name : `Материал #${materialId}`;
  };

  // Цена материала по ID
  const getMaterialPrice = (materialId: any): string => {
    // Обрабатываем все возможные форматы ответа API
    const formattedMaterials = Array.isArray(availableMaterials)
      ? availableMaterials
      : availableMaterials?.materials
        ? availableMaterials.materials
        : availableMaterials?.results || [];

    const material = formattedMaterials.find(
      (m: any) => m.id.toString() === materialId?.toString(),
    );
    return material ? material.sell_price : '';
  };

  // Получаем имя сотрудника для отображения
  const getEmployeeDisplayName = (order: any): string => {
    // Пробуем найти first_name у сотрудника
    if (order.employee_details && order.employee_details.first_name) {
      return order.employee_details.first_name;
    }

    // Если есть employeeName (имя, установленное вручную), используем его
    if (order.employeeName) {
      return order.employeeName;
    }

    // Если у сотрудника есть first_name непосредственно в объекте
    if (order.first_name) {
      return order.first_name;
    }

    // Проверяем есть ли data вложенный объект (зависит от структуры API)
    if (order.employee && typeof order.employee === 'object' && order.employee.first_name) {
      return order.employee.first_name;
    }

    // Если ничего не помогло, просто возвращаем номер сотрудника
    return `Сотрудник #${order.employee}`;
  };

  // Функция для получения массива материалов в зависимости от формата ответа
  const getMaterialsArray = () => {
    if (!availableMaterials) return [];

    if (Array.isArray(availableMaterials)) {
      return availableMaterials;
    }

    if (availableMaterials.materials && Array.isArray(availableMaterials.materials)) {
      return availableMaterials.materials;
    }

    if (availableMaterials.results && Array.isArray(availableMaterials.results)) {
      return availableMaterials.results;
    }

    return [];
  };

  return (
    <div className='w-full'>
      {/* Заголовок */}
      <div className='mb-6 flex justify-center'>
        <h2 className='text-xl font-medium text-white'>Материалы</h2>
      </div>

      {/* Таблица материалов */}
      <div className='mb-4 overflow-hidden rounded-lg bg-[#131520]'>
        {/* Заголовки таблицы */}
        <div className='grid grid-cols-7 gap-2 border-b border-[#1D2042] px-4 py-3 text-sm text-[#0A63F0]'>
          <div className='col-span-1'>Наименование</div>
          <div className='col-span-1'>Услуга</div>
          <div className='col-span-1'>Цена</div>
          <div className='col-span-1 text-center'>Кол-во</div>
          <div className='col-span-1 text-center'>Сумма</div>
          <div className='col-span-1 text-center'>Удалить</div>
        </div>

        {/* Материалы */}
        {materials.length === 0 ? (
          <div className='px-4 py-6 text-center text-gray-400'>Нет добавленных материалов</div>
        ) : (
          materials.map((material: any, index: number) => {
            const materialPrice = getMaterialPrice(material.material);
            const materialKey = `${material.material}-${index}`;
            const quantity = displayQuantities[materialKey] || material.quantity || '';

            // Рассчитываем общую стоимость с дробными числами
            const numPrice = parseFloat(materialPrice || '0');
            const numQuantity = quantity === '' ? 0 : parseFloat(quantity);
            const totalPrice = numPrice * numQuantity;

            return (
              <div
                key={materialKey}
                className='grid grid-cols-7 items-center gap-2 border-b border-[#1D2042] px-4 py-3'
              >
                <div className='col-span-1 font-medium text-white'>
                  {getMaterialName(material.material)}
                </div>
                <div className='col-span-1 text-gray-400'>{`Услуга #${material.miniOrderIndex + 1 || index + 1}`}</div>
                <div className='col-span-1 text-white'>{materialPrice} сом</div>
                <div className='col-span-1 text-center'>
                  <div className='inline-flex items-center justify-between rounded bg-[#1A1D2D] text-white'>
                    {/* <button
                      className='px-2 py-1 hover:bg-[#1D2042]'
                      onClick={() => handleDecrement(index, materialKey)}
                      type='button'
                    >
                      <Minus size={14} />
                    </button> */}
                    <input
                      type='text'
                      // Use local state as source of truth with fallback
                      value={displayQuantities[materialKey] ?? quantity}
                      onChange={e => {
                        // Store exactly what the user types, including empty string
                        setDisplayQuantities(prev => ({
                          ...prev,
                          [materialKey]: e.target.value,
                        }));
                      }}
                      // Add validation and formatting when editing is complete
                      onBlur={() => {
                        const userValue = displayQuantities[materialKey];

                        // If field is completely empty, default to "0"
                        if (userValue === '' || userValue === undefined) {
                          setDisplayQuantities(prev => ({
                            ...prev,
                            [materialKey]: '1',
                          }));
                          applyQuantityChange(index, '1');
                        } else {
                          // Format the number to have exactly 2 decimal places
                          const numValue = parseFloat(userValue);

                          // Check if it's a valid number
                          if (!isNaN(numValue)) {
                            // Format with exactly 2 decimal places
                            const formattedValue = numValue.toFixed(2);

                            // Update display and parent
                            setDisplayQuantities(prev => ({
                              ...prev,
                              [materialKey]: formattedValue,
                            }));
                            applyQuantityChange(index, formattedValue);
                          } else {
                            // If not a valid number, keep as is
                            applyQuantityChange(index, userValue);
                          }
                        }
                      }}
                      className='h-8 w-12 bg-transparent text-center'
                    />
                    {/* <button
                      className='px-2 py-1 hover:bg-[#1D2042]'
                      onClick={() => handleIncrement(index, materialKey)}
                      type='button'
                    >
                      <Plus size={14} />
                    </button> */}
                  </div>
                </div>
                <div className='col-span-1 text-center text-white'>{totalPrice.toFixed(2)} сом</div>
                <div className='col-span-1 flex justify-center'>
                  <button
                    className='text-red-500 hover:text-red-400'
                    onClick={() => onRemoveMaterial(index, material.material)}
                    type='button'
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Кнопка добавления материалов */}
      <div className='mt-6 flex justify-center'>
        <Drawer open={dialogOpen} onOpenChange={setDialogOpen}>
          <DrawerTrigger asChild>
            <Button className='bg-blue-600 px-8 hover:bg-blue-700'>Добавить</Button>
          </DrawerTrigger>
          <DrawerContent className='mb-10 border-0 bg-[#131520] p-0'>
            <DrawerHeader className='flex justify-center border-b border-[#1D2042] p-6'>
              <DrawerTitle className='text-xl font-medium text-white'>Материалы</DrawerTitle>
            </DrawerHeader>

            <div className='mx-auto w-full max-w-3xl p-4'>
              {/* Выбор сотрудника (mini_order) */}
              <div className='mb-4'>
                <label className='mb-2 block text-sm text-gray-400'>Услуга</label>

                {!miniOrders?.length ? (
                  <div className='rounded-md border border-[#1D2042] bg-[#1A1D2D] p-3 text-gray-400'>
                    Сначала выберите услуги и сотрудника во вкладке &quot;Информация о заявке&quot;
                  </div>
                ) : (
                  <Select
                    value={selectedMiniOrder !== null ? selectedMiniOrder.toString() : undefined}
                    onValueChange={value => setSelectedMiniOrder(parseInt(value))}
                  >
                    <SelectTrigger className='border-[#1D2042] bg-[#1A1D2D] text-white'>
                      <SelectValue placeholder='Выберите услугу' />
                    </SelectTrigger>
                    <SelectContent className='border-[#1D2042] bg-[#1A1D2D] text-white'>
                      {miniOrders.map((order: any, index: number) => (
                        <SelectItem
                          key={index}
                          value={index.toString()}
                          className='hover:bg-[#1A2E59] focus:bg-[#1A2E59]'
                        >
                          {getEmployeeDisplayName(order)} (Услуга №{index + 1})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Табы категорий материалов - теперь динамические */}
              <Tabs defaultValue='all' className='mb-4 w-full'>
                <div className='border-b border-[#1D2042]'>
                  <TabsList className='flex h-auto gap-5 overflow-x-auto bg-transparent px-0'>
                    <TabsTrigger
                      value='all'
                      onClick={() => handleCategoryChange('all')}
                      className='rounded-none px-4 py-2 text-gray-400 hover:text-white data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-500'
                    >
                      Все
                    </TabsTrigger>

                    {isLoadingCategories ? (
                      <div className='px-4 py-2 text-gray-400'>Загрузка категорий...</div>
                    ) : (
                      (categoriesData || []).map((category: any) => (
                        <TabsTrigger
                          key={category.id}
                          value={category.id.toString()}
                          onClick={() => handleCategoryChange(category.id.toString())}
                          className='rounded-none px-4 py-2 text-gray-400 hover:text-white data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-500'
                        >
                          {category.name}
                        </TabsTrigger>
                      ))
                    )}
                  </TabsList>
                </div>
              </Tabs>

              {/* Заголовки колонок */}
              <div className='flex justify-between px-4 py-2 text-sm text-[#0A63F0]'>
                <span>Наименование</span>
                <span>Цена</span>
              </div>

              {/* Список материалов */}
              <div className='max-h-[300px] overflow-y-auto'>
                {isLoading ? (
                  <div className='py-4 text-center text-gray-400'>Загрузка материалов...</div>
                ) : getMaterialsArray().length === 0 ? (
                  <div className='py-4 text-center text-gray-400'>Материалы не найдены</div>
                ) : (
                  getMaterialsArray().map((material: any) => {
                    const isSelected = selectedMaterials.includes(material.id.toString());
                    return (
                      <div
                        key={material.id}
                        className={`flex items-center justify-between p-3 ${isSelected ? 'bg-[#1A2E59]' : 'hover:bg-[#1A1D2D]'}`}
                      >
                        <div className='flex items-center gap-3'>
                          <Checkbox
                            id={`material-${material.id}`}
                            checked={isSelected}
                            onCheckedChange={() => handleMaterialSelection(material.id.toString())}
                            className='border-[#1D2042] data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600'
                          />
                          <label
                            htmlFor={`material-${material.id}`}
                            className='cursor-pointer text-white'
                          >
                            {material.name}
                          </label>
                        </div>
                        <div className='flex items-center gap-3'>
                          {isSelected && (
                            <div className='inline-flex items-center justify-center'>
                              {/* <button
                                type='button'
                                className='flex h-8 w-8 items-center justify-center rounded-l border border-[#1D2042] bg-[#1A1D2D] text-white hover:bg-[#1D2042]'
                                onClick={() => decrementDialogQuantity(material.id.toString())}
                              >
                                <Minus size={14} />
                              </button> */}
                              <Input
                                type='text'
                                value={quantityMap[material.id.toString()] || ''}
                                onChange={e =>
                                  handleQuantityChange(material.id.toString(), e.target.value)
                                }
                                className='h-8 w-16 rounded-none border-y border-[#1D2042] bg-[#1A1D2D] text-center text-white'
                              />
                              {/* <button
                                type='button'
                                className='flex h-8 w-8 items-center justify-center rounded-r border border-[#1D2042] bg-[#1A1D2D] text-white hover:bg-[#1D2042]'
                                onClick={() => incrementDialogQuantity(material.id.toString())}
                              >
                                <Plus size={14} />
                              </button> */}
                            </div>
                          )}
                          <span className='min-w-[60px] text-right text-white'>
                            {material.sell_price} сом
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className='flex justify-center border-t border-[#1D2042] p-6'>
              <Button
                onClick={handleAddMaterials}
                className='bg-blue-600 px-24 py-2 hover:bg-blue-700'
                disabled={selectedMaterials.length === 0 || selectedMiniOrder === null}
              >
                Добавить
              </Button>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
};

export default MaterialsTab;
