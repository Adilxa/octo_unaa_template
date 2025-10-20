import $api from '@/api/http';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import NewCategoryMaterial from '@/components/action-btns/newCategory';
import NewServiceSategory from '@/components/action-btns/newServiceSategory';
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

const fetchMaterialCategories = async () => {
  const res = await $api.get('/services/service-categories/');
  return res.data;
};

const ServiceCategoriesInput: React.FC<Props> = ({ title, placeholder, value, onChange }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['serviceCategoriesList'],
    queryFn: fetchMaterialCategories,
  });

  const [selectedLabel, setSelectedLabel] = useState<string>('');

  useEffect(() => {
    if (data && value) {
      const selectedItem = data.find((item: any) => item.id.toString() === value);
      if (selectedItem) {
        setSelectedLabel(selectedItem.name);
      } else {
        setSelectedLabel('');
      }
    } else {
      setSelectedLabel('');
    }
  }, [data, value]);

  if (isLoading) return <Loader2 className={'spin-in'} />;

  const selectValue = value === '' ? undefined : value;

  return (
    <div className={'grid grid-cols-[120px_1fr] items-start gap-4'}>
      <h1 className={'w-[60px] whitespace-nowrap text-[14px] font-semibold text-white'}>{title}</h1>
      <div className={'flex w-full items-center gap-5'}>
        <div className='relative w-full'>
          <Select onValueChange={onChange} value={selectValue}>
            <SelectTrigger className={'w-full rounded-[6px] border-[1px] border-[#1D3253] py-5'}>
              {selectedLabel ? (
                <span>{selectedLabel}</span>
              ) : (
                <span className='text-gray-400'>Выберите категорию</span>
              )}
            </SelectTrigger>
            <SelectContent className={'bg-[#131520]'}>
              {data?.length > 0 ? (
                data.map((el: any) => (
                  <SelectItem key={el.id} value={el.id.toString()}>
                    {el.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem disabled value='empty'>
                  Нет доступных категорий
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <NewServiceSategory />
      </div>
    </div>
  );
};

export default ServiceCategoriesInput;
