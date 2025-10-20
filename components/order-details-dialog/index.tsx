import $api from '@/api/http';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Download, Printer, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Define interface for actual services structure based on your data sample
interface ServiceDetail {
  name: string;
  price: string;
}

// Define interface for materials based on your data sample
interface MaterialDetail {
  material: number;
  material_name: string;
  quantity_used: string;
  total_price: string;
}

// Define the order item interface based on your data sample
interface OrderItem {
  id: number;
  order_number: string;
  employee_name: string;
  services: ServiceDetail[];
  packages: any[];
  total_price: string;
  commission_rate: string;
  commission_amount: string;
  status: string;
  materials: MaterialDetail[];
}

// Define the type for the order data based on the API response
interface OrderData {
  id: number;
  client_name: string;
  status: string;
  prepayment: string;
  total_orders: number;
  remaining_orders: number;
  total_price: string;
  total_commission_amount: string;
  orders: OrderItem[];
  created_at: string;
  updated_at: string;

  // Optional fields that might come from other endpoints
  client_phone?: string;
  car_brand?: string;
  car_model?: string;
  car_number?: string;
  car_license_plate?: string;
}

// Define interface for receipt data
interface ReceiptData {
  orderId: any;
  orderNumber: string;
  clientName: string;
  clientPhone: string;
  carInfo: string;
  carVin?: string;
  services: Array<{
    name: string;
    price: string;
    employeeName: string;
  }>;
  materials: Array<{
    name: string;
    quantity: string;
    price: string;
    totalPrice: number;
  }>;
  totalAmount: number | string;
  prepayment: string;
  createdDate: string;
}

// Define props for the component
interface OrderDetailsDialogProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  orderData: any | null;
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

const OrderDetailsDialog: React.FC<OrderDetailsDialogProps> = ({
  isOpen,
  onClose,
  orderData,
  isLoading = false,
}) => {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState<{ [key: number]: boolean }>({});
  const [serviceStatuses, setServiceStatuses] = useState<{ [key: number]: string }>({});
  const [commissionRate, setCommissionRate] = useState('0');

  // Состояние для модального окна с чеком
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);

  useEffect(() => {
    // Initialize service statuses when orderData changes
    if (orderData?.orders) {
      const initialStatuses: { [key: number]: string } = {};
      orderData.orders.forEach((order: any) => {
        initialStatuses[order.id] = order.status || 'pending';
      });
      setServiceStatuses(initialStatuses);
    }
  }, [orderData]);

  if (!orderData) return null;

  const data: OrderData = orderData;
  console.log(orderData);
  const isInProgress = tab === 'inprogress';

  // Handler for starting a specific service
  const handleStartService = async (serviceId: number) => {
    try {
      setProcessing(prev => ({ ...prev, [serviceId]: true }));

      const res = await $api.patch(`master/orders/change-status/${serviceId}/`, {
        new_status: 'in_progress',
      });

      // Update the local state for this service
      setServiceStatuses(prev => ({
        ...prev,
        [serviceId]: 'in_progress',
      }));

      await queryClient.invalidateQueries({ queryKey: ['detailingList'] });
      toast('Сервис успешно начат');

      return res.data;
    } catch (error) {
      toast('Ошибка при запуске сервиса');
      console.error('Error starting service:', error);
    } finally {
      setProcessing(prev => ({ ...prev, [serviceId]: false }));
    }
  };

  // Handler for completing a specific service
  const handleCompleteService = async (serviceId: number) => {
    try {
      // Validate commission rate is a number between 0 and 100
      const rate = parseFloat(commissionRate);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        toast('Процент комиссии должен быть числом от 0 до 100');
        return;
      }

      setProcessing(prev => ({ ...prev, [serviceId]: true }));

      const res = await $api.patch(`master/orders/complete/${serviceId}/`, {
        status: 'completed',
        commission_rate: commissionRate,
      });

      // Update the local state for this service
      setServiceStatuses(prev => ({
        ...prev,
        [serviceId]: 'completed',
      }));

      await queryClient.invalidateQueries({ queryKey: ['detailingList'] });
      toast('Сервис успешно завершен');

      return res.data;
    } catch (error) {
      toast('Ошибка при завершении сервиса');
      console.error('Error completing service:', error);
    } finally {
      setProcessing(prev => ({ ...prev, [serviceId]: false }));
    }
  };

  const onStart = async (id: number) => {
    try {
      setProcessing(prev => ({ ...prev, [id]: true }));
      const res = await $api.patch(`master/orders/change-status/${id}/`, {
        status: 'in_progress',
      });
      await queryClient.invalidateQueries({ queryKey: ['detailingList'] });
      toast('Успешно');
      onClose(false);
      return res.data;
    } catch (error) {
      toast('Ошибка кнопки старта');
      console.error('Error starting order:', error);
      throw error;
    } finally {
      setProcessing(prev => ({ ...prev, [id]: false }));
    }
  };

  const onFinish = async (id: number) => {
    // Validate commission rate is a number between 0 and 100
    const rate = parseFloat(commissionRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast('Процент комиссии должен быть числом от 0 до 100');
      return;
    }

    try {
      setProcessing(prev => ({ ...prev, [id]: true }));
      const res = await $api.patch(`master/orders/complete/${id}/`, {
        status: 'completed',
        commission_rate: commissionRate,
      });
      await queryClient.invalidateQueries({ queryKey: ['detailingList'] });
      toast('Успешно завершено');
      onClose(false);
      return res.data;
    } catch (e: any) {
      toast('Ошибка при завершении заказа');
      console.error('Error completing order:', e);
    } finally {
      setProcessing(prev => ({ ...prev, [id]: false }));
    }
  };

  // Helper function to get button configuration for a service
  const getServiceButtonConfig = (serviceId: number) => {
    const status = serviceStatuses[serviceId] || 'pending';

    switch (status) {
      case 'pending':
        return {
          text: 'Начать',
          action: () => handleStartService(serviceId),
          disabled: false,
          className:
            'w-full rounded-md bg-[#0A63F0] py-2 text-center text-white hover:bg-[#0857d6]',
        };
      case 'in_progress':
        return {
          text: 'Завершить',
          action: () => handleCompleteService(serviceId),
          disabled: false,
          className:
            'w-full rounded-md bg-[#0A63F0] py-2 text-center text-white hover:bg-[#0857d6]',
        };
      case 'completed':
        return {
          text: 'Завершено',
          action: () => {},
          disabled: true,
          className: 'w-full rounded-md bg-gray-500 py-2 text-center text-white cursor-not-allowed',
        };
      default:
        return {
          text: 'Начать',
          action: () => handleStartService(serviceId),
          disabled: false,
          className:
            'w-full rounded-md bg-[#0A63F0] py-2 text-center text-white hover:bg-[#0857d6]',
        };
    }
  };

  // Функция для генерации чека
  const generateReceipt = async () => {
    setIsGeneratingReceipt(true);
    try {
      console.log('Начало генерации чека для заказа с ID:', data.id);
      // Создаем данные чека из данных заказа
      const newReceiptData: ReceiptData = {
        orderId: data.orders[0].order_number,
        orderNumber: `#${data.orders[0].order_number}`,
        clientName: data.client_name,
        clientPhone: data.client_phone || '+996 777 49 68 65',
        carInfo: `${data.car_brand || 'Hyundai'} ${data.car_model || 'Sonata, автомат'} ${data.car_license_plate ? `(${data.car_license_plate})` : ''}`,
        services: [],
        materials: [],
        totalAmount: 0,
        prepayment: data.prepayment || '0.00',
        createdDate:
          dayjs(data.created_at).format('DD.MM.YYYY HH:mm') || new Date().toLocaleString('ru-RU'),
      };

      let totalAmount = 0;

      // Обрабатываем услуги и материалы из заказа
      if (data.orders && data.orders.length > 0) {
        data.orders.forEach(order => {
          // Добавляем услуги
          if (order.services && order.services.length > 0) {
            order.services.forEach(service => {
              const servicePrice = parseFloat(service.price);
              totalAmount += servicePrice;

              newReceiptData.services.push({
                name: service.name,
                price: service.price,
                employeeName: order.employee_name || 'Не указан',
              });
            });
          }

          // Добавляем материалы
          if (order.materials && order.materials.length > 0) {
            order.materials.forEach(material => {
              const quantity = parseFloat(material.quantity_used) || 1;
              const unitPrice = parseFloat(material.total_price) / quantity;
              const totalPrice = parseFloat(material.total_price);

              totalAmount += totalPrice;

              newReceiptData.materials.push({
                name: material.material_name,
                quantity: material.quantity_used,
                price: unitPrice.toFixed(2),
                totalPrice: totalPrice,
              });
            });
          }
        });
      }

      // Устанавливаем итоговую сумму
      newReceiptData.totalAmount = totalAmount.toFixed(2);

      console.log('Итоговые данные чека:', newReceiptData);

      // Показываем чек
      setReceiptData(newReceiptData);
      setReceiptModalOpen(true);
    } catch (error) {
      console.error('Ошибка при генерации чека:', error);
      toast.error('Не удалось сгенерировать чек');
    } finally {
      setIsGeneratingReceipt(false);
    }
  };

  console.log(receiptData);

  // Функция для скачивания чека в формате PDF
  const downloadReceipt = () => {
    if (!receiptData) return;

    try {
      // Создаем HTML для PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Чек №${receiptData.orderNumber}</title>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .receipt { max-width: 800px; margin: 0 auto; border: 1px solid #ccc; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .info { margin-bottom: 20px; }
            .info-row { display: flex; margin-bottom: 5px; }
            .info-label { font-weight: bold; width: 150px; }
            .info-value { flex: 1; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { text-align: right; font-weight: bold; margin-top: 20px; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
            .signature { margin-top: 60px; }
            .signature-line { border-top: 1px solid #000; display: inline-block; width: 200px; margin-top: 10px; }
            .signature-container { display: flex; justify-content: space-between; }
            .signature-block { text-align: center; }
            h2 { border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h1>Заявка ID:${receiptData.orderNumber}</h1>
              <p>Дата: ${receiptData.createdDate}</p>
            </div>
            
            <div class="info">
              <div class="info-row">
                <div class="info-label">Клиент:</div>
                <div class="info-value">${receiptData.clientName}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Телефон:</div>
                <div class="info-value">${receiptData.clientPhone}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Автомобиль:</div>
                <div class="info-value">${receiptData.carInfo}</div>
              </div>
              ${
                receiptData.carVin
                  ? `
              <div class="info-row">
                <div class="info-label">VIN:</div>
                <div class="info-value">${receiptData.carVin}</div>
              </div>
              `
                  : ''
              }
            </div>
            
            <h2>Услуги</h2>
            <table>
              <thead>
                <tr>
                  <th>№</th>
                  <th>Наименование услуги</th>
                  <th>Сотрудник</th>
                  <th>Цена</th>
                </tr>
              </thead>
              <tbody>
              ${receiptData.services
                .map(
                  (service, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${service.name}</td>
                <td>${service.employeeName}</td>
                <td>${service.price} сом</td>
              </tr>
              `,
                )
                .join('')}
            </tbody>
          </table>
   
          <div class="total">
            <p>Предоплата: ${receiptData.prepayment} сом</p>
            <p>Итого к оплате: ${receiptData.totalAmount} сом</p>
          </div>
        
          
          <div class="footer">
            <p>Спасибо за обращение в наш сервис!</p>
          </div>
        </div>
      </body>
      </html>
    `;

      // Создаем Blob из HTML
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);

      // Создаем ссылку для скачивания
      const a = document.createElement('a');
      a.href = url;
      a.download = `Чек_АКТ_${receiptData.orderNumber}.html`;
      document.body.appendChild(a);
      a.click();

      // Очищаем ресурсы
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      toast.success('Чек успешно скачан');
    } catch (error) {
      console.error('Ошибка при скачивании чека:', error);
      toast.error('Не удалось скачать чек');
    }
  };

  // Функция для печати чека
  const printReceipt = () => {
    if (!receiptData) return;

    try {
      // Создаем HTML для печати
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error(
          'Не удалось открыть окно печати. Проверьте настройки блокировки всплывающих окон.',
        );
        return;
      }

      printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Заявка ID:${receiptData.orderNumber}</title>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .receipt { max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .info { margin-bottom: 20px; }
          .info-row { display: flex; margin-bottom: 5px; }
          .info-label { font-weight: bold; width: 150px; }
          .info-value { flex: 1; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total { text-align: right; font-weight: bold; margin-top: 20px; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
          .signature { margin-top: 60px; }
          .signature-line { border-top: 1px solid #000; display: inline-block; width: 200px; margin-top: 10px; }
          .signature-container { display: flex; justify-content: space-between; }
          .signature-block { text-align: center; }
          h2 { border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          @media print {
            body { margin: 0; padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>Заявка ID:${receiptData.orderNumber}</h1>
            <p>Дата: ${receiptData.createdDate}</p>
          </div>
          
          <div class="info">
            <div class="info-row">
              <div class="info-label">Клиент:</div>
              <div class="info-value">${receiptData.clientName}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Телефон:</div>
              <div class="info-value">${receiptData.clientPhone}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Автомобиль:</div>
              <div class="info-value">${receiptData.carInfo}</div>
            </div>
            ${
              receiptData.carVin
                ? `
            <div class="info-row">
              <div class="info-label">VIN:</div>
              <div class="info-value">${receiptData.carVin}</div>
            </div>
            `
                : ''
            }
          </div>
          
          <h2>Услуги</h2>
          <table>
            <thead>
              <tr>
                <th>№</th>
                <th>Наименование услуги</th>
                <th>Сотрудник</th>
                <th>Цена</th>
              </tr>
            </thead>
            <tbody>
              ${receiptData.services
                .map(
                  (service, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${service.name}</td>
                <td>${service.employeeName}</td>
                <td>${service.price} сом</td>
              </tr>
              `,
                )
                .join('')}
            </tbody>
          </table>
          
          <div class="total">
            <p>Предоплата: ${receiptData.prepayment} сом</p>
            <p>Итого к оплате: ${receiptData.totalAmount} сом</p>
          </div>
          
          <div class="footer">
            <p>Спасибо за обращение в наш сервис!</p>
          </div>
          
          <div class="no-print" style="text-align: center; margin-top: 30px;">
            <button onclick="window.print();" style="padding: 10px 20px; background: #0A63F0; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Печать
            </button>
            <button onclick="window.close();" style="padding: 10px 20px; margin-left: 10px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Закрыть
            </button>
          </div>
        </div>
      </body>
      </html>
    `);

      printWindow.document.close();

      // Автоматически вызываем печать
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 500);
    } catch (error) {
      console.error('Ошибка при печати чека:', error);
      toast.error('Не удалось распечатать чек');
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className='h-[90vh] w-[90%] max-w-none overflow-hidden rounded-lg bg-[#121425] p-10 text-white'>
          <DialogClose className='data-[state=open]:bg-accent absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:text-muted-foreground'>
            <X className='h-4 w-4' />
            <span className='sr-only'>Закрыть</span>
          </DialogClose>
          {isLoading ? (
            <div className='flex items-center justify-center p-5'>
              <p>Загрузка данных...</p>
            </div>
          ) : (
            <div className='grid grid-cols-[30%_1px_70%] gap-0'>
              <div className='pr-4'>
                <div>
                  <div className='flex items-center justify-between border-b border-gray-700 pb-3'>
                    <DialogTitle className='text-xl font-bold'>Детали заявки</DialogTitle>
                  </div>

                  <div className=''>
                    <Section title='О клиенте'>
                      <InfoRow label='ФИО' value={data.client_name} />
                      <InfoRow label='Телефон' value={data.client_phone || '+996 777 49 68 65'} />
                    </Section>

                    <Section title='О автомобиле'>
                      <InfoRow label='Марка' value={data.car_brand || 'Hyundai'} />
                      <InfoRow label='Модель' value={data.car_model || 'Sonata, автомат'} />
                      <InfoRow label='Номер авто' value={data.car_license_plate || '01KG678AJF'} />
                    </Section>

                    {isInProgress && (
                      <div className='mb-4 mt-3'>
                        <label className='mb-1 block text-sm text-gray-400'>Процент комиссии</label>
                        <div className='flex items-center'>
                          <input
                            type='text'
                            value={commissionRate}
                            onChange={e => setCommissionRate(e.target.value)}
                            className='w-full rounded-md border border-gray-700 bg-[#1b1f36] p-2 text-white'
                            placeholder='Введите процент (например, 10.00%)'
                          />
                          <span className='ml-2 text-gray-400'>%</span>
                        </div>
                        <p className='mt-1 text-xs text-gray-500'>
                          Процент комиссии должен быть числом от 0 до 100 (например, 10.00)
                        </p>
                      </div>
                    )}
                  </div>
                  <div className='mt-10'>
                    <Button
                      className='w-full rounded-md border border-gray-700 bg-[#1b1f36] py-2 text-white hover:bg-[#252a45]'
                      onClick={generateReceipt}
                      disabled={isGeneratingReceipt}
                    >
                      <div className='flex items-center'>
                        <div className='mr-auto'>
                          {isGeneratingReceipt ? 'Создание чека...' : 'Чек + Акт выполнение'}
                        </div>
                      </div>
                    </Button>
                  </div>
                  <div className='mt-3'>
                    <Button
                      className='w-full rounded-xl bg-[#0A63F0] py-2 text-white hover:bg-[#0857d6]'
                      onClick={() => {
                        if (receiptData) {
                          printReceipt();
                        } else {
                          generateReceipt().then(() => {
                            setTimeout(printReceipt, 500);
                          });
                        }
                      }}
                    >
                      Распечатать
                    </Button>
                  </div>
                </div>
              </div>

              {/* Vertical divider */}
              <div className='h-full w-[1px] bg-gray-700'></div>

              {/* Правая часть - блоки с услугами */}
              <div className='grid grid-cols-2 gap-4 overflow-y-auto pl-4 pr-2'>
                {/* map with safe checks */}
                {Array.isArray(orderData.orders) && orderData.orders.length > 0 ? (
                  orderData.orders.map((order: any, index: any) => {
                    const buttonConfig = getServiceButtonConfig(order.id);

                    return (
                      <div
                        key={`service-${order.id}`}
                        className='rounded-lg p-4 text-sm text-white'
                      >
                        {/* Header with count */}
                        <div className='flex items-center justify-between border-b border-gray-800 pb-1'>
                          <h3 className='text-sm'>Услуги</h3>
                          <span className='text-sm'>{orderData.orders.length} шт</span>
                        </div>

                        {/* Service item */}
                        <div className='mt-2'>
                          <p className='mb-1 mt-2 text-white'>Услуга №{index + 1}</p>
                          {/* Render services with proper structure */}
                          {Array.isArray(order.services) &&
                            order.services.map((service: any, idx: any) => (
                              <div key={`service_${idx}`} className='m-1 flex justify-between'>
                                <p className='text-gray-400'>{service.name}</p>
                                <p>{service.price}</p>
                              </div>
                            ))}

                          {/* Render materials with proper structure */}
                          <div className='mt-3'>
                            <p className='mb-1 text-white'>Материалы</p>
                            {Array.isArray(order.materials) && order.materials.length > 0 ? (
                              order.materials.map((material: any, idx: any) => (
                                <div key={`material_${idx}`} className='m-1 flex justify-between'>
                                  <p className='text-gray-400'>{material.material_name}</p>
                                  <p>{material.total_price}</p>
                                </div>
                              ))
                            ) : (
                              <p className='text-gray-400'>Нет материалов</p>
                            )}
                          </div>

                          <div className='mb-3 mt-1 flex justify-between'>
                            <p className='text-gray-400'>Сотрудник</p>
                            <p>{order.employee_name}</p>
                          </div>

                          {/* Status indicator */}
                          <div className='mb-3 mt-1 flex justify-between'>
                            <p className='text-gray-400'>Статус</p>
                            <p
                              className={
                                serviceStatuses[order.id] === 'completed'
                                  ? 'text-green-500'
                                  : serviceStatuses[order.id] === 'in_progress'
                                    ? 'text-yellow-500'
                                    : 'text-gray-400'
                              }
                            >
                              {serviceStatuses[order.id] === 'completed'
                                ? 'Завершено'
                                : serviceStatuses[order.id] === 'in_progress'
                                  ? 'В процессе'
                                  : 'Ожидает'}
                            </p>
                          </div>
                        </div>

                        {/* Action button based on status */}
                        <button
                          className={buttonConfig.className}
                          onClick={buttonConfig.action}
                          disabled={buttonConfig.disabled || processing[order.id]}
                        >
                          {processing[order.id] ? 'Обработка...' : buttonConfig.text}
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className='col-span-2 p-4 text-center text-gray-400'>
                    Нет доступных услуг
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Модальное окно для отображения чека */}
      <Dialog open={receiptModalOpen} onOpenChange={setReceiptModalOpen}>
        <DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto border-gray-700 bg-[#171928] text-white'>
          <DialogClose className='data-[state=open]:bg-accent absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:text-muted-foreground'>
            <X className='h-4 w-4' />
            <span className='sr-only'>Закрыть</span>
          </DialogClose>
          <DialogHeader>
            <DialogTitle className='text-center text-xl font-bold'>
              Заявка ID:{receiptData?.orderNumber}
            </DialogTitle>
            <DialogDescription className='text-center text-gray-300'>
              {receiptData?.createdDate}
            </DialogDescription>
          </DialogHeader>

          {receiptData && (
            <div className='mt-4'>
              <div className='mb-4 rounded-lg bg-[#1A1A24] p-4'>
                <h3 className='mb-2 font-medium'>Информация о клиенте</h3>
                <div className='grid grid-cols-2 gap-2'>
                  <div className='text-gray-400'>Клиент:</div>
                  <div>{receiptData.clientName}</div>
                  <div className='text-gray-400'>Телефон:</div>
                  <div>{receiptData.clientPhone}</div>
                  <div className='text-gray-400'>Автомобиль:</div>
                  <div>{receiptData.carInfo}</div>
                  {receiptData.carVin && (
                    <>
                      <div className='text-gray-400'>VIN:</div>
                      <div>{receiptData.carVin}</div>
                    </>
                  )}
                </div>
              </div>

              <h3 className='mb-2 font-medium'>Услуги</h3>
              <div className='overflow-x-auto'>
                <table className='mb-4 w-full'>
                  <thead>
                    <tr className='bg-[#0A63F0] text-white'>
                      <th className='w-12 px-4 py-2 text-left'>#</th>
                      <th className='px-4 py-2 text-left'>Наименование услуги</th>
                      <th className='px-4 py-2 text-left'>Сотрудник</th>
                      <th className='px-4 py-2 text-right'>Цена</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receiptData.services.map((service, index) => (
                      <tr key={index} className='border-b border-gray-700'>
                        <td className='px-4 py-2'>{index + 1}</td>
                        <td className='px-4 py-2'>{service.name}</td>
                        <td className='px-4 py-2'>{service.employeeName}</td>
                        <td className='px-4 py-2 text-right'>{service.price} сом</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {receiptData.materials.length > 0 && (
                <>
                  <h3 className='mb-2 font-medium'>Материалы</h3>
                  <div className='overflow-x-auto'>
                    <table className='mb-4 w-full'>
                      <thead>
                        <tr className='bg-[#0A63F0] text-white'>
                          <th className='w-12 px-4 py-2 text-left'>#</th>
                          <th className='px-4 py-2 text-left'>Наименование материала</th>
                          <th className='px-4 py-2 text-center'>Количество</th>
                          <th className='px-4 py-2 text-right'>Цена за ед.</th>
                          <th className='px-4 py-2 text-right'>Сумма</th>
                        </tr>
                      </thead>
                      <tbody>
                        {receiptData.materials.map((material, index) => (
                          <tr key={index} className='border-b border-gray-700'>
                            <td className='px-4 py-2'>{index + 1}</td>
                            <td className='px-4 py-2'>{material.name}</td>
                            <td className='px-4 py-2 text-center'>{material.quantity}</td>
                            <td className='px-4 py-2 text-right'>{material.price} сом</td>
                            <td className='px-4 py-2 text-right'>
                              {material.totalPrice.toFixed(2)} сом
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              <div className='rounded-lg bg-[#1A1A24] p-4'>
                <div className='mb-2 flex items-center justify-between'>
                  <span className='text-gray-400'>Предоплата:</span>
                  <span>{receiptData.prepayment} сом</span>
                </div>
                <div className='flex items-center justify-between text-lg font-bold'>
                  <span>Итого к оплате:</span>
                  <span>{receiptData.totalAmount} сом</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className='sticky bottom-0 mt-6 flex flex-col gap-2 border-t border-gray-700 bg-[#171928] py-3 sm:flex-row'>
            <Button
              className='flex w-full items-center justify-center gap-2 sm:w-auto'
              onClick={downloadReceipt}
            >
              <Download size={18} />
              Скачать чек
            </Button>
            <Button
              className='flex w-full items-center justify-center gap-2 sm:w-auto'
              onClick={printReceipt}
            >
              <Printer size={18} />
              Распечатать
            </Button>
            <Button
              className='flex w-full items-center justify-center gap-2 bg-gray-600 sm:w-auto'
              onClick={() => setReceiptModalOpen(false)}
            >
              <X size={18} />
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
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

export default OrderDetailsDialog;
