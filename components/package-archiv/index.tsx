import $api from '@/api/http';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import PackagesCard from '@/components/ui/packages-card';

const fetchPackages = async () => {
  const res = await $api.get('/packages/list/?is_active=false');
  return res.data;
};

const PackageArchive = () => {
  // Состояние для хранения выбранной категории
  const [selectedCategory, setSelectedCategory] = useState<string>('мойка');

  const { data, isLoading } = useQuery({
    queryKey: ['packagesInfo'],
    queryFn: () => fetchPackages(),
  });
  console.log(data);

  // Если данные загружаются, показываем лоадер
  if (isLoading) return <p>Loading...</p>;

  // Фильтруем данные по выбранной категории
  const filteredData = data?.results.filter(
    (item: any) => item.category_name?.toLowerCase() === selectedCategory.toLowerCase(),
  );
  // const filteredData = data;

  return (
    <div>
      {/* Кнопки для выбора категории */}
      <div className='mb-5 flex gap-[36px]'>
        <button
          onClick={() => setSelectedCategory('мойка')}
          className={`px-4 py-2 ${selectedCategory === 'мойка' ? 'align-middle text-[32px] leading-[32px] tracking-[0.4px] text-white' : 'align-middle text-[32px] leading-[32px] tracking-[0.4px] text-[#71717A]'}`}
        >
          Мойка
        </button>
        <button
          onClick={() => setSelectedCategory('хим чистка')}
          className={`px-4 py-2 ${selectedCategory === 'хим чистка' ? 'align-middle text-[32px] leading-[32px] tracking-[0.4px] text-white' : 'align-middle text-[32px] leading-[32px] tracking-[0.4px] text-[#71717A]'}`}
        >
          Хим чистка
        </button>
        <button
          onClick={() => setSelectedCategory('детейлинг')}
          className={`px-4 py-2 ${selectedCategory === 'детейлинг' ? 'align-middle text-[32px] leading-[32px] tracking-[0.4px] text-white' : 'align-middle text-[32px] leading-[32px] tracking-[0.4px] text-[#71717A]'}`}
        >
          Детейлинг
        </button>
      </div>

      {/* Отображение данных */}
      <main className='grid grid-cols-4 gap-5 rounded-xl bg-[#171928] p-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
        {filteredData?.map((item: any) => <PackagesCard {...item} key={item.id} />)}
      </main>
    </div>
  );
};

export default PackageArchive;
