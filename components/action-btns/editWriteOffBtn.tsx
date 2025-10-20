import $api from '@/api/http';
import { useQueryClient } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import FormInput from '@/components/ui/form-input';

const EditWriteOff = ({
  materialId,
  materialName,
  currentStock,
  unit,
  category,
  price,
}: {
  materialId: any;
  materialName: any;
  currentStock: any;
  unit: any;
  category: any;
  price: any;
}) => {
  const queryClient: any = useQueryClient();
  const [writeOffQuantity, setWriteOffQuantity] = useState<any>('');
  const [mateialPrice, setMaterilaPrice] = useState('');
  const [comment, setComment] = useState('');
  const [open, setOpen] = useState(false);

  const handleWriteOff = async () => {
    try {
      await $api.patch(`material/replenished/${materialId}/`, {
        stock_quantity: `${writeOffQuantity}`,
        unit_price: mateialPrice,
      });

      toast.success('Успешно', {
        description: 'Материал успешно пополнен',
      });

      await queryClient.invalidateQueries('materialsInstock');

      // Close the dialog after success
      setOpen(false);

      // Reset form fields
      resetForm();
    } catch (e: any) {
      toast.error('Ошибка пополнения.', {
        description: e.response?.data?.message,
      });
    }
  };

  // Функция для сброса полей формы
  const resetForm = () => {
    setWriteOffQuantity('');
    setMaterilaPrice('');
    setComment('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={
          'rounded-[6px] bg-[#0A63F0] px-3 py-1 shadow-[0px_0px_24.7px_0px_rgba(10,99,240,0.5)] hover:bg-white hover:text-[#0A63F0] group-hover:bg-white group-hover:text-[#0A63F0]'
        }
      >
        Пополнить
      </DialogTrigger>
      <DialogContent className={'w-full max-w-[700px] rounded-xl bg-[#131520] px-10 py-10'}>
        <DialogHeader className={'border-b-[1px] border-[#1D3253] pb-5'}>
          <div className={'mb-2 flex items-center justify-between gap-20'}>
            <h1 className={'text-[18px] font-bold'}>Пополнить материал</h1>
            <div className={'flex items-center gap-5'}>
              <Button onClick={handleWriteOff} className={'rounded-[4px] bg-[#171928]'}>
                <Check /> Пополнить
              </Button>
              <DialogClose asChild>
                <Button variant='ghost' className={'rounded-[4px] bg-[#171928]'}>
                  <X /> Отмена
                </Button>
              </DialogClose>
            </div>
          </div>
          <p className={'text-[12px] font-medium text-[#1D3253]'}>
            После внесения информации <br /> обязательно нажмите кнопку пополнить
          </p>
        </DialogHeader>
        <div className={'flex flex-col gap-5'}>
          <FormInput title={'Название'} value={materialName} />
          <FormInput title={'Категория'} value={category} />
          <FormInput title={'Количество на складе'} value={currentStock} />
          <FormInput title={'Единица измерения'} value={unit} />
          <FormInput title={'Стоимость единицы'} value={price} />
          <FormInput
            title={'Пополнить материал на'}
            placeholder={'Напишите на сколько пополнить материал'}
            value={writeOffQuantity}
            onChange={setWriteOffQuantity}
          />{' '}
          <FormInput
            title={'Стоимость материала'}
            placeholder={'Напишите стоимость материала'}
            value={mateialPrice}
            onChange={setMaterilaPrice}
          />
          <FormInput
            title={'Комментарий'}
            placeholder={'Опциональное поле'}
            value={comment}
            onChange={setComment}
            isTextArea={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditWriteOff;
