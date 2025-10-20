import React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import TabSwitcher from '@/components/ui/tabs/index';

const data = [
  { date: '21.01', actual: 0, projected: 1000 },
  { date: '22.01', actual: 6000, projected: 0 },
  { date: '23.01', actual: 0, projected: 1500 },
  { date: '24.01', actual: 2000, projected: 0 },
  { date: '25.01', actual: 0, projected: 5000 },
  { date: '26.01', actual: 3000, projected: 0 },
  { date: '27.01', actual: 0, projected: 3200 },
  { date: '28.01', actual: 4200, projected: 0, isHighlighted: true, tooltipValue: '1 235' },
  { date: '29.01', actual: 0, projected: 3000 },
  { date: '30.01', actual: 1000, projected: 0 },
  { date: '31.01', actual: 0, projected: 4500 },
  { date: '01.02', actual: 3200, projected: 0 },
];

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

const CustomBar = (props: any) => {
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

const BaseChart = () => {
  return (
    <div className='h-full w-full rounded-xl bg-[#171928] p-6 shadow'>
      <div className='mb-6 flex items-center justify-between'>
        <div className={'flex items-center gap-10'}>
          <div className='text-[20px] text-white'>Доход в период 24 часов</div>
          <div className='text-[32px] font-semibold text-[#0A63F0]'>+3 464 сом</div>
        </div>
        <TabSwitcher tabArr={tabsArr} />
      </div>

      <div className='h-[350px]'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={data} barGap={0}>
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
              domain={[0, 6000]}
              ticks={[0, 1500, 3000, 4500, 6000]}
              tickFormatter={value => `${value} c`}
            />
            <Tooltip
              cursor={false}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const value = payload[0].value;
                  return (
                    <div className='rounded bg-[#0066FF] px-3 py-1 text-white'>{value} сом</div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey='actual'
              fill='#0066FF'
              shape={<CustomBar projected={false} />}
              barSize={40}
            />
            <Bar
              dataKey='projected'
              fill='#0066FF'
              shape={<CustomBar projected={true} />}
              barSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BaseChart;
