import $api from '@/api/http';
import { useQueryClient } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogHeader } from '@/components/ui/dialog';
import FormInput from '@/components/ui/form-input';
import CategoriesInput from '@/components/ui/form-input/CategoriesInput';
import ServiceCategoriesInput from '@/components/ui/form-input/ServiceCategoriesInput';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface ServiceUpdateFormProps {
  serviceId: number;
  initialData: any;
  onClose: () => void;
}

const ServiceUpdateForm: React.FC<ServiceUpdateFormProps> = ({
  serviceId,
  initialData,
  onClose,
}: any) => {
  const queryClient: any = useQueryClient();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [duration, setDuration] = useState('');
  const [price, setPrice] = useState('');
  const [isActive, setIsActive] = useState('');
  const [description, setDescription] = useState('');
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (initialData && open) {
      setName(initialData.name || '');
      setCategory(initialData.category || '');
      setDuration(initialData.duration?.toString() || '');
      setPrice(initialData.price?.toString() || '');
      setIsActive(initialData.is_active ? 'true' : 'false');
      setDescription(initialData.description || '');
    }
  }, [initialData, open]);

  console.log(typeof isActive);
  const updateService = async () => {
    try {
      await $api
        .patch(`/services/${serviceId}/`, {
          name: name,
          category: category,
          duration: parseInt(duration),
          price: parseFloat(price),
          is_active: isActive == 'true' ? true : false,
          description: description,
        })
        .then(data => {
          console.log(isActive);
        });

      // toast.success('Успешно', {
      //   description: 'Услуга успешно обновлена',
      // });
      // window.location.reload()

      await queryClient.invalidateQueries(['servicesList']);
      setOpen(false);
      if (onClose) onClose();
    } catch (e: any) {
      toast.error('Ошибка обновления', {
        description: e.response?.data?.message,
      });
    }
  };

  const handleDialogChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen && onClose) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className={'w-full max-w-[700px] rounded-xl bg-[#131520] px-10 py-10'}>
        <DialogHeader className={'border-b-[1px] border-[#1D3253] pb-5'}>
          <div className={'mb-2 flex items-center justify-between gap-20'}>
            <h1 className={'text-[18px] font-bold'}>Изменить услугу</h1>
            <div className={'flex items-center gap-5'}>
              <Button onClick={updateService} className={'rounded-[4px] bg-[#171928]'}>
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
            placeholder={'Введите название услуги'}
            value={name}
            onChange={setName}
          />
          <ServiceCategoriesInput
            title={'Категория'}
            placeholder={'Выберите категорию'}
            value={category}
            onChange={setCategory}
          />
          <FormInput
            title={'Длительность'}
            placeholder={'Введите длительность в минутах'}
            value={duration}
            onChange={(value: any) => setDuration(value)}
          />
          <FormInput
            title={'Стоимость'}
            placeholder={'Введите стоимость в сомах'}
            value={price}
            onChange={(value: any) => setPrice(value)}
          />
          <div className='flex items-center justify-between gap-[10rem]'>
            <Label className={'w-[60px]'}>Статус</Label>
            <RadioGroup
              value={isActive}
              onValueChange={value => {
                console.log('Selected value:', value); // Проверяем, что приходит
                setIsActive(value);
              }}
              className='flex gap-5'
            >
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='true' id='true' />
                <Label htmlFor='true'>Активный</Label>
              </div>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='false' id='false' />
                <Label htmlFor='false'>Не активный</Label>
              </div>
            </RadioGroup>
          </div>
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

export default ServiceUpdateForm;
