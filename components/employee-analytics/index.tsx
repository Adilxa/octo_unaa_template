import $api from '@/api/http';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import EmployeeCard from '@/components/ui/employee-card';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const fetchProfit = async () => {
  const res = await $api.get('/employee/employee-profit/');
  return res.data;
};

const fetchListorders = async () => {
  const res = await $api.get('/employee/employee-orders-count/');
  return res.data;
};

const EmployeeAnalytics = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [size, setSize] = useState(10);
  const [page, setPage] = useState(1);

  const updateURL = (value: any, param: any) => {
    const updatedParams = new URLSearchParams(searchParams?.toString());
    updatedParams.set(param, value.toString());

    if (param === 'size') {
      updatedParams.set('page', '1');
      setPage(1);
      setSize(value);
    } else if (param === 'page') {
      setPage(value);
    }

    router.push(`?${updatedParams.toString()}`, { scroll: false });
  };

  const { data: profitList, isLoading: profitLoading } = useQuery({
    queryKey: ['profitList'],
    queryFn: () => fetchProfit(),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['profitOrdersList'],
    queryFn: () => fetchListorders(),
  });

  const getOrderText = (count: any) => {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return 'заказов';
    } else if (lastDigit === 1) {
      return 'заказ';
    } else if (lastDigit >= 2 && lastDigit <= 4) {
      return 'заказа';
    } else {
      return 'заказов';
    }
  };

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const maxValue = Math.max(...data.map((item: any) => item.orders_count));

    return data.map((item: any, index: any) => ({
      name: item.full_name, // Fixed text as in design
      value: item.orders_count,
      color: index % 2 === 0 ? '#0066ff' : '#33aaff', // Alternating colors
      label: `+${item.orders_count} ${getOrderText(item.full_name)}`,
      percentage: maxValue > 0 ? (item.orders_count / maxValue) * 100 : 0, // Calculate percentage of max value
    }));
  }, [data]);

  console.log(data);

  if (isLoading || profitLoading) return <p>loading...</p>;
  return (
    <>
      <main className='mb-10 grid grid-cols-1 gap-5 px-4 sm:grid-cols-2 lg:grid-cols-4'>
        {profitList?.map((profit: any) => (
          <EmployeeCard
            key={profit.id}
            title={profit.full_name}
            avatar={''}
            money={profit.total_profit}
            info={''}
          />
        ))}
      </main>

      <div className='w-full rounded-xl bg-[#171928] px-6 py-8' style={{ minHeight: '600px' }}>
        <h2 className='mb-8 text-xl font-semibold text-white'>Статистика сотрудников</h2>

        <div className='space-y-8'>
          {chartData.map((item: any, index: any) => (
            <div key={index} className='flex items-center'>
              {/* Аватар - фиксированная ширина */}
              <div className='w-14 flex-shrink-0'>
                <img
                  className='h-10 w-10 rounded-full object-cover'
                  src='https://github.com/shadcn.png'
                  alt={`${item.name} аватар`}
                />
              </div>

              {/* Имя - фиксированная ширина */}
              <div className='w-36 flex-shrink-0 text-sm font-medium text-white'>
                {item.name.split(' ').slice(0, 1).join(' ')} <br />
                {item.name.split(' ').slice(1).join(' ')}
              </div>

              {/* Контейнер для прогресс бара - прозрачный фон */}
              <div className='relative mr-6 flex h-10 flex-1 items-center overflow-hidden rounded-lg bg-transparent'>
                {/* Активная часть прогресс бара */}
                <div
                  className='absolute left-0 top-0 h-full'
                  style={{
                    width: `${Math.max(item.percentage, 5)}%`, // Минимум 5% для визуального отображения
                    backgroundColor: item.color || '#6366F1',
                    borderTopRightRadius: '5px',
                    borderBottomRightRadius: '5px',
                    transition: 'width 0.5s ease-in-out',
                  }}
                />
              </div>

              {/* Значение - фиксированная ширина */}
              <div
                className='w-32 text-right text-lg font-medium'
                style={{ color: item.color || '#6366F1' }}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default EmployeeAnalytics;
