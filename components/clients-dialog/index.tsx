import $api from '@/api/http';
import { useQuery } from '@tanstack/react-query';
import { LoaderCircle, X } from 'lucide-react';
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface Props {
  id: number | null;
  onClose: (_: any) => void;
}

interface ClientData {
  client_info: {
    id: number;
    user: {
      id: number;
      first_name: string;
      last_name: string;
      phone: string;
      email: string;
      avatar: string | null;
    };
    car: {
      id: number;
      brand: { id: number; name: string };
      model: { id: number; name: string };
      vin: string;
      license_plate: string;
      body_type: { id: number; name: string };
    };
    full_name: string;
    last_visit_date: string;
    total_visits: number;
  };
  orders_summary: {
    master_orders: {
      total_count: number;
      total_amount: number;
      completed: number;
      pending: number;
      in_progress: number;
      canceled: number;
    };
    washing_orders: {
      total_count: number;
      total_amount: number;
      completed: number;
      pending: number;
      in_progress: number;
      canceled: number;
    };
    total_orders: number;
    total_spent: number;
  };
  order_history: Array<{
    id: number;
    order_number: string;
    code_order: string;
    total_price: string;
    status: string;
    status_display: string;
    created_at: string;
    started_at: string | null;
    completed_at: string | null;
    services: any[];
    packages: Array<{
      id: number;
      name: string;
      price: string;
      description: string;
    }>;
    branch: {
      id: number;
      name: string;
      address: string;
    };
    employee: any;
    order_type: string;
    queue_position: number;
    duration: number | null;
  }>;
}

const fetchClientData = async (id: any): Promise<ClientData> => {
  try {
    const res = await $api.get(`/clients/${id}/orders/`);
    return res.data;
  } catch (e: any) {
    throw new Error(e.response?.data?.message || 'Failed to fetch client data');
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const ClientsDialog: React.FC<Props> = ({ id, onClose }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['clientData', id],
    queryFn: () => fetchClientData(id),
    enabled: id !== null,
  });

  if (isLoading) {
    return (
      <Dialog open={id !== null} onOpenChange={() => onClose(null)}>
        <DialogContent className='max-h-[90vh] max-w-4xl overflow-hidden'>
          <div className='flex h-64 items-center justify-center'>
            <LoaderCircle className='h-8 w-8 animate-spin text-blue-500' />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !data) {
    return (
      <Dialog open={id !== null} onOpenChange={() => onClose(null)}>
        <DialogContent className='max-w-4xl'>
          <div className='py-8 text-center'>
            <p className='text-red-500'>Ошибка при загрузке данных клиента</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const { client_info, orders_summary, order_history } = data;

  return (
    <Dialog open={id !== null} onOpenChange={() => onClose(null)}>
      <DialogContent className='max-h-[75vh] max-w-6xl overflow-hidden bg-[#131520] p-0'>
        <div className='h-full text-white'>
          {/* Header */}
          <div className='flex items-center justify-between border-b border-slate-700 p-6'>
            <div>
              <h2 className='text-xl font-medium text-white'>Детали клиента</h2>
              <p className='mt-1 text-sm text-slate-400'>
                Полная информация о клиенте и истории заказов
              </p>
            </div>
            <button
              onClick={() => onClose(null)}
              className='text-slate-400 transition-colors hover:text-white'
            >
              <X className='h-6 w-6' />
            </button>
          </div>

          <div className='flex h-[calc(95vh-100px)]'>
            {/* Left Column - Contact & Car Info */}
            <div className='w-1/2 overflow-y-auto border-r border-slate-700 p-6'>
              {/* Second Contact Data Section */}
              <div className='mb-8 text-sm'>
                <h3 className='mb-6 text-sm font-medium text-white'>Контактные данные</h3>
                <div className='space-y-4'>
                  <div className='flex justify-between'>
                    <span className='text-slate-400'>ФИО</span>
                    <span className='text-white'>
                      {client_info.user.first_name} {client_info.user.last_name}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-slate-400'>Телефон</span>
                    <span className='text-white'>{client_info.user.phone}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-slate-400'>E-mail</span>
                    <span className='text-white'>{client_info.user.email || 'Не указан'}</span>
                  </div>
                </div>
              </div>

              {/* Car Data Section */}
              <div className={'text-sm'}>
                <h3 className='mb-6 text-sm font-medium text-white'>Данные автомобиля</h3>
                <div className='space-y-4'>
                  <div className='flex justify-between'>
                    <span className='text-slate-400'>Марка:</span>
                    <span className='text-white'>{client_info.car.brand.name}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-slate-400'>Модель:</span>
                    <span className='text-white'>{client_info.car.model.name}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-slate-400'>Госномер:</span>
                    <span className='text-white'>{client_info.car.license_plate}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-slate-400'>VIN-код:</span>
                    <span className='text-white'>{client_info.car.vin || '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Visit History */}
            <br />
            <div className='scrollable w-1/2 overflow-y-auto p-6 pb-5 text-sm'>
              <h3 className='mb-6 text-sm font-medium text-white'>История посещений:</h3>
              {order_history.map((order, index) => (
                <div key={order.id} className='mb-8'>
                  <div className='space-y-4'>
                    <div className='flex justify-between'>
                      <span className='text-slate-400'>Дата и время</span>
                      <span className='text-white'>{formatDate(order.created_at)}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-slate-400'>Выполненные услуги:</span>
                      <span className='text-white'>{order?.order_type}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-slate-400'>Стоимость услуг:</span>
                      <span className='text-white'>{order.total_price}с</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-slate-400'>Сотрудник, выполнивший мойку</span>
                      <span className='text-white'>{order?.employee?.full_name || ''}</span>
                    </div>
                  </div>
                  {index < order_history.length - 1 && (
                    <div className='mt-8 border-b border-slate-700'></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientsDialog;
