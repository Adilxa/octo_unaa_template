import $api from '@/api/http';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { ArrowUpRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import React from 'react';

interface Props {
  title: string;
  icon: React.ReactNode;
  api: string;
  value: number;
  description: string;
  queryKey: string;
}

const fetchData = async (endpoint: string, start: string, end: string, period: string) => {
  // Check if start_date and end_date are provided
  if (start && end) {
    // If both dates are provided, use them in the request
    const res = await $api.get(endpoint, {
      params: {
        start_date: start,
        end_date: end,
        period: period,
      },
    });
    return res.data;
  } else {
    // If dates are not provided, only use period parameter
    const res = await $api.get(endpoint, {
      params: {
        period: period,
      },
    });
    return res.data;
  }
};

const DashboardCard: React.FC<Props> = ({ title, icon, api, value, description, queryKey }) => {
  const searchParams = useSearchParams();

  const period = searchParams.get('period') || 'day';
  const start = searchParams.get('start_date') || '';
  const end = searchParams.get('end_date') || '';

  const { data, isLoading } = useQuery({
    queryKey: [queryKey, start, end, period],
    queryFn: () => fetchData(api, start, end, period),
  });

  console.log(data);

  if (isLoading) return <p>loading</p>;
  return (
    <div className='group flex min-h-[150px] flex-1 flex-col justify-between gap-1 rounded-xl bg-[#171928] p-6 shadow transition-all duration-300 hover:scale-105 hover:bg-gradient-to-r hover:from-[#0B52C7] hover:to-[#30B4E7]'>
      <div className='flex items-center justify-between text-[#30B4E7] group-hover:text-[#fff]'>
        <h1 className='whitespace-nowrap text-[20px] font-semibold text-white'>{title}</h1>
        {icon}
      </div>
      {api == 'expenses/orders/stats/' ? (
        <div className='text-[40px] font-bold text-white'>{data?.completed_orders}</div>
      ) : (
        <div className='text-[40px] font-bold text-white'>
          {data?.total_profit || data?.total_sum} сом
        </div>
      )}
    </div>
  );
};

export default DashboardCard;
