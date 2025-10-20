import $api from '@/api/http';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';
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
  value: any;
  onChange?: (value: string) => void;
}

interface Brand {
  id: number;
  name: string;
}

const fetchCategories = async () => {
  const res = await $api.get('/shared/brands/');
  return res.data;
};

const CarInput: React.FC<Props> = ({ title, placeholder, value, onChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  // Добавляем этот эффект, чтобы обнаруживать изменения value извне компонента
  const [prevValue, setPrevValue] = useState(value);

  const { data, isLoading } = useQuery({
    queryKey: ['carList'],
    queryFn: fetchCategories,
  });

  // Обработка внешнего изменения value (например, при автозаполнении)
  useEffect(() => {
    if (value !== prevValue) {
      setPrevValue(value);
      // Проверяем, совпадает ли значение с одним из доступных брендов
      if (data && Array.isArray(data) && value) {
        const brand = data.find((b: Brand) => b.id.toString() === value.toString());
        if (brand) {
          console.log('Бренд установлен автоматически:', brand.name);
        }
      }
    }
  }, [value, data, prevValue]);

  // Filter brands based on search query
  const filteredBrands = React.useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    if (!searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase();
    return data.filter((brand: Brand) => brand.name.toLowerCase().includes(query));
  }, [data, searchQuery]);

  // Handle opening the select dropdown
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset search when closing
      setSearchQuery('');
    } else {
      // Focus the input when opening
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 10);
    }
  };

  if (isLoading) return <Loader2 className='spin-in' />;

  return (
    <div className='grid grid-cols-[120px_1fr] items-start gap-4'>
      <h1 className='w-[60px] whitespace-nowrap text-[14px] font-semibold text-white'>{title}</h1>
      <div className='flex w-full items-center gap-5'>
        <Select
          onValueChange={onChange}
          value={value}
          open={isOpen}
          onOpenChange={handleOpenChange}
        >
          <SelectTrigger
            className='w-full rounded-[6px] border-[1px] border-[#1D3253] py-5'
            data-shadcn-select-trigger
            data-car-brand='true'
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className='bg-[#131520]'>
            <div className='sticky top-0 px-1 pb-2'>
              <div
                className='flex items-center border-b border-[#1D3253] bg-[#131520] py-2'
                onClick={e => e.preventDefault()}
              >
                <Search className='mr-2 h-4 w-4 text-gray-400' />
                <Input
                  ref={inputRef}
                  placeholder='Поиск по брендам'
                  className='border-none bg-transparent text-sm focus-visible:ring-0 focus-visible:ring-offset-0'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onClick={e => e.stopPropagation()}
                  onKeyDown={e => e.stopPropagation()}
                  autoFocus
                />
              </div>
            </div>
            <div className='scrollable max-h-[200px] overflow-y-auto'>
              {filteredBrands.length > 0 ? (
                filteredBrands.map((brand: Brand) => (
                  <SelectItem key={brand.id} value={brand.id.toString()} className='py-2'>
                    {brand.name}
                  </SelectItem>
                ))
              ) : (
                <div className='py-2 text-center text-sm text-gray-400'>No results found</div>
              )}
            </div>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default CarInput;
