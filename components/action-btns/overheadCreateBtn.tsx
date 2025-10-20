import $api from '@/api/http';
import { useQueryClient } from '@tanstack/react-query';
import { Check, Plus, X } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import NewOverheadCategory from '@/components/action-btns/newOverheadCategory';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import FormInput from '@/components/ui/form-input';
import OverheadCategoriesInput from '@/components/ui/form-input/OverheadCategoriesInput';
import OverheadSubCategoriesInput from '@/components/ui/form-input/OverheadSubcategoriesInput';
import PackagesCategoriesInput from '@/components/ui/form-input/PackagesCategoriesInput';

const OverheadCreateBtn = () => {
  const [category, setCategory] = useState<any>('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [subCategory, setSubcategory] = useState<any>('');
  const [open, setOpen] = useState(false);

  const queryClient: any = useQueryClient();

  // Валидация полей перед отправкой формы
  const validateForm = () => {
    // Проверка категории
    if (!category) {
      toast.error('Выберите категорию');
      return false;
    }

    // Проверка подкатегории, если выбрана категория с id=2
    if (category == 2 && !subCategory) {
      toast.error('Выберите подкатегорию');
      return false;
    }

    // Проверка суммы
    if (!summary) {
      toast.error('Введите сумму');
      return false;
    }

    // Проверка, что сумма - это число
    if (isNaN(Number(summary))) {
      toast.error('Сумма должна быть числом');
      return false;
    }

    return true;
  };

  const onCreateOverhead = async () => {
    // Проверка валидности формы
    if (!validateForm()) {
      return;
    }

    const initObj: any = {
      category: category,
      amount: summary,
      description: description,
      subcategory: subCategory,
    };

    try {
      await $api.post('overhead/create/', {
        ...initObj,
      });
      await queryClient.invalidateQueries(['expensesList']);
      toast.success('Успешно создано');

      // Сброс формы и закрытие диалога после успешного создания
      resetForm();
      setOpen(false);
    } catch (e: any) {
      toast.error('Ошибка при создании');
    }
  };

  // Сброс формы
  const resetForm = () => {
    setCategory('');
    setSummary('');
    setDescription('');
    setSubcategory('');
  };

  // Обработчик закрытия диалога
  const handleDialogClose = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setOpen(true)}
          className={
            'flex items-center gap-1 rounded-[6px] bg-[#0A63F0] px-3 py-5 shadow-[0px_0px_24.7px_0px_rgba(10,99,240,0.5)]'
          }
        >
          <Plus />
          Новая запись
        </Button>
      </DialogTrigger>
      <DialogContent className={'w-full max-w-[600px] bg-[#131520] px-10 py-10'}>
        <DialogHeader className={'border-b-[1px] border-[#1D3253] pb-5'}>
          <div className={'mb-2 flex items-center justify-between gap-20'}>
            <h1 className={'text-[18px] font-bold'}>Новая запись</h1>
            <div className={'flex items-center gap-5'}>
              <Button onClick={() => onCreateOverhead()} className={'rounded-[4px] bg-[#171928]'}>
                <Check /> Сохранить
              </Button>
              <DialogClose asChild>
                <Button
                  onClick={() => setOpen(false)}
                  className={'rounded-[4px] bg-[#01030E] text-[#0A63F0] hover:text-white'}
                >
                  <X />
                  Отменить
                </Button>
              </DialogClose>
            </div>
          </div>
          <p className={'text-[12px] font-medium text-[#1D3253]'}>
            После добавления информации <br /> обязательно нажмите кнопку сохранить
          </p>
        </DialogHeader>
        <div className={'flex flex-col gap-5'}>
          <OverheadCategoriesInput
            title={'Категория *'}
            placeholder={'Выберите категорию'}
            value={category}
            onChange={setCategory}
          />
          <OverheadSubCategoriesInput
            title={'Подкатегория *'}
            placeholder={'Выберите подкатегорию'}
            value={subCategory}
            onChange={setSubcategory}
            category={category}
          />
          <FormInput
            title={'Сумма **'}
            placeholder={'Введите сумму'}
            value={summary}
            onChange={setSummary}
            validation={{
              required: true,
              pattern: /^[0-9]+(\.[0-9]{1,2})?$/,
              errorMessage: 'Введите корректную сумму (например: 1000 или 1000.50)',
            }}
            type='text'
          />
          <FormInput
            title={'Описание'}
            placeholder={'Опциональное поле'}
            value={description}
            onChange={setDescription}
            isTextArea={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OverheadCreateBtn;
