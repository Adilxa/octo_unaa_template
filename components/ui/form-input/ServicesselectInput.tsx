import $api from '@/api/http';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Minus, Plus } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
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
  onChange?: (values: any[]) => void;
}

const fetchCategories = async () => {
  const res = await $api.get('/services/list/', {
    params: {
      size: 1000,
    }
  });
  return res.data;
};

const ServicesSelectInput: React.FC<Props> = ({ title, placeholder, onChange }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['servicesList'],
    queryFn: fetchCategories,
  });

  const [packages, setPackages] = useState<string[]>(['']);

  const handlePackageChange = (index: number, value: string) => {
    const newPackages = [...packages];
    newPackages[index] = value;
    setPackages(newPackages);
    onChange && onChange(newPackages);
  };

  const addPackage = () => {
    setPackages([...packages, '']);
  };

  const removePackage = (index: number) => {
    const newPackages = packages.filter((_, i) => i !== index);
    setPackages(newPackages);
    onChange && onChange(newPackages);
  };

  console.log(data);

  if (isLoading) return <Loader2 className={'spin-in'} />;

  return (
    <div className={'flex flex-col gap-3'}>
      {packages.map((pkg, index) => (
        <div key={index} className={'flex items-center justify-between gap-[10rem]'}>
          <h1 className={'w-[60px] whitespace-nowrap text-[14px] font-semibold text-white'}>
            {title}
          </h1>
          <div className={'flex w-full items-center gap-5'}>
            <Select onValueChange={value => handlePackageChange(index, value)} value={pkg}>
              <SelectTrigger className={'w-full rounded-[6px] border-[1px] border-[#1D3253] py-5'}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent className={'bg-[#131520]'}>
                {data?.results?.map((el: any) => (
                  <SelectItem key={el.id} value={el.id}>
                    {el.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {index === packages.length - 1 ? (
              <Button
                onClick={addPackage}
                className={
                  'rounded-[6px] bg-[#0A63F0] px-3 py-2 shadow-[0px_0px_24.7px_0px_rgba(10,99,240,0.5)]'
                }
              >
                <Plus />
              </Button>
            ) : (
              <Button
                onClick={() => removePackage(index)}
                className={
                  'rounded-[6px] bg-[#0A63F0] px-3 py-2 shadow-[0px_0px_24.7px_0px_rgba(10,99,240,0.5)]'
                }
              >
                <Minus />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ServicesSelectInput;
