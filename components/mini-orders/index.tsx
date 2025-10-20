'use client';

import $api from '@/api/http';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, MoreVertical, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/shadcn/select';

interface Material {
  material: string;
  quantity: string;
}

interface MiniOrder {
  employee: number;
  services: number[] | any[]; // ID услуг или полные объекты услуг
  commission_rate: string;
  materials: Material[];
  employeeName?: string; // Имя сотрудника (опционально)
}

interface Service {
  id: number;
  name: string;
  price: string;
  description?: string;
}

interface MiniOrdersListProps {
  miniOrders: MiniOrder[];
  onRemove: (index: number) => void;
  onShowMore?: (miniOrderIndex: number) => void;
  onEmployeeChange: any;
}

const fetchCategories = async (): Promise<any> => {
  const res = await $api.get('/employee/master-employees/ ');
  return res.data;
};

const MiniOrdersList: React.FC<MiniOrdersListProps> = ({
  miniOrders,
  onRemove,
  onShowMore,
  onEmployeeChange,
}) => {
  const [serviceDetails, setServiceDetails] = useState<Record<number, Service>>({});
  const [loading, setLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const { data: employee, isLoading: loadingEmployees } = useQuery({
    queryKey: ['allEmployes'],
    queryFn: () => fetchCategories(),
  });

  const handleEmployeeChange = (miniOrderIndex: number, employeeId: string) => {
    const selectedEmployee = employee.find((emp: any) => emp.id.toString() === employeeId);
    if (selectedEmployee) {
      onEmployeeChange(miniOrderIndex, selectedEmployee.id, selectedEmployee.first_name);
    }
  };

  // Получение деталей всех услуг при первом рендере
  useEffect(() => {
    const fetchAllServiceDetails = async () => {
      setLoading(true);
      try {
        // Собираем все уникальные ID услуг из всех miniOrders
        const allServiceIds = new Set<number>();
        miniOrders.forEach(order => {
          order.services.forEach(service => {
            if (typeof service === 'number') {
              allServiceIds.add(service);
            } else if (service.id) {
              allServiceIds.add(service.id);
            }
          });
        });

        // Получаем детали для каждой услуги
        const details: Record<number, Service> = {};
        await Promise.all(
          Array.from(allServiceIds).map(async serviceId => {
            try {
              const response = await $api.get(`/services/${serviceId}/`);
              details[serviceId] = response.data;
            } catch (error) {
              console.error(`Ошибка при получении деталей услуги ${serviceId}:`, error);
              // Создаем заглушку при ошибке
              details[serviceId] = {
                id: serviceId,
                name: `Услуга #${serviceId}`,
                price: '—',
              };
            }
          }),
        );

        setServiceDetails(details);
      } catch (error) {
        console.error('Ошибка при получении деталей услуг:', error);
      } finally {
        setLoading(false);
      }
    };

    if (miniOrders.length > 0) {
      fetchAllServiceDetails();
    }
  }, [miniOrders]);

  const toggleExpand = (index: number) => {
    setExpandedOrder(expandedOrder === index ? null : index);
  };

  const getServiceName = (service: number | any): string => {
    if (typeof service === 'number') {
      return serviceDetails[service]?.name || `Услуга #${service}`;
    }
    return service.name || `Услуга #${service.id || 'неизвестно'}`;
  };

  const getServicePrice = (service: number | any): string => {
    if (typeof service === 'number') {
      return serviceDetails[service]?.price || '—';
    }
    return service.price || '—';
  };

  return (
    <div className='mt-4 space-y-4'>
      {miniOrders.map((order, orderIndex) => (
        <div key={orderIndex} className='overflow-hidden rounded-md bg-[#191C2D]'>
          {/* Заголовок услуги */}
          <div className='flex items-center justify-between px-4 py-3'>
            <div className='text-sm font-medium text-white'>Услуга №{orderIndex + 1}</div>
            <div className='flex items-center'>
              {/* Заменяем кнопку на DropdownMenu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8 text-gray-400 hover:text-white'
                  >
                    <MoreVertical size={18} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align='end'
                  className='w-40 border border-[#1A1F38] bg-[#131628] text-white'
                >
                  <DropdownMenuItem
                    className='flex cursor-pointer items-center gap-2 hover:bg-[#1A2E59] focus:bg-[#1A2E59]'
                    onClick={() => onRemove && onRemove(orderIndex)}
                  >
                    <Trash2 size={16} className='text-red-500' />
                    <span>Удалить</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Список услуг - с новым фоном для ячеек */}
          <div className='flex flex-col'>
            {order.services
              .slice(0, expandedOrder === orderIndex ? undefined : 5)
              .map((service, serviceIndex) => (
                <div
                  key={serviceIndex}
                  className='flex items-center justify-between border-t border-[#1A1F38] bg-[#171928] px-4 py-3'
                >
                  <span className='text-sm text-white'>{getServiceName(service)}</span>
                  <span className='text-sm text-white'>{getServicePrice(service)} сом</span>
                </div>
              ))}

            {loading && (
              <div className='border-t border-[#1A1F38] bg-[#171928] px-4 py-3'>
                <p className='text-sm text-gray-400'>Loading...</p>
              </div>
            )}

            {/* Кнопка "Показать еще" */}
            {order.services.length > 5 && expandedOrder !== orderIndex && (
              <button
                onClick={() => toggleExpand(orderIndex)}
                className='flex w-full items-center justify-center border-t border-[#1A1F38] bg-[#171928] py-3 text-xs text-[#0A63F0] transition-colors hover:text-blue-400'
              >
                Показать еще <ChevronDown size={14} className='ml-1' />
              </button>
            )}
          </div>

          {/* Сотрудник - Select компонент */}
          <div className='flex items-center justify-between border-t border-[#1A1F38] bg-[#191C2D] px-4 py-3'>
            <div className='text-sm text-gray-400'>Сотрудник</div>
            <div className='w-[200px]'>
              <Select
                value={order.employee.toString()}
                onValueChange={value => handleEmployeeChange(orderIndex, value)}
              >
                <SelectTrigger className='h-8 rounded border border-[#1A1F38] bg-[#131628] text-sm text-white'>
                  <SelectValue placeholder='Выберите сотрудника' />
                </SelectTrigger>
                <SelectContent className='border-[#1A1F38] bg-[#131628] text-white'>
                  {loadingEmployees ? (
                    <div className='p-2 text-sm'>Loading...</div>
                  ) : (
                    employee?.map((employee: any) => (
                      <SelectItem
                        key={employee.id}
                        value={employee.id.toString()}
                        className='text-sm hover:bg-[#1A2E59] focus:bg-[#1A2E59] data-[selected]:bg-[#1A2E59]'
                      >
                        {employee.first_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      ))}

      {miniOrders.length === 0 && (
        <div className='rounded-md bg-[#191C2D] px-3 py-4 text-center text-sm text-gray-400'>
          Нет выбранных услуг
        </div>
      )}
    </div>
  );
};

export default MiniOrdersList;
