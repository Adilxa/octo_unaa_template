import $api from '@/api/http';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import PackagesCard from '@/components/ui/packages-card';

const fetchCategories = async () => {
  const res = await $api.get('packages/package-categories/');
  return res.data;
};

const fetchPackegeList = async (id: any) => {
  const res = await $api.get(`/packages/package-categories/${id}/packages/?is_active=true`);
  return res.data;
};

const deletePackageCategory = async (id: any) => {
  const res = await $api.delete(`/packages/package-categories/${id}/`);
  return res.data;
};

const PackagesInfo = () => {
  const queryClient: any = useQueryClient();

  const { data: categories, isLoading: isLoadingCategories } = useQuery<any>({
    queryKey: ['categories'],
    queryFn: () => fetchCategories(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: any) => deletePackageCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      queryClient.invalidateQueries(['packagesCategoriesList']);
      queryClient.invalidateQueries(['packageList']);
      toast('Категория успешно удалена');

      // Проверяем, остались ли еще категории после удаления
      const remainingCategories = categories?.filter((cat: any) => cat.id !== categoryToDelete);

      if (remainingCategories && remainingCategories.length > 0) {
        // Если остались категории, выбираем первую
        setSelectedCategory(remainingCategories[0]?.id);
      } else {
        // Если категорий не осталось, сбрасываем выбранную категорию
        setSelectedCategory(null);
      }

      setAlertOpen(false);
      setCategoryToDelete(null);
    },
    onError: error => {
      toast('Ошибка при удалении категории');
      console.error(error);
    },
  });

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);

  const { data: packageList, isLoading: packageLoading } = useQuery({
    queryKey: ['packageList', selectedCategory],
    queryFn: () => fetchPackegeList(selectedCategory),
    enabled: !!selectedCategory, // Запрос выполняется только если есть выбранная категория
  });

  useEffect(() => {
    if (categories && categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]?.id);
    }
  }, [categories, selectedCategory]);

  const handleDeleteClick = (categoryId: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setCategoryToDelete(categoryId);
    setAlertOpen(true);
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      deleteMutation.mutate(categoryToDelete);
    }
  };

  // Показываем загрузку только при первой загрузке
  if (isLoadingCategories) return <p>Loading...</p>;

  // Если категорий нет, показываем сообщение
  if (!categories || categories.length === 0) {
    return (
      <div className='flex h-[400px] items-center justify-center'>
        <p className='text-[18px] text-[#71717A]'>Нет доступных категорий</p>
      </div>
    );
  }

  return (
    <div>
      {/* Кнопки для выбора категории */}
      <div className='mb-5 flex gap-[36px]'>
        {categories?.map((el: any) => (
          <div key={el.id} className='flex items-center gap-2'>
            <button
              onClick={() => setSelectedCategory(el.id)}
              className={`px-4 py-2 transition-colors ${
                selectedCategory === el.id
                  ? 'align-middle text-[32px] leading-[32px] tracking-[0.4px] text-white'
                  : 'align-middle text-[32px] leading-[32px] tracking-[0.4px] text-[#71717A]'
              }`}
            >
              {el.name}
            </button>
            {selectedCategory === el.id && (
              <button
                onClick={e => handleDeleteClick(el.id, e)}
                className='rounded-md p-2 text-red-500 transition-colors hover:bg-red-500/10'
                title='Удалить категорию'
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Отображение данных */}
      <main className='grid grid-cols-4 gap-5 rounded-xl bg-[#171928] p-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
        {packageLoading ? (
          <p className='col-span-4 text-center text-[#71717A]'>Загрузка пакетов...</p>
        ) : packageList && packageList.length > 0 ? (
          packageList.map((item: any) => <PackagesCard {...item} key={item.id} />)
        ) : (
          <p className='col-span-4 text-center text-[#71717A]'>Нет доступных пакетов</p>
        )}
      </main>

      {/* Диалог подтверждения удаления */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent className='border border-[#1D3253] bg-[#131520]'>
          <AlertDialogHeader>
            <AlertDialogTitle className='text-white'>Удалить категорию?</AlertDialogTitle>
            <AlertDialogDescription className='text-[#71717A]'>
              Это действие нельзя отменить. Категория будет удалена навсегда. Все пакеты в этой
              категории также могут быть удалены.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className='border border-[#1D3253] bg-transparent text-white hover:bg-[#1D3253]'
              onClick={() => {
                setAlertOpen(false);
                setCategoryToDelete(null);
              }}
            >
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              className='bg-red-500 text-white hover:bg-red-600'
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Удаление...' : 'Удалить'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PackagesInfo;
