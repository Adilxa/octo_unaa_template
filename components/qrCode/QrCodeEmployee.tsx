import $api from '@/api/http';
import { useMutation, useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogPortal,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

// Define types for API responses
interface EmployeeData {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  branch_name?: string;
  position?: string;
  commission_rate?: number;
}

interface PasswordData {
  employee_id: number;
  first_name: string;
  last_name: string;
  phone: string;
  new_password: string;
}

// Function to fetch employee details
const fetchEmployeeDetails = async (id: number | string | null): Promise<EmployeeData | null> => {
  if (!id) return null;
  const res = await $api.get<EmployeeData>(`employee/employees/${id}/`);
  return res.data;
};

// Function to generate password
const generatePassword = async (id: number | string): Promise<PasswordData> => {
  const res = await $api.post<PasswordData>(`employee/employees/reset-password/`, {
    employee_id: id,
  });
  return res.data;
};

interface EmployeeDetailsProps {
  id: number | string | null;
}

const QrCodeEmployee: React.FC<EmployeeDetailsProps> = ({ id }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [passwordData, setPasswordData] = useState<PasswordData | null>(null);

  // Fetch employee data using React Query when dialog is open
  const { data: employee, isLoading } = useQuery({
    queryKey: ['employeeDetails', id],
    queryFn: () => fetchEmployeeDetails(id),
    enabled: open && !!id, // Only fetch when dialog is open and ID is provided
  });

  // Set up mutation for password generation
  const passwordMutation = useMutation({
    mutationFn: (employeeId: number | string) => generatePassword(employeeId),
    onSuccess: (data: PasswordData) => {
      setPasswordData(data);
    },
  });

  // Handle dialog open/close
  const handleOpenChange = (newOpen: boolean) => {
    // Если диалог закрывается, очищаем данные пароля
    if (!newOpen) {
      setPasswordData(null);
    }
    setOpen(newOpen);
  };

  // Handle generate QR code button click
  const handleGenerateQR = (e: React.MouseEvent) => {
    // Предотвращаем всплытие события и действия по умолчанию
    e.preventDefault();
    e.stopPropagation();

    if (id) {
      passwordMutation.mutate(id);
    }
  };

  // Handle close button click
  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
    setPasswordData(null);
  };

  // Format employee name
  const formatName = (): string => {
    if (!employee) return '';
    return `${employee.first_name || ''} ${employee.last_name || ''}`.trim();
  };

  // Format position title
  const formatPosition = (): string => {
    if (!employee) return '';
    if (employee.position === 'master') return 'Мастер';
    if (employee.position === 'washer') return 'Мойщик';
    return employee.position || '';
  };

  // Get QR code data - only phone and password
  const getQRCodeData = (): string => {
    const phone = employee?.phone || '';
    const password = passwordData?.new_password || '';

    return `${phone}-${password}`;
  };

  // Handle trigger button click
  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(true);
  };

  // Stop propagation for all clicks inside the dialog
  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className='w-full text-left font-medium' onClick={handleTriggerClick}>
          Детали сотрудника
        </button>
      </DialogTrigger>

      <DialogPortal>
        <DialogContent
          className='rounded-lg bg-[#171928] p-[50px] text-white sm:max-w-[600px]'
          onClick={handleDialogClick}
        >
          <DialogHeader className='flex flex-row items-center justify-between'>
            <h1 className='text-[18px] font-semibold'>Детали сотрудника</h1>
            <DialogClose asChild>
              <Button
                className='rounded-[4px] bg-[#01030E] text-[#0A63F0] hover:text-white'
                type='button'
                onClick={handleCloseClick}
              >
                <X size={16} className='mr-2' />
                Закрыть
              </Button>
            </DialogClose>
          </DialogHeader>

          <Separator className='my-4 bg-[#1D3253]' />

          {isLoading ? (
            <div className='flex items-center justify-center py-10'>
              <div className='h-8 w-8 animate-spin rounded-full border-2 border-[#0A63F0] border-t-transparent'></div>
            </div>
          ) : employee ? (
            <div
              className='flex flex-col items-center gap-10 py-4 md:flex-row'
              onClick={e => e.stopPropagation()}
            >
              {/* Left column with QR code or generate button */}
              <div className='mb-4 flex flex-col items-center md:mb-0'>
                {passwordData ? (
                  <div className='rounded bg-white p-2'>
                    <QRCodeSVG value={getQRCodeData()} size={166} level='H' />
                  </div>
                ) : (
                  <Button
                    onClick={handleGenerateQR}
                    type='button'
                    className='h-[166px] w-[166px] rounded-md bg-[#0A63F0] text-white hover:bg-[#0A50D0]'
                    disabled={passwordMutation.isPending}
                  >
                    {passwordMutation.isPending ? (
                      <div className='h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
                    ) : (
                      'Сгенерировать QR-код'
                    )}
                  </Button>
                )}
              </div>

              {/* Right column with employee information */}
              <div className='w-full space-y-2 md:w-[55%]'>
                <div className='flex justify-between'>
                  <p className='font-semibold'>ФИО</p>
                  <p>{formatName()}</p>
                </div>
                <div className='flex justify-between'>
                  <p>Телефон</p>
                  <p>{employee.phone || '—'}</p>
                </div>
                <div className='flex justify-between'>
                  <p>Филиал</p>
                  <p>{employee.branch_name || '—'}</p>
                </div>
                <div className='flex justify-between'>
                  <p>Должность</p>
                  <p>{formatPosition()}</p>
                </div>
                {employee.commission_rate && (
                  <div className='flex justify-between'>
                    <p>Процент с заказа</p>
                    <p>{employee.commission_rate}%</p>
                  </div>
                )}
                {passwordData && (
                  <div className='flex justify-between'>
                    <p>Пароль</p>
                    <p>{passwordData.new_password}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className='py-8 text-center text-gray-400'>
              Не удалось загрузить данные сотрудника
            </div>
          )}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default QrCodeEmployee;
