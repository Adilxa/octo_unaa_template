import $api from '@/api/http';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import React from 'react';
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

const fetchFillials = async () => {
  const res = await $api.get('/shared/branches/');
  return res.data;
};

const FillialInput: React.FC<Props> = ({ title, placeholder, value, onChange }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['fillialList'],
    queryFn: fetchFillials,
  });
  if (isLoading) return <Loader2 className={'spin-in'} />;
  return (
    <div className={'grid grid-cols-[120px_1fr] items-start gap-4'}>
      <h1 className={'w-[60px] whitespace-nowrap text-[14px] font-semibold text-white'}>
        {title} <span className={'text-[#131520]'}>hell</span>
      </h1>
      <div className={'flex w-full items-center gap-5'}>
        <Select onValueChange={onChange} defaultValue={value}>
          <SelectTrigger className={'w-full rounded-[6px] border-[1px] border-[#1D3253] py-5'}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className={'bg-[#131520]'}>
            {data.map((el: any) => (
              <SelectItem key={el.id} value={el.id}>
                {el.address}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default FillialInput;
