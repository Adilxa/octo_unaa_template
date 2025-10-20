import $api from '@/api/http';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import PackagesCard from '@/components/ui/packages-card';

const fetchCategories = async () => {
  const res = await $api.get('packages/package-categories/');
  return res.data;
};

const fetchPackegeList = async (id: any) => {
  const res = await $api.get(`/packages/package-categories/${id}/packages/?is_active=true`);
  return res.data;
};

const PackagesInfo = () => {
  const { data: categories, isLoading: isLoadingCategories } = useQuery<any>({
    queryKey: ['categories'],
    queryFn: () => fetchCategories(),
  });

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Состояние для хранения выбранной категории

  const { data: packageList, isLoading: packageLoading } = useQuery({
    queryKey: ['packageList', selectedCategory],
    queryFn: () => fetchPackegeList(selectedCategory),
  });

  console.log(packageList);

  useEffect(() => {
    if (categories) {
      setSelectedCategory(categories[0]?.id);
    }
  }, [isLoadingCategories, categories]);

  console.log(selectedCategory);

  // Если данные загружаются, показываем лоадер
  if (selectedCategory == null && packageLoading) return <p>Loading...</p>;

  // Фильтруем данные по выбранной категории
  // const filteredData = data;

  return (
    <div>
      {/* Кнопки для выбора категории */}
      <div className='mb-5 flex gap-[36px]'>
        {categories?.map((el: any) => (
          <button
            key={el.id}
            onClick={() => setSelectedCategory(el.id)}
            className={`px-4 py-2 ${selectedCategory === el.id ? 'align-middle text-[32px] leading-[32px] tracking-[0.4px] text-white' : 'align-middle text-[32px] leading-[32px] tracking-[0.4px] text-[#71717A]'}`}
          >
            {el.name}
          </button>
        ))}
      </div>

      {/* Отображение данных */}
      <main className='grid grid-cols-4 gap-5 rounded-xl bg-[#171928] p-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
        {packageList?.map((item: any) => <PackagesCard {...item} key={item.id} />)}
      </main>
    </div>
  );
};

export default PackagesInfo;
