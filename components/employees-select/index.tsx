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
  const res = await $api.get('/employee/employees/');
  return res.data;
};

const EmployeesSelect: React.FC<Props> = ({ title, placeholder, value, onChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['employeeList'],
    queryFn: fetchCategories,
  });

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
      <h1 className='mt-2 w-[60px] whitespace-nowrap text-[14px] font-semibold text-white'>
        {title}
      </h1>
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
            {data?.results.map((el: any) => (
              <SelectItem key={el.id} value={el.id}>
                {el?.first_name} {el?.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default EmployeesSelect;
