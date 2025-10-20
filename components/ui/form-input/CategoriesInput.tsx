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

const fetchMaterialCategories = async () => {
  const res = await $api.get('/material/categories/');
  return res.data;
};

const CategoriesInput: React.FC<Props> = ({ title, placeholder, value, onChange }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['materialCategoriesList'],
    queryFn: fetchMaterialCategories,
  });

  if (isLoading) return <Loader2 className={'spin-in'} />;
  return (
    <div className={'flex items-center justify-between gap-[5rem]'}>
      <h1 className={'w-[60px] whitespace-nowrap text-[14px] font-semibold text-white'}>{title}</h1>
      <div className={'flex w-full items-center gap-5'}>
        <Select onValueChange={onChange} defaultValue={value}>
          <SelectTrigger className={'w-full rounded-[6px] border-[1px] border-[#1D3253] py-5'}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className={'bg-[#131520]'}>
            {data.map((el: any) => (
              <SelectItem key={el.id} value={el.id}>
                {el.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <NewCategoryMaterial />
      </div>
    </div>
  );
};

export default CategoriesInput;
