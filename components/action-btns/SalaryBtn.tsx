import { Wallet, X } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const SalaryBtn = () => {
  const [amount, setAmount] = useState('');

  const employeeData = {
    name: 'Азамат. Кимов',
    phone: '+996 700 123 456',
    position: 'Мойщик',
    availableAmount: '6150 сом',
  };

  return (
    <Dialog>
      <DialogTrigger className='rounded-[6px] bg-[#0A63F0] px-3 py-2 shadow-[0px_0px_24.7px_0px_rgba(10,99,240,0.5)]'>
        <h1 className='flex items-center gap-2'>
          <Wallet />
          Выдать зарплату
        </h1>
      </DialogTrigger>
      <DialogContent className='rounded-lg bg-[#171928] p-10 text-white sm:max-w-[500px]'>
        <DialogHeader className='border-b-[1px] border-[#1D3253] pb-5'>
          <div className='flex items-center justify-between'>
            <h1 className='text-[18px] font-bold'>Зарплата сотрудника</h1>
            <DialogClose asChild>
              <Button className='rounded-[4px] bg-[#01030E] text-[#0A63F0] hover:text-white'>
                <X />
                Закрыть
              </Button>
            </DialogClose>
          </div>
          <p className='text-[12px] font-medium text-[#1D3253]'>После</p>
        </DialogHeader>

        <div className='mt-4'>
          {/* Vertical dividing line */}
          <div className='relative py-6'>
            <div className='relative'>
              {/* ФИО row */}
              <div className='mb-4 flex items-center justify-between'>
                <div className='text-base'>ФИО</div>
                <div className='text-base'>{employeeData.name}</div>
              </div>

              {/* Телефон row */}
              <div className='mb-4 flex items-center justify-between'>
                <div className='text-base'>Телефон</div>
                <div className='text-base'>{employeeData.phone}</div>
              </div>

              {/* Должность row */}
              <div className='mb-4 flex items-center justify-between'>
                <div className='text-base'>Должность</div>
                <div className='text-base'>{employeeData.position}</div>
              </div>

              {/* Доступная сумма к выдаче row */}
              <div className='flex items-center justify-between'>
                <div className='text-base'>Доступная сумма к выдаче</div>
                <div className='text-base'>{employeeData.availableAmount}</div>
              </div>
            </div>
          </div>

          {/* Amount input and submit button */}
          <div className='mt-4 flex items-center gap-4'>
            <Input
              className='flex-1 rounded-[4px] border border-[#1D3253] bg-transparent px-4 py-2 text-white placeholder-gray-500'
              placeholder='Введите сумму'
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
            <Button className='rounded-[4px] bg-[#0A63F0] px-6 py-2 text-white hover:bg-blue-600'>
              Выдать
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SalaryBtn;
