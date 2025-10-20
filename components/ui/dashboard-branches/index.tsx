import { Activity, CreditCard, DollarSign, Users } from 'lucide-react';
import React from 'react';
import BaseChart from '@/components/charts';
import RoundedChart from '@/components/charts/RoundedChart';
import DashboardCard from '@/components/ui/dashboard-card';

const DahboardBranches = () => {
  return (
    <main className={'flex flex-col gap-5'}>
      <div className={'flex flex-wrap items-center justify-between gap-5'}>
        <DashboardCard
          title={'Общий доход'}
          api={'/transaction/quantity'}
          icon={<DollarSign />}
          value={3000}
          description='+20% за последние 2 часа'
          queryKey={''}
        />
        <DashboardCard
          title={'Кредиторская задолженность'}
          api={'/transaction/quantity'}
          icon={<Users />}
          value={3000}
          description='+20% за последние 2 часа'
          queryKey={''}
        />
        <DashboardCard
          title={'Количество транзакций'}
          api={'/transaction/quantity'}
          icon={<CreditCard />}
          value={3000}
          description='+20% за последние 2 часа'
          queryKey={''}
        />
        <DashboardCard
          title={'Доходный счет'}
          api={'/transaction/quantity'}
          icon={<Activity />}
          value={3000}
          description='+20% за последние 2 часа'
          queryKey={''}
        />
      </div>

      <div className={'grid grid-cols-4 gap-5'}>
        <div className={'col-span-3'}>
          <BaseChart />
        </div>
        <div className={'col-span-1'}>
          <RoundedChart />
        </div>
      </div>
      <div className={'grid grid-cols-4 gap-5'}>
        <div className={'col-span-3'}>
          <BaseChart />
        </div>
        <div className={'col-span-1'}>
          <RoundedChart />
        </div>
      </div>
    </main>
  );
};

export default DahboardBranches;
