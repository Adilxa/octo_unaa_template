// import $api from '@/API/http';
// import { useQuery } from '@tanstack/react-query';
import { DollarSign } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import React from 'react';

interface Props {
  title: string;
  avatar: string;
  money: string;
  info: string;
}

const EmployeeCard: React.FC<Props> = ({ title, avatar, money, info }) => {
  const searchParams = useSearchParams();

  const period = searchParams.get('period') || 'day';
  const start = searchParams.get('start_date') || '';
  const end = searchParams.get('end_date') || '';

  return (
    <div className='group flex min-h-[150px] flex-1 flex-col justify-between gap-1 rounded-xl bg-[#171928] p-6 shadow transition-all duration-300 hover:scale-105 hover:bg-gradient-to-r hover:from-[#0B52C7] hover:to-[#30B4E7]'>
      <div className='flex items-center justify-between text-[#30B4E7] group-hover:text-[#fff]'>
        <h1 className='whitespace-nowrap text-[20px] font-semibold text-white'>{title}</h1>
        <DollarSign width={20} height={20} />
      </div>
      <div className='text-[35px] font-bold text-white'>+{money} сом</div>
      <div className='flex items-center justify-between text-[15px] text-[#71717A] group-hover:text-[#30B4E7]'>
        <h5>{info}</h5>
      </div>
    </div>
  );
};

export default EmployeeCard;
