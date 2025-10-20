import $api from '@/api/http';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Search } from 'lucide-react';
import React, { useRef, useState } from 'react';
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
  modelId: string;
}

interface ApiResponse {
  message?: string;
  data: any[];
}

const fetchCategories = async (id: string) => {
  if (!id) return null;
  const res = await $api.get(`/shared/car-models/${id}/`);
  return res.data;
};

const CarModelInput: React.FC<Props> = ({ title, placeholder, value, onChange, modelId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['autoModelList', modelId],
    queryFn: () => fetchCategories(modelId),
    enabled: !!modelId, // Only run the query if modelId exists
  });

  // Handle various data formats that could be returned
  const models = Array.isArray(data) ? data : data?.data || [];
  const hasModels = models.length > 0;

  // Filter models based on search query
  const filteredModels = React.useMemo(() => {
    if (!hasModels) return [];

    if (!searchQuery.trim()) return models;

    const query = searchQuery.toLowerCase();
    return models.filter((model: any) => model.name.toLowerCase().includes(query));
  }, [models, searchQuery, hasModels]);

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

  return (
    <div className='grid grid-cols-[120px_1fr] items-start gap-4'>
      <h1 className='w-[60px] whitespace-nowrap text-[14px] font-semibold text-white'>{title}</h1>
      <div className='flex w-full items-center gap-5'>
        {!modelId ? (
          <div className='w-full rounded-[6px] border-[1px] border-[#1D3253] bg-[#0F111A] p-3 text-[14px] text-gray-500'>
            Сначала выберите марку авто
          </div>
        ) : isLoading ? (
          <div className='flex w-full items-center gap-2 rounded-[6px] border-[1px] border-[#1D3253] bg-[#0F111A] p-3'>
            <Loader2 className='h-4 w-4 animate-spin' />
            <span>Загрузка моделей...</span>
          </div>
        ) : !hasModels ? (
          <div className='w-full rounded-[6px] border-[1px] border-[#1D3253] bg-[#0F111A] p-3 text-[14px] text-gray-500'>
            Нет моделей для выбранной марки
          </div>
        ) : (
          <Select
            onValueChange={onChange}
            value={value === '' ? undefined : value}
            open={isOpen}
            onOpenChange={handleOpenChange}
          >
            <SelectTrigger className='w-full rounded-[6px] border-[1px] border-[#1D3253] py-5'>
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
                    placeholder='Поиск по моделям'
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
                {filteredModels.length > 0 ? (
                  filteredModels.map((model: any) => (
                    <SelectItem key={model.id} value={model.id.toString()} className='py-2'>
                      {model.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className='py-2 text-center text-sm text-gray-400'>
                    {searchQuery ? 'Ничего не найдено' : 'Нет доступных моделей'}
                  </div>
                )}
              </div>
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
};

export default CarModelInput;
