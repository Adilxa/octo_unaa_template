import $api from '@/api/http';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const fetchPackageList = async (page: string, size: string) => {
  const res = await $api.get('packages/analytics/', {
    params: {
      // search: search,
      page: page,
      size: size,
    },
  });
  return res.data;
};

const PackageAnalytics = () => {
  const searchParams = useSearchParams();
  const pageParam = searchParams.get('page');
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

  const { data, isLoading } = useQuery({
    queryKey: ['packageAnalytics', page, size],
    queryFn: () => fetchPackageList(String(page), String(size)),
  });
  console.log(data);

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

    const maxValue = Math.max(...data.results.map((item: any) => item.usage_count));

    return data.results.map((item: any, index: any) => ({
      name: item.package_name, // Fixed text as in design
      value: item.usage_count,
      color: index % 2 === 0 ? '#0066ff' : '#33aaff', // Alternating colors
      label: `+${item.usage_count} ${getOrderText(item.usage_count)}`,
      percentage: (item.usage_count / maxValue) * 100, // Calculate percentage of max value
    }));
  }, [data]);

  const totalPages = size > 0 ? Math.ceil(data?.count / size) : 0;

  console.log(data);

  if (isLoading) {
    return <div className='p-4 text-white'>Loading...</div>;
  }

  return (
    <div className='w-full rounded-xl bg-[#171928]' style={{ minHeight: '600px', padding: '20px' }}>
      {chartData.map((item: any, index: any) => (
        <div key={index} className='mb-6 flex items-center'>
          <div className='mr-5 w-48 whitespace-normal text-sm text-white'>{item.name}</div>
          <div className='flex flex-1 items-center'>
            <div
              style={{
                backgroundColor: item.color,
                width: `${item.percentage}%`, // Use percentage of max for proportional scaling
                height: '35px',
                borderRadius: '4px',
                maxWidth: 'calc(100% - 120px)', // Leave space for the label
              }}
            />
            <div className='ml-3 text-lg font-medium text-[#33aaff]'>{item.label}</div>
          </div>
        </div>
      ))}
      <div className='flex items-center justify-end gap-10 rounded-b-2xl bg-[#171928] px-4 py-3'>
        <div className='flex items-center gap-10 text-sm'>
          <div className='flex items-center gap-5'>
            <span>Количество записей</span>
            <Select
              value={String(size)}
              onValueChange={value => updateURL(parseInt(value), 'size')}
            >
              <SelectTrigger className='h-8 w-[70px] border-0'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className='bg-[#171928]'>
                <SelectItem value='10'>10</SelectItem>
                <SelectItem value='20'>20</SelectItem>
                <SelectItem value='50'>50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className='flex items-center gap-5'>
          <span className='text-sm text-gray-500'>
            Страница {pageParam} из {totalPages}
          </span>
          <div className='flex gap-1'>
            <Button
              variant='outline'
              onClick={() => updateURL(1, 'page')}
              disabled={page === 1}
              size='icon'
            >
              <ChevronsLeft className='h-4 w-4' />
            </Button>
            <Button
              variant='outline'
              onClick={() => updateURL(page - 1, 'page')}
              disabled={page === 1}
              size='icon'
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <Button
              variant='outline'
              onClick={() => updateURL(page + 1, 'page')}
              disabled={page >= totalPages}
              size='icon'
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
            <Button
              variant='outline'
              onClick={() => updateURL(page + 1, 'page')}
              disabled={page >= totalPages}
              size='icon'
            >
              <ChevronsRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageAnalytics;
