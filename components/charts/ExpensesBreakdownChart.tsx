import $api from '@/api/http';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import React from 'react';
import { Label, LabelProps, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';

// Define types for the API response
interface OrderCycleData {
  total_orders: number;
  pending_count: number;
  pending_percent: number;
  in_progress_count: number;
  in_progress_percent: number;
  completed_count: number;
  completed_percent: number;
  canceled_count: number;
  canceled_percent: number;
}

// Define type for chart data items
interface ChartDataItem {
  name: string;
  value: number;
  percentage: string;
  count: string;
  fill: string;
}

const fetchOrderCycleData = async (
  period: string,
  page: string,
  size: string,
): Promise<OrderCycleData> => {
  const res = await $api.get<OrderCycleData>('expenses/order-cycle-breakdown/', {
    params: {
      period: period,
      page: page,
      size: size,
    },
  });
  return res.data;
};

const ExpenseBreakdownChart: React.FC = () => {
  const searchParams = useSearchParams();
  const period = searchParams.get('period') || '';
  const page = searchParams.get('page') || '';
  const size = searchParams.get('size') || '';

  const { data: orderCycleData, isLoading } = useQuery({
    queryKey: ['orderCycle', period],
    queryFn: () => fetchOrderCycleData(period, page, size),
  });

  // Default empty data while loading
  const chartData: ChartDataItem[] = [];
  let totalOrders = 0;

  if (orderCycleData && !isLoading) {
    totalOrders = orderCycleData.total_orders;

    // Transform the API data into the format needed for the chart
    chartData.push({
      name: 'Новая',
      value: orderCycleData.pending_count,
      percentage: `${Math.round(orderCycleData.pending_percent)}%`,
      count: `${orderCycleData.pending_count} ${getPluralForm(orderCycleData.pending_count, 'заявка', 'заявки', 'заявок')}`,
      fill: '#0066FF',
    });

    chartData.push({
      name: 'На работе',
      value: orderCycleData.in_progress_count,
      percentage: `${Math.round(orderCycleData.in_progress_percent)}%`,
      count: `${orderCycleData.in_progress_count} ${getPluralForm(orderCycleData.in_progress_count, 'заявка', 'заявки', 'заявок')}`,
      fill: '#00D1FF',
    });

    chartData.push({
      name: 'Завершена',
      value: orderCycleData.completed_count,
      percentage: `${Math.round(orderCycleData.completed_percent)}%`,
      count: `${orderCycleData.completed_count} ${getPluralForm(orderCycleData.completed_count, 'заявка', 'заявки', 'заявок')}`,
      fill: '#003380',
    });

    chartData.push({
      name: 'Отменена',
      value: orderCycleData.canceled_count,
      percentage: `${Math.round(orderCycleData.canceled_percent)}%`,
      count: `${orderCycleData.canceled_count} ${getPluralForm(orderCycleData.canceled_count, 'заявка', 'заявки', 'заявок')}`,
      fill: '#FFFFFF',
    });
  }

  // Helper function to get correct plural form for Russian words
  function getPluralForm(number: number, form1: string, form2: string, form5: string): string {
    let n = Math.abs(number);
    n %= 100;
    if (n >= 5 && n <= 20) {
      return form5;
    }
    n %= 10;
    if (n === 1) {
      return form1;
    }
    if (n >= 2 && n <= 4) {
      return form2;
    }
    return form5;
  }

  console.log(orderCycleData);

  return (
    <Card className='h-full w-full rounded-xl bg-[#171928] p-6 shadow'>
      <div className='mb-4 flex items-start justify-between'>
        <div className={'flex w-full items-center justify-between'}>
          <div className='text-[20px] text-gray-200'>Цикл заявок</div>
          <div className='text-2xl text-[20px] font-semibold text-[#0A63F0]'>
            {totalOrders} {getPluralForm(totalOrders, 'заказ', 'заказа', 'заказов')}
          </div>
        </div>
      </div>

      <div className='relative h-[300px]'>
        {isLoading ? (
          <div className='flex h-full items-center justify-center'>
            <div className='text-white'>Загрузка...</div>
          </div>
        ) : (
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <Pie
                data={chartData}
                dataKey='value'
                nameKey='name'
                cx='50%'
                cy='50%'
                innerRadius={80}
                outerRadius={120}
                strokeWidth={0}
              >
                <Label
                  content={(props: LabelProps) => {
                    const { viewBox } = props;
                    const { cx, cy } = viewBox as { cx: number; cy: number };

                    return (
                      <text
                        x={cx}
                        y={cy}
                        textAnchor='middle'
                        dominantBaseline='middle'
                        className='text-4xl font-bold'
                        fill='#0A63F0'
                      >
                        {totalOrders}
                      </text>
                    );
                  }}
                />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className='mt-4 grid grid-cols-2 gap-4'>
        {chartData.map((item, index) => (
          <div key={index} className='flex items-start justify-start gap-2'>
            <div className='mt-1.5 h-2 w-2 rounded-full' style={{ backgroundColor: item.fill }} />
            <div>
              <div className='text-[14px] text-white'>{item.name}</div>
              <div className='text-[12px] text-[#30B4E7]'>
                {item.percentage} • {item.count}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ExpenseBreakdownChart;
