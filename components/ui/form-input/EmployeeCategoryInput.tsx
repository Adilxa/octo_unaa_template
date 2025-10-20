import $api from '@/api/http';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import React from 'react';
import NewEmployeeCategory from '@/components/action-btns/NewEmployeeCategory';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/shadcn/select';

interface Props {
  title: string;
  placeholder: string;
  value: string;
  onChange?: (value: string) => void;
}

const EmployeeCategoriesInput: React.FC<Props> = ({ title, placeholder, value, onChange }) => {
  return (
    <div className={'grid grid-cols-[120px_1fr] items-start gap-4'}>
      <h1 className={'w-[60px] whitespace-nowrap text-[14px] font-semibold text-white'}>{title}</h1>
      <div className={'flex w-full items-center gap-5'}>
        <Select onValueChange={onChange} defaultValue={value}>
          <SelectTrigger className={'w-full rounded-[6px] border-[1px] border-[#1D3253] py-5'}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className={'bg-[#131520]'}>
            <SelectItem value={'washer'}>Мойщик</SelectItem>
            <SelectItem value={'master'}>Мастер</SelectItem>
          </SelectContent>
        </Select>
        {/*<NewEmployeeCategory />*/}
      </div>
    </div>
  );
};

export default EmployeeCategoriesInput;
