import { Activity, CreditCard, DollarSign, Users } from 'lucide-react';
import React from 'react';
import BaseChart from '@/components/charts';
import ExpenseChart from '@/components/charts/ExpenseChart';
import ExpensesBreakdownChart from '@/components/charts/ExpensesBreakdownChart';
import RevenueChart from '@/components/charts/RevenueChart';
import RoundedChart from '@/components/charts/RoundedChart';
import DashboardCard from '@/components/ui/dashboard-card';

const DahboardMetrics = () => {
  return (
    <main className={'flex flex-col gap-5'}>
      <div className={'flex flex-wrap items-center justify-between gap-5'}>
        <DashboardCard
          queryKey={'expensesRevenue'}
          title={'Общий доход'}
          api={'expenses/revenue-only-sums/'}
          icon={<DollarSign />}
          value={3000}
          description='+20% за последние 2 часа'
        />
        <DashboardCard
          queryKey={'expensesMaterial'}
          title={'Количество выполненных заявок'}
          api={'expenses/orders/stats/'}
          icon={<Users />}
          value={3000}
          description='+20% за последние 2 часа'
        />
        <DashboardCard
          queryKey={'expensesOrders'}
          title={'Прибыль'}
          api={'expenses/branch/net-profit/'}
          icon={<CreditCard />}
          value={3000}
          description='+20% за последние 2 часа'
        />
        {/*<DashboardCard*/}
        {/*  title={'Доходный счет'}*/}
        {/*  api={'/transaction/quantity'}*/}
        {/*  icon={<Activity />}*/}
        {/*  value={3000}*/}
        {/*  description='+20% за последние 2 часа'*/}
        {/*/>*/}
      </div>

      <div className={'grid grid-cols-4 gap-5'}>
        <div className={'col-span-3'}>
          <RevenueChart />
        </div>
        <div className={'col-span-1'}>
          <ExpensesBreakdownChart />
        </div>
      </div>
      <div className={'grid grid-cols-4 gap-5'}>
        <div className={'col-span-3'}>
          <ExpenseChart />
        </div>
        <div className={'col-span-1'}>
          <RoundedChart />
        </div>
      </div>
    </main>
  );
};

export default DahboardMetrics;
