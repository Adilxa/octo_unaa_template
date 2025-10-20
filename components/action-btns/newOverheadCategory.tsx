import $api from '@/api/http';
import { useQueryClient } from '@tanstack/react-query';
import { Check, Plus, X } from 'lucide-react';
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

const NewOverheadCategory = () => {
  const queryClient: any = useQueryClient();
  const [categoryName, setCategoryName] = useState('');

  const createNewCategory = async () => {
    try {
      await $api.post('overhead/categories/', {
        name: categoryName,
      });
      await queryClient.invalidateQueries('overheadCategoriesList');
      toast.success('Успешно', {
        description: 'Вы успешно создали',
      });
    } catch (e: any) {
      console.log(e);
      toast.error('Ошибка', {
        description: e.response?.data?.message,
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className={
            'rounded-[6px] bg-[#0A63F0] px-3 py-5 shadow-[0px_0px_24.7px_0px_rgba(10,99,240,0.5)]'
          }
        >
          <Plus />
        </Button>
      </DialogTrigger>
      <DialogContent className='w-full max-w-[600px] bg-[#131520] px-10 py-10'>
        <DialogHeader className={'border-b-[1px] border-[#1D3253] pb-5'}>
          <DialogTitle>Новая категория</DialogTitle>
        </DialogHeader>
        <div className={'flex items-center gap-5'}>
          <Input
            className={'rounded-[6px] border-[1px] border-[#1D3253] py-5'}
            value={categoryName}
            placeholder={'Категория'}
            onChange={e => setCategoryName(e.target.value)}
          />
          <div className={'flex items-center gap-5'}>
            <Button onClick={() => createNewCategory()} className={'rounded-[4px] bg-[#171928]'}>
              <Check /> Сохранить
            </Button>
            <DialogClose asChild>
              <Button className={'rounded-[4px] bg-[#01030E] text-[#0A63F0] hover:text-white'}>
                <X />
                Отменить
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewOverheadCategory;
