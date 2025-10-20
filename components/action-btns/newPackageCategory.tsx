import $api from '@/api/http';
import { useQueryClient } from '@tanstack/react-query';
import { Check, LoaderCircle, Plus, X } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const NewPackageCategory = () => {
  const queryClient: any = useQueryClient();
  const [categoryName, setCategoryName] = useState('');
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const createNewCategory = async () => {
    if (!categoryName.trim()) {
      toast.error('Ошибка', {
        description: 'Введите название категории',
      });
      return;
    }

    setIsLoading(true);
    try {
      await $api.post('packages/package-categories/', {
        name: categoryName,
      });
      await queryClient.invalidateQueries('packagesCategoriesList');
      toast.success('Успешно', {
        description: 'Вы успешно создали категорию',
      });
      setOpen(false);
      setCategoryName('');
    } catch (e: any) {
      console.log(e);
      toast.error('Ошибка', {
        description: e.response?.data?.message || 'Не удалось создать категорию',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset form when closing
      setCategoryName('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          className={
            'rounded-[6px] bg-[#0A63F0] px-3 py-5 shadow-[0px_0px_24.7px_0px_rgba(10,99,240,0.5)]'
          }
          onClick={() => setOpen(true)}
        >
          <Plus />
        </Button>
      </DialogTrigger>
      <DialogContent className='w-full max-w-[600px] bg-[#131520] px-10 py-10'>
        <DialogHeader className={'border-b-[1px] border-[#1D3253] pb-5'}>
          <DialogTitle>Новая категория</DialogTitle>
        </DialogHeader>
        <div className={'mt-5 flex flex-col gap-5 sm:flex-row sm:items-center'}>
          <Input
            className={'rounded-[6px] border-[1px] border-[#1D3253] py-5'}
            value={categoryName}
            placeholder={'Категория'}
            onChange={e => setCategoryName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !isLoading) {
                createNewCategory();
              }
            }}
            disabled={isLoading}
          />
          <div className={'flex items-center gap-5'}>
            <Button
              onClick={() => createNewCategory()}
              className={'rounded-[4px] bg-[#171928]'}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoaderCircle className='mr-2 h-4 w-4 animate-spin' /> Создание...
                </>
              ) : (
                <>
                  <Check className='mr-2' /> Сохранить
                </>
              )}
            </Button>
            <DialogClose asChild>
              <Button
                className={'rounded-[4px] bg-[#01030E] text-[#0A63F0] hover:text-white'}
                disabled={isLoading}
              >
                <X className='mr-2' />
                Отменить
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewPackageCategory;
