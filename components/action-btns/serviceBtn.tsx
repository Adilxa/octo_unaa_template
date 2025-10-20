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
import ServiceCategoriesInput from '@/components/ui/form-input/ServiceCategoriesInput';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const ServiceBtn = () => {
  const queryClient: any = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('0');
  const [duration, setDuration] = useState('0');
  const [status, setStatus] = useState('active');

  const createService = async () => {
    try {
      await $api
        .post('services/create/', {
          name,
          description,
          price,
          category,
          duration,
          // status,
        })
        .then(() => window.location.reload());

      toast.success('Успешно', {
        description: 'Услуга успешно создана',
      });
      await queryClient.invalidateQueries('maininfoServiceList');
    } catch (e: any) {
      toast.error('Ошибка', {
        description: e.response?.data?.permission,
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger
        className={
          'rounded-[6px] bg-[#0A63F0] px-3 py-2 shadow-[0px_0px_24.7px_0px_rgba(10,99,240,0.5)]'
        }
      >
        + Добавить услугу
      </DialogTrigger>
      <DialogContent className={'w-full max-w-[700px] rounded-xl bg-[#131520] px-10 py-10'}>
        <DialogHeader className={'border-b-[1px] border-[#1D3253] pb-5'}>
          <div className={'mb-2 flex items-center justify-between gap-20'}>
            <h1 className={'text-[18px] font-bold'}>Новая услуга</h1>
            <div className={'flex items-center gap-5'}>
              <Button onClick={() => createService()} className={'rounded-[4px] bg-[#171928]'}>
                <Check /> Сохранить
              </Button>
            </div>
          </div>
          <p className={'text-[12px] font-medium text-[#1D3253]'}>
            После добавления информации <br /> обязательно нажмите кнопку сохранить
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
            title={'Стоимость'}
            placeholder={'Введите сумму за услугу'}
            value={price}
            onChange={setPrice}
          />
          <FormInput
            title={'Длительность (мин.)'}
            placeholder={'Введите длительность услуги'}
            value={duration}
            onChange={setDuration}
          />
          <div className='flex items-center justify-between gap-[10rem]'>
            <Label className={'w-[60px]'}>Статус</Label>
            <RadioGroup
              defaultValue='active'
              value={status}
              onValueChange={setStatus}
              className='flex gap-5'
            >
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='active' id='active' />
                <Label htmlFor='active'>Активный</Label>
              </div>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='inactive' id='inactive' />
                <Label htmlFor='inactive'>Не активный</Label>
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

export default ServiceBtn;
