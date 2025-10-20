import $api from '@/api/http';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import TabSwitcher from '@/components/ui/tabs/index';

interface ExpenseDataItem {
  date: string;
  total_sum: string;
  percent_change_24h: string;
}

interface ChartDataItem {
  date: string;
  actual: number;
  projected: number;
}

const fetchData = async (period: string): Promise<ExpenseDataItem[]> => {
  const res = await $api.get<ExpenseDataItem[]>('expenses/revenue-sums/', {
    params: period !== 'day' ? { period } : undefined,
  });
  return res.data;
};

const tabsArr = [
  {
    link: 'day',
    name: 'День',
  },
  {
    link: 'week',
    name: 'Неделя',
  },
  {
    link: 'month',
    name: 'Месяц',
  },
];

interface CustomBarProps {
  fill: string;
  x: number;
  y: number;
  width: number;
  height: number;
  projected: boolean;
}

const CustomBar: React.FC<CustomBarProps> = props => {
  const { fill, x, y, width, height } = props;

  return (
    <g>
      <defs>
        <pattern id='stripe' patternUnits='userSpaceOnUse' width='4' height='4'>
          <path d='M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2' stroke={fill} strokeWidth='1' opacity='0.5' />
        </pattern>
      </defs>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={props.projected ? 'url(#stripe)' : fill}
      />
    </g>
  );
};

const RevenueChart: React.FC = () => {
  const searchParams = useSearchParams();
  const period = searchParams.get('revenuePeriod') || 'day';

  const { data: apiData, isLoading } = useQuery({
    queryKey: ['RevenueChart', period],
    queryFn: () => fetchData(period),
  });

  // Format date from API (YYYY-MM-DD) to display format (DD.MM)
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}.${month}`;
  };

  // Transform API data for chart display
  const chartData = React.useMemo((): ChartDataItem[] => {
    if (!apiData || !apiData.length) return [];

    return apiData.map(item => ({
      date: formatDate(item.date),
      actual: parseFloat(item.total_sum) || 0,
      projected: 0,
    }));
  }, [apiData]);

  // Calculate total income from API data
  const totalIncome = React.useMemo((): number => {
    if (!apiData || !apiData.length) return 0;
    return apiData.reduce((sum, item) => sum + parseFloat(item.total_sum || '0'), 0);
  }, [apiData]);

  // Calculate max value for YAxis with better rounding for large numbers
  const maxValue = React.useMemo((): number => {
    if (!chartData || !chartData.length) return 6000;

    const maxActual = Math.max(...chartData.map(item => item.actual));

    // For very large values (over 1M), round to nearest 500K
    if (maxActual > 1000000) {
      return Math.ceil(maxActual / 500000) * 500000;
    }

    // For large values (over 100K), round to nearest 100K
    if (maxActual > 100000) {
      return Math.ceil(maxActual / 100000) * 100000;
    }

    // For medium values (over 10K), round to nearest 10K
    if (maxActual > 10000) {
      return Math.ceil(maxActual / 10000) * 10000;
    }

    // For smaller values, round to nearest 1K
    const roundedMax = Math.ceil(maxActual / 1000) * 1000;
    return roundedMax > 6000 ? roundedMax : 6000;
  }, [chartData]);

  // Generate ticks for YAxis with better handling of large data ranges
  const generateTicks = (max: number): number[] => {
    // For very large values (like 2.1M), use fewer steps for readability
    if (max > 1000000) {
      return [0, max * 0.25, max * 0.5, max * 0.75, max];
    }

    // For medium values, use standard steps
    if (max > 10000) {
      const step = max / 4;
      return [0, step, step * 2, step * 3, max];
    }

    // For smaller values, use more granular steps
    return [0, max * 0.2, max * 0.4, max * 0.6, max * 0.8, max];
  };

  // Format number with thousand separators and shortening for large values
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1);
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1).replace('.', ',') + ' тыс';
    }
    return num.toLocaleString('ru-RU');
  };

  // Format Y-axis labels
  const formatYAxisLabel = (value: number): string => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1).replace('.', ',') + ' млн c';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(0) + ' тыс c';
    }
    return value + ' c';
  };

  // Get period text based on selected period
  const getPeriodText = (): string => {
    switch (period) {
      case 'day':
        return '24 часов';
      case 'week':
        return 'неделю';
      case 'month':
        return 'месяц';
      default:
        return '24 часов';
    }
  };

  return (
    <div className='h-full w-full rounded-xl bg-[#171928] p-6 shadow'>
      <div className='mb-6 flex items-center justify-between'>
        <div className={'flex items-center gap-10'}>
          <div className='text-[20px] text-white'>Доход в период {getPeriodText()}</div>
          <div className='text-[32px] font-semibold text-[#0A63F0]'>
            + {totalIncome.toLocaleString('ru-RU').replace(',', ' ')} сом
          </div>
        </div>
        <TabSwitcher paramName={'revenuePeriod'} tabArr={tabsArr} />
      </div>

      <div className='h-[350px]'>
        {isLoading ? (
          <div className='flex h-full items-center justify-center text-white'>Загрузка...</div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={chartData} barGap={0}>
              <CartesianGrid vertical={false} stroke='#1E2737' />
              <XAxis
                dataKey='date'
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#4B5563', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#4B5563', fontSize: 12 }}
                domain={[0, maxValue]}
                ticks={generateTicks(maxValue)}
                tickFormatter={formatYAxisLabel}
              />
              <Tooltip
                cursor={false}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const value = payload[0].value as number;
                    return (
                      <div className='rounded bg-[#0066FF] px-3 py-1 text-white'>
                        {value.toLocaleString('ru-RU').replace(',', ' ')} сом
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey='actual'
                fill='#0066FF'
                shape={(props: any) => <CustomBar {...props} projected={false} />}
                barSize={40}
              />
              <Bar
                dataKey='projected'
                fill='#0066FF'
                shape={(props: any) => <CustomBar {...props} projected={true} />}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className='flex h-full items-center justify-center text-white'>
            Нет данных для отображения
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueChart;
