import $api from '@/api/http';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Wallet, X } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogPortal,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const fetchEmployeeSalary = async (id: any) => {
  const res = await $api.get(`employee/employees/${id}/`);
  return res.data;
};

const EmployeeSalaryBtn = ({ id }: { id: any }) => {
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState('');
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  // Query for fetching employee data
  const { data, isLoading } = useQuery({
    queryKey: ['employeeSalary', id],
    queryFn: () => fetchEmployeeSalary(id),
    enabled: open, // Only fetch when dialog is open
  });

  // Mutation for giving salary
  const salaryMutation = useMutation({
    mutationFn: async () => {
      // Add amount as payload if API requires it
      return await $api.put(`employee/employee/${id}/payout/`, {
        amount: parseFloat(amount.replace(/\s+/g, '').replace(',', '.')),
      });
    },
    onSuccess: () => {
      toast.success('Сотрудник получил зарплату успешно');
      queryClient.invalidateQueries({ queryKey: ['employeeSalary', id] });
      setOpen(false); // Close dialog on success
      setAmount(''); // Reset form
    },
    onError: () => {
      toast.error('Сотрудник не получил зарплату');
    },
  });

  const validateAmount = (value: any) => {
    // Clear previous error
    setAmountError('');

    // Check if empty
    if (!value.trim()) {
      setAmountError('Сумма обязательна');
      return false;
    }

    // Convert to number and validate
    const numValue = parseFloat(value.replace(/\s+/g, '').replace(',', '.'));

    if (isNaN(numValue)) {
      setAmountError('Введите корректное число');
      return false;
    }

    if (numValue <= 0) {
      setAmountError('Сумма должна быть больше нуля');
      return false;
    }

    // Check if available amount is sufficient
    const availableAmount = data?.salary || 0;
    if (numValue > availableAmount) {
      setAmountError('Сумма превышает доступную');
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (validateAmount(amount)) {
      salaryMutation.mutate();
    }
  };

  // Format available amount with currency
  const formatAvailableAmount = (amount: any) => {
    if (!amount && amount !== 0) return '—';
    return `${amount} сом`;
  };

  // Handle dialog open/close
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setAmount('');
      setAmountError('');
    }
  };

  // Stop propagation for all clicks inside the dialog
  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Handle close button click
  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button onClick={e => e.stopPropagation()}>Выдать зарплату</button>
      </DialogTrigger>
      <DialogPortal>
        <DialogContent
          className='rounded-lg bg-[#171928] p-10 text-white sm:max-w-[500px]'
          onClick={handleDialogClick}
        >
          <DialogHeader className='border-b-[1px] border-[#1D3253] pb-5'>
            <div className='flex items-center justify-between'>
              <h1 className='text-[18px] font-bold'>Зарплата сотрудника</h1>
              <DialogClose asChild>
                <Button
                  className='rounded-[4px] bg-[#01030E] text-[#0A63F0] hover:text-white'
                  onClick={handleCloseClick}
                >
                  <X />
                  Закрыть
                </Button>
              </DialogClose>
            </div>
            <p className='text-[12px] font-medium text-[#1D3253]'>После</p>
          </DialogHeader>

          {isLoading ? (
            <div className='flex items-center justify-center py-8'>
              <div className='h-6 w-6 animate-spin rounded-full border-2 border-[#0A63F0] border-t-transparent'></div>
            </div>
          ) : data ? (
            <div className='mt-4' onClick={e => e.stopPropagation()}>
              {/* Vertical dividing line */}
              <div className='relative py-6'>
                <div className='relative'>
                  {/* ФИО row */}
                  <div className='mb-4 flex items-center justify-between'>
                    <div className='text-base'>ФИО</div>
                    <div className='text-base'>
                      {data.first_name} {data.last_name}
                    </div>
                  </div>

                  {/* Телефон row */}
                  <div className='mb-4 flex items-center justify-between'>
                    <div className='text-base'>Телефон</div>
                    <div className='text-base'>{data.phone || '—'}</div>
                  </div>

                  {/* Должность row */}
                  <div className='mb-4 flex items-center justify-between'>
                    <div className='text-base'>Должность</div>
                    <div className='text-base'>
                      {data.position === 'master' ? 'Мастер' : 'Мойщик'}
                    </div>
                  </div>

                  {/* Доступная сумма к выдаче row */}
                  <div className='flex items-center justify-between'>
                    <div className='text-base'>Доступная сумма к выдаче</div>
                    <div className='text-base'>{formatAvailableAmount(data.salary)}</div>
                  </div>
                </div>
              </div>

              {/* Amount input and submit button */}
              <div className='mt-4'>
                <div className='flex flex-col'>
                  <div className='flex items-center gap-4'>
                    <Input
                      className='flex-1 rounded-[4px] border border-[#1D3253] bg-transparent px-4 py-2 text-white placeholder-gray-500'
                      placeholder='Введите сумму'
                      value={amount}
                      onChange={e => {
                        setAmount(e.target.value);
                        if (amountError) validateAmount(e.target.value);
                      }}
                      onClick={e => e.stopPropagation()}
                    />
                    <Button
                      className='rounded-[4px] bg-[#0A63F0] px-6 py-2 text-white hover:bg-blue-600'
                      onClick={handleSubmit}
                      disabled={salaryMutation.isPending}
                    >
                      {salaryMutation.isPending ? (
                        <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
                      ) : (
                        'Выдать'
                      )}
                    </Button>
                  </div>
                  {amountError && <p className='mt-1 text-sm text-red-500'>{amountError}</p>}
                </div>
              </div>
            </div>
          ) : (
            <div className='py-4 text-center text-gray-400'>
              Не удалось загрузить данные сотрудника
            </div>
          )}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default EmployeeSalaryBtn;
