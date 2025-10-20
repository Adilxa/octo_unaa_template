import $api from '@/api/http';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
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

interface BodyType {
  id: number;
  name: string;
}

const fetchCategories = async () => {
  const res = await $api.get('/shared/car-body-types/');
  return res.data;
};

const CarBodyInput: React.FC<Props> = ({ title, placeholder, value, onChange }) => {
  // Добавляем состояние для отслеживания предыдущего значения
  const [prevValue, setPrevValue] = useState(value);

  const { data, isLoading } = useQuery({
    queryKey: ['carBodyTypes'],
    queryFn: fetchCategories,
  });

  // Обработка внешнего изменения value (например, при автозаполнении)
  useEffect(() => {
    if (value !== prevValue) {
      setPrevValue(value);
      // Проверяем, совпадает ли значение с одним из доступных типов кузова
      if (data && Array.isArray(data) && value) {
        const bodyType = data.find((b: BodyType) => b.id.toString() === value.toString());
        if (bodyType) {
          console.log('Тип кузова установлен автоматически:', bodyType.name);
        }
      }
    }
  }, [value, data, prevValue]);

  if (isLoading) return <Loader2 className={'spin-in'} />;

  return (
    <div className={'grid grid-cols-[120px_1fr] items-start gap-4'}>
      <h1 className={'w-[60px] whitespace-nowrap text-[14px] font-semibold text-white'}>{title}</h1>
      <div className={'flex w-full items-center gap-5'}>
        <Select
          onValueChange={onChange}
          value={value} // Используем value вместо defaultValue для управляемого компонента
        >
          <SelectTrigger
            className={'w-full rounded-[6px] border-[1px] border-[#1D3253] py-5'}
            data-shadcn-select-trigger
            data-car-body='true'
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className={'bg-[#131520]'}>
            {data.map((el: BodyType) => (
              <SelectItem key={el.id} value={el.id.toString()}>
                {el.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default CarBodyInput;
