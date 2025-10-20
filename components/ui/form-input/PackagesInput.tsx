import $api from '@/api/http';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Minus, Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
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
  carBodyType: any;
}

interface Package {
  id: number;
  name: string;
  body_type: string;
  package_type: string;
}

const fetchCategories = async (id: any) => {
  const res = await $api.get(`/packages/packages/washing/${id}/`);
  return res.data;
};

const PackagesInput: React.FC<Props> = ({ title, placeholder, onChange, carBodyType }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['packagesCategoryList', carBodyType],
    queryFn: () => fetchCategories(carBodyType),
  });

  // State to store packages selected by user
  const [packages, setPackages] = useState<string[]>(['']);

  // Process the API response to get an array of packages
  const processedPackages = React.useMemo(() => {
    if (!data) return [];

    // Check if data is an array
    if (Array.isArray(data)) {
      return data;
    }

    // Check if data has results property and it's an array
    if (data.results && Array.isArray(data.results)) {
      return data.results;
    }

    // If data is an object with numeric keys (like your example)
    if (typeof data === 'object' && !Array.isArray(data)) {
      return Object.values(data);
    }

    return [];
  }, [data]);

  // Log the processed packages for debugging
  useEffect(() => {
    console.log('Original data:', data);
    console.log('Processed packages:', processedPackages);
  }, [data, processedPackages]);

  const handlePackageChange = (index: number, value: string) => {
    const newPackages = [...packages];
    newPackages[index] = value;
    setPackages(newPackages);
    onChange && onChange(newPackages.filter(pkg => pkg !== ''));
  };

  const addPackage = () => {
    setPackages([...packages, '']);
  };

  const removePackage = (index: number) => {
    const newPackages = packages.filter((_, i) => i !== index);
    setPackages(newPackages);
    onChange && onChange(newPackages.filter(pkg => pkg !== ''));
  };

  if (isLoading) return <Loader2 className='animate-spin text-blue-500' />;

  return (
    <div className='flex flex-col gap-3'>
      {packages.map((pkg, index) => (
        <div key={index} className='flex items-center justify-between gap-[10rem]'>
          <h1 className='w-[60px] whitespace-nowrap text-[14px] font-semibold text-white'>
            {index === 0 ? title : ''}
          </h1>
          <div className='flex w-full items-center gap-5'>
            <Select onValueChange={value => handlePackageChange(index, value)} value={pkg}>
              <SelectTrigger className='w-full rounded-[6px] border-[1px] border-[#1D3253] py-5'>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent className='bg-[#131520]'>
                {processedPackages.length > 0 ? (
                  processedPackages.map((pkg: Package) => (
                    <SelectItem key={pkg.id} value={String(pkg.id)}>
                      {pkg.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value='no-packages' disabled>
                    Нет доступных пакетов
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {index === packages.length - 1 ? (
              <Button
                onClick={addPackage}
                className='rounded-[6px] bg-[#0A63F0] px-3 py-2 shadow-[0px_0px_24.7px_0px_rgba(10,99,240,0.5)]'
              >
                <Plus />
              </Button>
            ) : (
              <Button
                onClick={() => removePackage(index)}
                className='rounded-[6px] bg-[#0A63F0] px-3 py-2 shadow-[0px_0px_24.7px_0px_rgba(10,99,240,0.5)]'
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

export default PackagesInput;
