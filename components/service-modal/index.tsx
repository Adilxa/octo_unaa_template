'use client';

import $api from '@/api/http';
import { useQuery } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// Функция для получения всех услуг
const fetchServices = async (categoryId?: string): Promise<any> => {
  let res;

  // Если выбрана конкретная категория, используем специальный маршрут
  if (categoryId && categoryId !== 'all') {
    res = await $api.get(`/services/service-categories/${categoryId}/services/`);
  } else {
    // Если выбраны все категории, используем стандартный маршрут
    res = await $api.get('/services/list/');
  }

  return res.data;
};

// Функция для получения категорий услуг
const fetchServiceCategories = async (): Promise<any> => {
  const res = await $api.get('/services/service-categories/');
  return res.data;
};

interface ServiceDrawerProps {
  onSubmit: (selectedServices: any[]) => void;
  buttonText?: string;
}

const ServiceDrawer: React.FC<ServiceDrawerProps> = ({
  onSubmit,
  buttonText = 'Выбрать услугу',
}) => {
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Запрос на получение категорий услуг
  const { data: serviceCategories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['serviceCategories'],
    queryFn: fetchServiceCategories,
    enabled: isOpen, // Загружаем только когда диалог открыт
  });

  // Запрос на получение услуг с фильтрацией по категории
  const { data: services = { results: [] }, isLoading } = useQuery({
    queryKey: ['servicesList', activeCategory],
    queryFn: () => fetchServices(activeCategory),
    enabled: isOpen, // Загружаем только когда диалог открыт
  });

  // Функция для получения массива услуг в зависимости от формата ответа
  const getServicesArray = () => {
    if (!services) return [];

    if (Array.isArray(services)) {
      return services;
    }

    if (services.services && Array.isArray(services.services)) {
      return services.services;
    }

    if (services.results && Array.isArray(services.results)) {
      return services.results;
    }

    return [];
  };

  // Обработчик для изменения категории
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  const toggleServiceSelection = (serviceId: any) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  const handleSubmit = () => {
    onSubmit(selectedServices);
    setIsOpen(false);
    setSelectedServices([]);
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button className={cn('w-full max-w-md rounded-md py-3 text-center font-medium')}>
          {buttonText}
        </Button>
      </DrawerTrigger>
      <DrawerContent className='mb-10 flex flex-col items-center bg-[#131524]'>
        <DrawerHeader className='relative flex w-full items-center justify-center border-b border-gray-800 px-6 py-5'>
          <DrawerTitle className='text-xl font-medium text-white'>Услуги</DrawerTitle>
          <DrawerClose className='absolute right-6 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-white'>
            <X size={20} />
          </DrawerClose>
        </DrawerHeader>

        <div className='w-full max-w-5xl bg-[#131524]'>
          <Tabs defaultValue='all' className='w-full bg-[#131524]'>
            <div className='border-b border-gray-800 bg-[#131524]'>
              <TabsList className='flex h-auto gap-5 overflow-x-auto bg-[#131524] px-6'>
                <TabsTrigger
                  value='all'
                  onClick={() => handleCategoryChange('all')}
                  className={`rounded-none px-4 py-2 text-gray-400 hover:text-white data-[state=active]:border-blue-500 data-[state=active]:bg-[#131524] data-[state=active]:text-blue-500`}
                >
                  Все
                </TabsTrigger>

                {isLoadingCategories ? (
                  <div className='px-4 py-2 text-gray-400'>Загрузка категорий...</div>
                ) : (
                  (serviceCategories || []).map((category: any) => (
                    <TabsTrigger
                      key={category.id}
                      value={category.id.toString()}
                      onClick={() => handleCategoryChange(category.id.toString())}
                      className={`rounded-none px-4 py-2 text-gray-400 hover:text-white data-[state=active]:border-blue-500 data-[state=active]:bg-[#131524] data-[state=active]:text-blue-500`}
                    >
                      {category.name}
                    </TabsTrigger>
                  ))
                )}
              </TabsList>
            </div>

            <div className='max-h-[400px] overflow-y-auto bg-[#131524] p-2'>
              <div className='flex justify-between bg-[#131524] px-4 py-2 text-sm text-gray-400'>
                <span>Наименование</span>
                <span>Цена</span>
              </div>

              {isLoading ? (
                <div className='flex justify-center bg-[#131524] py-4'>
                  <span className='text-gray-400'>Загрузка услуг...</span>
                </div>
              ) : getServicesArray().length === 0 ? (
                <div className='flex justify-center bg-[#131524] py-4'>
                  <span className='text-gray-400'>Услуги не найдены</span>
                </div>
              ) : (
                getServicesArray().map((service: any) => (
                  <div key={service.id} className='mb-4 bg-[#131524]'>
                    <div
                      onClick={() => toggleServiceSelection(service.id)}
                      className={cn(
                        'flex cursor-pointer items-center justify-between rounded-md px-4 py-3 transition-colors hover:bg-[#1A1D2D]',
                        selectedServices.includes(service.id) ? 'bg-[#1A2E59]' : 'bg-[#131524]',
                      )}
                    >
                      <div className='flex items-center gap-3'>
                        <div
                          className={cn(
                            'flex h-5 w-5 items-center justify-center rounded',
                            selectedServices.includes(service.id)
                              ? 'bg-blue-600'
                              : 'border border-gray-600',
                          )}
                        >
                          {selectedServices.includes(service.id) && (
                            <Check size={14} className='text-white' />
                          )}
                        </div>
                        <span className='text-white'>{service.name}</span>
                      </div>
                      <span className='font-medium text-white'>{service.price}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Tabs>
        </div>

        <div className='flex w-full justify-center border-t border-gray-800 bg-[#131524] p-6'>
          <Button
            onClick={handleSubmit}
            disabled={selectedServices.length === 0}
            className={`w-full max-w-md rounded-xl ${selectedServices.length === 0 ? 'cursor-not-allowed bg-blue-800' : 'bg-blue-600'} py-3 font-medium text-white hover:bg-blue-700`}
          >
            Добавить
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ServiceDrawer;
