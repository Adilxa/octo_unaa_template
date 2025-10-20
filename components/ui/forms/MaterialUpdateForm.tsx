import $api from '@/api/http';
import { useQueryClient } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogHeader } from '@/components/ui/dialog';
import FormInput from '@/components/ui/form-input';
import CategoriesInput from '@/components/ui/form-input/CategoriesInput';
import UnitsInput from '@/components/ui/form-input/units-input';

const MaterialUpdateForm = ({ materialId, initialData, onClose }: any) => {
  const queryClient: any = useQueryClient();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('');
  const [price, setPrice] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [description, setDescription] = useState('');
  const [open, setOpen] = useState(true);

  console.log(initialData);

  useEffect(() => {
    if (initialData && open) {
      setTitle(initialData.name || '');
      setCategory(initialData.category || '');
      setAmount(initialData.stock_quantity || '');
      setUnit(initialData.unit || '');
      setPrice(initialData.unit_price || '');
      setSellPrice(initialData.sell_price || '');
      setDescription(initialData.description || '');
    }
  }, [initialData, open]);

  const updateMaterial = async () => {
    try {
      await $api.put(`material/update/${materialId}/`, {
        name: title,
        category: category,
        unit: unit,
        sell_price: sellPrice,
        description: description,
      });

      toast.success('Успешно', {
        description: 'Материал успешно обновлен',
      });
      await queryClient.invalidateQueries('materialsInstock');
      setOpen(false);
      if (onClose) onClose();
    } catch (e: any) {
      toast.error('Ошибка обновления', {
        description: e.response?.data?.message,
      });
    }
  };

  const handleDialogChange = (isOpen: any) => {
    setOpen(isOpen);
    if (!isOpen && onClose) {
      onClose(); // Close the dialog and reset parent state when clicking outside
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className={'w-full max-w-[700px] rounded-xl bg-[#131520] px-10 py-10'}>
        <DialogHeader className={'border-b-[1px] border-[#1D3253] pb-5'}>
          <div className={'mb-2 flex items-center justify-between gap-20'}>
            <h1 className={'text-[18px] font-bold'}>Изменить материал</h1>
            <div className={'flex items-center gap-5'}>
              <Button onClick={updateMaterial} className={'rounded-[4px] bg-[#171928]'}>
                <Check /> Сохранить
              </Button>
            </div>
          </div>
          <p className={'text-[12px] font-medium text-[#1D3253]'}>
            После изменения информации <br /> обязательно нажмите кнопку сохранить
          </p>
        </DialogHeader>
        <div className={'flex flex-col gap-5'}>
          <FormInput
            title={'Название'}
            placeholder={'Введите название'}
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
          />
          <UnitsInput
            title={'Единица измерения'}
            placeholder={'кг'}
            value={unit}
            onChange={setUnit}
          />
          <FormInput
            title={'Стоимость единицы'}
            placeholder={'Введите сумму за один материал'}
            value={price}
          />
          <FormInput title={'Продаваемая цена'} placeholder={'Цена'} value={sellPrice} />
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

export default MaterialUpdateForm;
