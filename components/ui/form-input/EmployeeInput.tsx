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
  value: any;
  onChange?: (value: string) => void;
}

const fetchCategories = async () => {
  const res = await $api.get('/employee/employees/');
  return res.data;
};

const EmployeeInput: React.FC<Props> = ({ title, placeholder, value, onChange }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['employeeListInput'],
    queryFn: fetchCategories,
  });
  if (isLoading) return <Loader2 className={'spin-in'} />;
  return (
    <div className={'flex items-center justify-between gap-[10rem]'}>
      <h1 className={'w-[60px] whitespace-nowrap text-[14px] font-semibold text-white'}>{title}</h1>
      <div className={'flex w-full items-center gap-5'}>
        <Select onValueChange={onChange} defaultValue={value}>
          <SelectTrigger className={'w-full rounded-[6px] border-[1px] border-[#1D3253] py-5'}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className={'bg-[#131520]'}>
            {data.map((el: any) => (
              <SelectItem key={el.id} value={el.id}>
                {el.first_name} {el.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default EmployeeInput;
