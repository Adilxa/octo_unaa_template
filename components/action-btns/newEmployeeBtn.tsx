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
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import FormInput from '@/components/ui/form-input';
import EmployeeCategoriesInput from '@/components/ui/form-input/EmployeeCategoryInput';
import FillialInput from '@/components/ui/form-input/FillialInput';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const NewEmployeeBtn = () => {
  const queryClient: any = useQueryClient();
  const [open, setOpen] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [fillial, setFillial] = useState('');
  const [salary, setSalary] = useState('');
  const [procentageGraph, setProcentageGraph] = useState('');
  const [status, setStatus] = useState('active');
  const [description, setDescription] = useState('');

  // Функция для сброса всех полей формы
  const resetForm = () => {
    setName('');
    setPhone('');
    setPosition('');
    setFillial('');
    setSalary('');
    setProcentageGraph('');
    setStatus('active');
    setDescription('');
  };

  // Проверка валидности формы перед отправкой
  const isFormValid = () => {
    // Проверка имени и фамилии (должны быть минимум 2 части)
    const nameParts = name.trim().split(' ');
    if (nameParts.length < 2 || !nameParts[0] || !nameParts[1]) {
      toast('Введите фамилию и имя через пробел');
      return false;
    }

    // Проверка телефона
    const phoneRegex = /^996\d{9}$/;
    if (!phoneRegex.test(phone)) {
      toast('Телефон должен начинаться с 996 и содержать 12 цифр');
      return false;
    }

    // Проверка, что все обязательные поля заполнены
    if (!position || !fillial || !salary) {
      toast('Заполните все обязательные поля');
      return false;
    }

    return true;
  };

  const onCreateEmployee = async () => {
    // Проверяем валидность формы перед отправкой
    if (!isFormValid()) {
      return;
    }

    try {
      await $api.post('employee/employees/create/', {
        first_name: name.split(' ')[0],
        last_name: name.split(' ')[1],
        phone: phone,
        position: position,
        branch: fillial,
        commission_rate: salary,
        status: status,
        description: description,
      });
      await queryClient.invalidateQueries('employeeList');
      toast('Сотрудник успешно создан');

      // Сбрасываем форму
      resetForm();

      // Закрываем диалоговое окно
      setOpen(false);
    } catch (error: any) {
      toast('Ошибка при создании');
    }
  };

  // Обработчик закрытия диалога
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // При закрытии диалога сбрасываем форму
      resetForm();
    }
  };

  // Обработчик клика для предотвращения всплытия событий
  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Валидация для имени и фамилии
  const nameValidation = {
    required: true,
    customValidate: (value: string) => {
      const parts = value.trim().split(' ');
      return parts.length >= 2 && !!parts[0] && !!parts[1];
    },
    errorMessage: 'Введите фамилию и имя через пробел',
  };

  // Валидация для телефона
  const phoneValidation = {
    required: true,
    pattern: /^996\d{9}$/,
    errorMessage: 'Телефон должен начинаться с 996 и содержать 12 цифр',
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        onClick={() => setOpen(true)}
        className={
          'rounded-[6px] bg-[#0A63F0] px-3 py-2 shadow-[0px_0px_24.7px_0px_rgba(10,99,240,0.5)]'
        }
      >
        + Новый сотрудник
      </DialogTrigger>
      <DialogContent
        className={'w-full max-w-[700px] rounded-xl bg-[#131520] px-10 py-10'}
        onClick={handleDialogClick}
      >
        <DialogHeader className={'border-b-[1px] border-[#1D3253] pb-5'}>
          <div className={'mb-2 flex items-center justify-between gap-20'}>
            <h1 className={'text-[18px] font-bold'}>Новый сотрудник</h1>
            <div className={'flex items-center gap-5'}>
              <Button
                onClick={e => {
                  e.stopPropagation();
                  onCreateEmployee();
                }}
                className={'rounded-[4px] bg-[#171928]'}
              >
                <Check /> Сохранить
              </Button>
              <DialogClose asChild>
                <Button
                  onClick={e => {
                    e.stopPropagation();
                    setOpen(false);
                  }}
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
        <div className={'flex flex-col gap-5'} onClick={e => e.stopPropagation()}>
          <FormInput
            title={'Фамилия Имя'}
            placeholder={'Введите фамилию и имя через пробел'}
            value={name}
            onChange={setName}
            validation={nameValidation}
          />
          <FormInput
            title={'Телефон'}
            placeholder={'Введите номер (начиная с 996)'}
            value={phone}
            onChange={setPhone}
            validation={phoneValidation}
            type='tel'
          />
          <EmployeeCategoriesInput
            title={'Должность'}
            placeholder={'Должность'}
            value={position}
            onChange={setPosition}
          />
          <FillialInput
            title={'Филиал'}
            placeholder={'Филиал'}
            value={fillial}
            onChange={setFillial}
          />
          <FormInput
            title={'Зарплата в процентах %'}
            placeholder={'Введите процент с заказа'}
            value={salary}
            onChange={setSalary}
            validation={{ required: true }}
          />
          <div className='flex items-center justify-between gap-[10rem]'>
            <Label className={'w-[60px]'}>
              Статус <span className='text-red-500'>*</span>
            </Label>
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
            title={'Примечание'}
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

export default NewEmployeeBtn;
