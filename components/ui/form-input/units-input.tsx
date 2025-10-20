import $api from '@/api/http';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import React from 'react';
import NewCategoryMaterial from '@/components/action-btns/newCategory';
import { Input } from '@/components/ui/input';
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
  onChange: (value: string) => void;
}

const fetchUnits = async () => {
  const res = await $api.get('/material/units/');
  return res.data;
};

const UnitsInput: React.FC<Props> = ({ title, placeholder, value, onChange }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['units'],
    queryFn: fetchUnits,
  });

  if (isLoading) return <Loader2 className={'spin-in'} />;
  return (
    <div className={'flex items-center justify-between gap-[5rem]'}>
      <h1 className={'w-[60px] text-[14px] font-semibold text-white'}>{title}</h1>
      <div className={'flex w-full items-center gap-5'}>
        <Select onValueChange={onChange} defaultValue={value}>
          <SelectTrigger className={'w-full rounded-[6px] border-[1px] border-[#1D3253] py-5'}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent
            className={
              'rounded-md bg-[#0F111A] shadow-lg' +
              ' max-h-[300px] overflow-y-auto text-white backdrop-blur-sm'
            }
          >
            {data.map((el: any) => (
              <SelectItem
                key={el.id}
                value={el.id}
                className={
                  'px-3 py-2 hover:bg-[#1A2E59] focus:bg-[#1A2E59]' +
                  ' cursor-pointer text-gray-200 transition-colors duration-150 hover:text-white'
                }
              >
                {el.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default UnitsInput;
