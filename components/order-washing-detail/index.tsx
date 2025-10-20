import $api from '@/api/http';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Ban, Check, CheckCheck, CirclePlay, Copy, Printer } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

// Define the type for the order data based on the API response
interface WashingOrderData {
  id: number;
  order_number: string;
  client_name: string;
  package_names: string[];
  employee_name: string;
  total_price: string;
  status: string;
  created_at: string;
  code_order: string;
  license_plate: string;
  // Additional fields
  materials?: string[];
  services?: string[];
  client_phone?: string;
  car_brand?: string;
  car_model?: string;

  [key: string]: any; // Allow additional properties
}

// Define props for the component
interface WashingOrderDetailsDialogProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  orderData: WashingOrderData | null;
  isLoading?: boolean;
}

// Define props for the Section component
interface SectionProps {
  title: string;
  children: React.ReactNode;
}

// Define props for the InfoRow component
interface InfoRowProps {
  label: string;
  value: React.ReactNode;
}

const WashingOrderDetailsDialog: React.FC<WashingOrderDetailsDialogProps> = ({
  isOpen,
  onClose,
  orderData,
  isLoading = false,
}) => {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);
  const [commissionRate, setCommissionRate] = useState('10.00');
  const [detailedData, setDetailedData] = useState<any | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (isOpen && orderData) {
      // Fetch detailed data if needed
      const fetchDetailedData = async () => {
        try {
          const response = await $api.get(`/washing/washing_orders/${orderData.id}/`);
          setDetailedData(response.data);
        } catch (error) {
          console.error('Error fetching detailed order data:', error);
          // Fallback to the provided data
          setDetailedData(orderData);
        }
      };

      // If we already have detailed data, use it; otherwise fetch it
      if (orderData.materials && orderData.services) {
        setDetailedData(orderData);
      } else {
        fetchDetailedData();
      }
    }
  }, [isOpen, orderData]);

  if (!orderData && !detailedData) return null;

  const data = detailedData || orderData;
  const isInProgress = tab === 'inprogress';

  // Generate QR code URL
  const trackingUrl = `https://unaa-tracking.vercel.app/tracking/track/${data.code_order}`;

  const onStart = async (id: number) => {
    try {
      setProcessing(true);
      const res = await $api.patch(`washing/washing_orders/change-status/${id}/`, {
        new_status: 'in_progress',
      });
      await queryClient.invalidateQueries({ queryKey: ['washingList'] });
      toast('Успешно');
      onClose(false);
      return res.data;
    } catch (error: any) {
      toast(error.response.data);
    } finally {
      setProcessing(false);
    }
  };

  const onCancelProgress = async (id: number) => {
    try {
      const res = await $api.patch(`washing/washing-orders/${id}/complete/`, {
        status: 'completed',
      });
      await queryClient.invalidateQueries({ queryKey: ['washingList_inprogress'] });
      onClose(true);
      toast('Успешно завершено');
      return res.data;
    } catch (error: any) {
      toast(error.response.data);
    }
  };

  const cnCancel = async (id: number) => {
    try {
      const res = await $api.post(`washing/washing-orders/${id}/cancel/`);
      toast('Успешно отменено');
      await queryClient.invalidateQueries({ queryKey: ['washingList'] });
      onClose(true);
      return res.data;
    } catch (error: any) {
      toast(error.response.data);
    }
  };

  const onStartWash = async (id: number) => {
    try {
      const res = await $api.patch(`washing/washing-orders/${id}/change-status/`, {
        new_status: 'in_progress',
      });
      toast('Успешно началось');
      await queryClient.invalidateQueries({ queryKey: ['washingList'] });
      onClose(true);
      return res.data;
    } catch (error: any) {
      toast(error.response.data);
    }
  };

  const onFinish = async (id: number) => {
    const rate = parseFloat(commissionRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast('Процент комиссии должен быть числом от 0 до 100');
      return;
    }

    try {
      setProcessing(true);
      const res = await $api.patch(`washing/washing_orders/complete/${id}/`, {
        status: 'completed',
        commission_rate: commissionRate,
      });
      await queryClient.invalidateQueries({ queryKey: ['washingList'] });
      toast('Успешно завершено');
      onClose(false);
      return res.data;
    } catch (e: any) {
      toast(e.response.data);
    } finally {
      setProcessing(false);
    }
  };

  // Determine which action function and button text to use based on the tab
  const actionFunction = isInProgress ? onFinish : onStart;
  const actionButtonText = isInProgress ? 'Завершить' : 'Начать';

  // Function to copy QR URL to clipboard
  const copyQRCodeURL = () => {
    navigator.clipboard
      .writeText(trackingUrl)
      .then(() => {
        setCopySuccess(true);
        toast('URL QR-кода скопирован');

        // Reset the success icon after 2 seconds
        setTimeout(() => {
          setCopySuccess(false);
        }, 2000);
      })
      .catch(err => {
        console.error('Ошибка при копировании URL:', err);
        toast('Не удалось скопировать URL');
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-[450px] overflow-hidden rounded-lg bg-[#121425] p-8 text-white'>
        {isLoading ? (
          <div className='flex items-center justify-center p-5'>
            <p>Загрузка данных...</p>
          </div>
        ) : (
          <>
            <div className='flex items-center justify-between border-b border-gray-700 pb-3'>
              <div className='flex items-center gap-2'>
                <DialogTitle className='text-xl font-bold'>
                  Детали заявки <span className='text-[#0A63F0]'>МОЙКА</span>
                </DialogTitle>
              </div>
            </div>

            <div className='mt-4'>
              <Section title='О клиенте'>
                <InfoRow
                  label='ФИО'
                  value={
                    data.client_name ||
                    (data.client?.first_name
                      ? `${data.client.first_name} ${data.client.last_name || ''}`
                      : 'Н/Д')
                  }
                />
                <InfoRow label='Телефон' value={data.client_phone || data.client?.phone || 'Н/Д'} />
              </Section>

              <Section title='О автомобиле'>
                <InfoRow label='Марка' value={data.car_brand || data.car?.brand || 'Н/Д'} />
                <InfoRow label='Модель' value={data.car_model || data.car?.model || 'Н/Д'} />
                <InfoRow
                  label='Номер авто'
                  value={data.license_plate || data.car?.license_plate || 'Н/Д'}
                />
              </Section>

              <Section title='Обслуживание'>
                <InfoRow
                  label='Услуги'
                  value={
                    <div>
                      {data?.packages?.map((service: any, idx: any) => (
                        <div key={`service_${idx}`}>{service.name}</div>
                      ))}
                    </div>
                  }
                />
              </Section>

              <div className='mb-4 flex items-center justify-between py-1'>
                <div className='text-sm'>Сотрудник</div>
                <div className='underline'>{data.employee_name}</div>
              </div>

              {/* QR Code with Copy Button */}
              <div className='mb-4 flex items-start justify-between'>
                <div className='flex justify-start'>
                  <QRCodeSVG
                    value={trackingUrl}
                    size={170}
                    bgColor={'#ffffff'}
                    fgColor={'#000000'}
                    level={'L'}
                  />
                </div>
                <div className={'flex h-full w-full flex-col items-end justify-between gap-3'}>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={copyQRCodeURL}
                    className='flex h-8 items-center gap-1 rounded bg-[#1D2235] px-2 py-1 text-xs hover:bg-[#2A3047]'
                  >
                    {copySuccess ? (
                      <>
                        <Check className='h-4 w-4' /> Скопировано
                      </>
                    ) : (
                      <>
                        <Copy className='h-4 w-4' /> Копировать URL
                      </>
                    )}
                  </Button>
                  {tab == 'new' ? (
                    <>
                      <Button
                        onClick={() => cnCancel(data.id)}
                        size={'sm'}
                        className={'flex items-center gap-1 rounded px-[6px] py-1'}
                      >
                        <Ban />
                        Отменить заявку
                      </Button>
                      <Button
                        onClick={() => onStartWash(data.id)}
                        size={'sm'}
                        className={'flex items-center gap-1 rounded px-[6px] py-1'}
                      >
                        <CirclePlay />
                        Начать мойку
                      </Button>
                    </>
                  ) : tab == 'inprogress' ? (
                    <Button
                      onClick={() => onCancelProgress(data.id)}
                      size={'sm'}
                      className={'flex items-center gap-1 rounded px-[3px] py-1'}
                    >
                      <CheckCheck />
                      Завершить заявку
                    </Button>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Section component with TypeScript
const Section: React.FC<SectionProps> = ({ title, children }) => (
  <div className='mb-4'>
    <h3 className='mb-2 text-sm font-medium'>{title}</h3>
    {children}
  </div>
);

// InfoRow component with TypeScript
const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
  <div className='flex items-center justify-between py-1'>
    <div className='text-sm text-gray-400'>{label}</div>
    <div className='text-white'>{value}</div>
  </div>
);

export default WashingOrderDetailsDialog;
