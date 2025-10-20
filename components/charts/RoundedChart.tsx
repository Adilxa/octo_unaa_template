import $api from '@/api/http';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import React from 'react';
import { Label, LabelProps, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';

// Define types for the API response
interface ExpenseBreakdownData {
  total_sum: string;
  salary_payout_sum: string;
  salary_payout_percent: number;
  material_sum: string;
  material_percent: number;
  other_sum: string;
  other_percent: number;
}

// Define type for chart data items
interface ChartDataItem {
  name: string;
  value: number;
  percentage: string;
  sum: string;
  fill: string;
}

const fetchExpenseBreakdown = async (
  period: string,
  start?: string,
  end?: string,
): Promise<ExpenseBreakdownData> => {
  const params: Record<string, string> = { period };

  if (start && end) {
    params.start_date = start;
    params.end_date = end;
  }

  const res = await $api.get<ExpenseBreakdownData>('expenses/expense-breakdown/', { params });
  return res.data;
};

// Function to format currency - display full number with spacing
const formatCurrency = (amount: string | number): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return num.toLocaleString('ru-RU').replace(',', ' ') + ' с';
};

const RoundedChart: React.FC = () => {
  const searchParams = useSearchParams();
  const period = searchParams.get('period') || 'week';
  const startDate = searchParams.get('start_date') || '';
  const endDate = searchParams.get('end_date') || '';

  const { data: expenseData, isLoading } = useQuery({
    queryKey: ['expenseBreakdown', period, startDate, endDate],
    queryFn: () => fetchExpenseBreakdown(period, startDate, endDate),
  });

  // Default empty data while loading
  const chartData: ChartDataItem[] = [];
  let totalExpense = '0';

  if (expenseData && !isLoading) {
    totalExpense = expenseData.total_sum;

    // Transform the API data into the format needed for the chart
    chartData.push({
      name: 'Материалы',
      value: expenseData.material_percent,
      percentage: `${Math.round(expenseData.material_percent)}%`,
      // Fix: Show the actual sum, not just the first digit
      sum: formatCurrency(expenseData.material_sum),
      fill: '#0066FF',
    });

    chartData.push({
      name: 'Сотрудники',
      value: expenseData.salary_payout_percent,
      percentage: `${Math.round(expenseData.salary_payout_percent)}%`,
      sum: formatCurrency(expenseData.salary_payout_sum),
      fill: '#00D1FF',
    });

    chartData.push({
      name: 'Услуги',
      value: expenseData.other_percent,
      percentage: `${Math.round(expenseData.other_percent)}%`,
      // Fix: Show the actual sum, not just the first digit
      sum: formatCurrency(expenseData.other_sum),
      fill: '#FFFFFF',
    });
  }

  // Format the total expense for display
  const formattedTotalExpense = Number(totalExpense).toLocaleString('ru-RU').replace(',', ' ');

  return (
    <Card className='h-full w-full rounded-xl bg-[#171928] p-6 shadow'>
      <div className='mb-4 flex items-start justify-between'>
        <div className={'flex w-full items-center justify-between'}>
          <div className='text-[20px] text-gray-200'>Операционные расходы</div>
          <div className='text-2xl text-[20px] font-semibold text-[#0A63F0]'>
            {formattedTotalExpense} с
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
                        {formattedTotalExpense}
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
                {item.percentage} • {item.sum}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default RoundedChart;
