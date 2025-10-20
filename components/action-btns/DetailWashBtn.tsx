import $api from '@/api/http';
import dayjs from 'dayjs';
import React, { MouseEvent, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Props {
  id: number;
}

const DetailWashBtn: React.FC<Props> = ({ id }) => {
  const [washingDetails, setWashingDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchWashingDetails = async () => {
    try {
      setIsLoading(true);
      const response = await $api.get(`/washing/washing_orders/${id}/`);
      setWashingDetails(response.data);
    } catch (error) {
      console.error('Error fetching washing details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      fetchWashingDetails();
    }
    setIsOpen(open);
  };

  // Prevent clicks inside the modal from closing it
  const handleContentClick = (e: MouseEvent) => {
    // This will prevent any click inside the content from propagating
    e.stopPropagation();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger
        onClick={e => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        asChild
      >
        <span className='cursor-pointer'>Детали</span>
      </DialogTrigger>

      <DialogPortal>
        <DialogOverlay
          className='fixed inset-0 z-50 bg-black/80'
          onClick={() => setIsOpen(false)}
        />
        <DialogContent
          onClick={handleContentClick}
          className='fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] rounded-lg bg-[#171928] p-10 text-white sm:max-w-[500px]'
        >
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <h2 className='text-xl font-bold'>Детали заявки</h2>
              <div className='rounded-md bg-[#00C4F4] px-2 py-1 text-sm text-white'>
                {washingDetails?.status === 'pending'
                  ? 'Новая'
                  : washingDetails?.status === 'in_progress'
                    ? 'В процессе'
                    : washingDetails?.status === 'completed'
                      ? 'Завершено'
                      : 'Новая'}
              </div>
            </div>

            {isLoading ? (
              <div className='flex h-40 items-center justify-center'>
                <div className='text-center text-gray-400'>Загрузка...</div>
              </div>
            ) : (
              <div className='space-y-4'>
                <div className='border-b border-gray-700 pb-2'>
                  <h3 className='mb-2 text-gray-400'>О клиенте</h3>
                  <div className='grid grid-cols-2 gap-2'>
                    <span className='text-gray-400'>ФИО</span>
                    <span>
                      {washingDetails?.client?.first_name} {washingDetails?.client?.last_name}
                    </span>
                    <span className='text-gray-400'>Телефон</span>
                    <span>{washingDetails?.client?.phone}</span>
                  </div>
                </div>

                <div className='border-b border-gray-700 pb-2'>
                  <h3 className='mb-2 text-gray-400'>О автомобиле</h3>
                  <div className='grid grid-cols-2 gap-2'>
                    <span className='text-gray-400'>Марка</span>
                    <span>{washingDetails?.car?.brand}</span>
                    <span className='text-gray-400'>Модель</span>
                    <span>{washingDetails?.car?.model}</span>
                    <span className='text-gray-400'>Номер авто</span>
                    <span>{washingDetails?.car?.license_plate || washingDetails?.car?.vin}</span>
                  </div>
                </div>

                <div className='border-b border-gray-700 pb-2'>
                  <h3 className='mb-2 text-gray-400'>Обслуживание</h3>
                  <div className='grid grid-cols-2 gap-2'>
                    <span className='text-gray-400'>Услуги</span>
                    <div>
                      {washingDetails?.packages?.map((pkg: any) => (
                        <div key={pkg.id}>{pkg.name}</div>
                      ))}
                    </div>
                    <span className='text-gray-400'>Дата создания</span>
                    <div>
                      {washingDetails?.created_at
                        ? dayjs(washingDetails.created_at).format('DD.MM.YYYY HH:mm')
                        : ''}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className='mb-2 text-gray-400'>Сотрудник</h3>
                  <span>{washingDetails?.employee_name || 'Не назначен'}</span>
                </div>
              </div>
            )}

            <div className='flex items-center justify-between'>
              <div className='cursor-pointer rounded-full bg-purple-600 px-3 py-2 text-white'>
                Чек + Акт выполнения
              </div>
              <button className='flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white'>
                Печать
              </button>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default DetailWashBtn;
