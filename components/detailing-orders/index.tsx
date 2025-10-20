import $api from '@/api/http';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, DollarSign, Users } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import React from 'react';
import TabSwitcher from '@/components/ui/tabs/index';

const fetchOrders = async () => {
  const res = await $api.get('/master/order-groups-analytics/');
  return res.data;
};

const tab = [
  {
    name: 'День',
    link: 'day',
  },
  {
    name: 'Неделя',
    link: 'week',
  },
];

const DetailOrders = () => {
  const searchParams = useSearchParams();

  const period = searchParams.get('period');

  const { data, isLoading } = useQuery({
    queryKey: ['detailOrders'],
    queryFn: () => fetchOrders(),
  });

  console.log(data);

  console.log(data);

  return (
    <main className={'mb-[2rem] grid h-fit min-h-[150px] grid-cols-12 gap-5 rounded-lg'}>
      <div
        className={
          'col-span-5 flex flex-col justify-between rounded-2xl bg-[#171928] p-5 transition-all duration-300 ease-in-out hover:bg-[#30B4E7]'
        }
      >
        <header className={'flex items-center justify-between'}>
          <h2 className={'text-[20px] font-semibold'}>Активных заявок</h2>
          <DollarSign />
        </header>
        <h1 className={'text-[40px] font-semibold'}>+{data?.status_counts.active} заказа</h1>
      </div>
      <div
        className={
          'col-span-7 flex flex-col justify-between rounded-2xl bg-[#171928] p-5 transition-all duration-300 ease-in-out hover:bg-[#30B4E7]'
        }
      >
        <header className={'flex items-center justify-between'}>
          <h2 className={'text-[20px] font-semibold'}>Выполненные заявки</h2>
          <div className={'flex items-center gap-5'}>
            <TabSwitcher tabArr={tab} />
            <Users />
          </div>
        </header>
        <h1 className={'text-[40px] font-semibold'}>
          +{period == 'day' ? data?.completed_stats.today : data?.completed_stats.this_week} заказа
        </h1>
      </div>
      {/*<div*/}
      {/*  className={*/}
      {/*    'col-span-3 flex flex-col justify-between rounded-2xl bg-[#171928] p-5 transition-all duration-300 ease-in-out hover:bg-[#30B4E7]'*/}
      {/*  }*/}
      {/*>*/}
      {/*  <header className={'flex items-center justify-between'}>*/}
      {/*    <h2 className={'text-[20px] font-semibold'}>Загруженность</h2>*/}
      {/*    <CreditCard />*/}
      {/*  </header>*/}
      {/*  <h1 className={'text-[40px] font-semibold'}>{data?.load_stats?.current_load}%</h1>*/}
      {/*</div>*/}
    </main>
  );
};

export default DetailOrders;
