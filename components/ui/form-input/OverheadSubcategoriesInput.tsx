import $api from '@/api/http';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import React from 'react';
import NewCategoryMaterial from '@/components/action-btns/newCategory';
import NewOverheadCategory from '@/components/action-btns/newOverheadCategory';
import NewOverheadSubCategory from '@/components/action-btns/newOverheadSubCategory';
import NewPackageCategory from '@/components/action-btns/newPackageCategory';
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
  category: string;
}

const fetchCategories = async (id: any) => {
  const res = await $api.get(`overhead/subcategories/by-category/${id}/`);
  return res.data;
};

const OverheadSubCategoriesInput: React.FC<Props> = ({
  title,
  placeholder,
  value,
  onChange,
  category,
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ['overheadSubCategoriesList', category],
    queryFn: () => fetchCategories(category),
  });

  console.log(data);

  // if (isLoading) return <Loader2 className={'spin-in'} />;
  return (
    <div className={'grid grid-cols-[120px_1fr] items-start gap-4'}>
      <h1 className={'w-[60px] whitespace-nowrap text-[14px] font-semibold text-white'}>{title}</h1>
      <div className={'flex w-full items-center gap-5'}>
        <Select onValueChange={onChange} defaultValue={value}>
          <SelectTrigger className={'w-full rounded-[6px] border-[1px] border-[#1D3253] py-5'}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className={'bg-[#131520]'}>
            {data?.map((el: any) => (
              <SelectItem key={el.id} value={el.id}>
                {el.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <NewOverheadSubCategory category={category} />
      </div>
    </div>
  );
};

export default OverheadSubCategoriesInput;
