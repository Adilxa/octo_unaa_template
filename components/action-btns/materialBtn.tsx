import $api from '@/api/http';
import { useQueryClient } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import FormInput from '@/components/ui/form-input';
import CategoriesInput from '@/components/ui/form-input/CategoriesInput';
import UnitsInput from '@/components/ui/form-input/units-input';

const MaterialBtn = () => {
  const queryClient: any = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = React.useState<string>('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = React.useState('');
  const [unit, setUnit] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [sellPrice, setSellPrice] = React.useState('');
  const [minimalAmount, setMinimalAmount] = React.useState('');
  const [description, setDescription] = React.useState('');

  console.log(amount);

  const createMaterial = async () => {
    try {
      await $api.post('material/create/', {
        sell_price: sellPrice,
        name: title,
        description,
        stock_quantity: amount,
        unit_price: price,
        min_stock: minimalAmount,
        category: category,
        unit: unit,
      });
      toast.success('Успешно', {
        description: 'Вы успешно создали',
      });
      await queryClient.invalidateQueries('materialsInstock');
      // Закрываем модальное окно после успешного запроса
      setOpen(false);

      // Сбрасываем поля формы
      resetForm();
    } catch (e: any) {
      toast.error('Ошибка входа', {
        description: e.response?.data?.message,
      });
    }
  };

  // Функция для сброса полей формы
  const resetForm = () => {
    setTitle('');
    setCategory('');
    setAmount('');
    setUnit('');
    setPrice('');
    setSellPrice('');
    setMinimalAmount('');
    setDescription('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={
          'rounded-[6px] bg-[#0A63F0] px-3 py-2 shadow-[0px_0px_24.7px_0px_rgba(10,99,240,0.5)]'
        }
      >
        + Добавить материал
      </DialogTrigger>
      <DialogContent className={'w-full max-w-[700px] rounded-xl bg-[#131520] px-10 py-10'}>
        <DialogHeader className={'border-b-[1px] border-[#1D3253] pb-5'}>
          <div className={'mb-2 flex items-center justify-between gap-20'}>
            <h1 className={'text-[18px] font-bold'}>Новый материал</h1>
            <div className={'flex items-center gap-5'}>
              <Button onClick={() => createMaterial()} className={'rounded-[4px] bg-[#171928]'}>
                <Check /> Сохранить
              </Button>
              <DialogClose asChild>
                <Button variant='ghost' className={'rounded-[4px] bg-[#171928]'}>
                  <X /> Отмена
                </Button>
              </DialogClose>
            </div>
          </div>
          <p className={'text-[12px] font-medium text-[#1D3253]'}>
            После добавления информации <br /> обязательно нажмите кнопку сохранить
          </p>
        </DialogHeader>
        <div className={'flex flex-col gap-5'}>
          <FormInput
            title={'Название'}
            placeholder={'Введите название '}
            value={title}
            onChange={setTitle}
          />
          <CategoriesInput
            title={'Категория'}
            placeholder={'Выберите категорию'}
            value={category}
            onChange={setCategory}
          />
          <FormInput
            title={'Количество на складе'}
            placeholder={'Введите количество материала'}
            value={amount}
            onChange={setAmount}
          />
          <UnitsInput
            title={'Единица измерения'}
            placeholder={'Выберите единицу измерения'}
            value={unit}
            onChange={setUnit}
          />
          <FormInput
            title={'Стоимость единицы'}
            placeholder={'Введите сумму за один материал'}
            value={price}
            onChange={setPrice}
          />
          <FormInput
            title={'Минимальный запас'}
            placeholder={'Введите точный  запас для пополнения'}
            value={minimalAmount}
            onChange={setMinimalAmount}
          />
          <FormInput
            title={'Продаваемая цена'}
            placeholder={'Цена'}
            value={sellPrice}
            onChange={setSellPrice}
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

export default MaterialBtn;
