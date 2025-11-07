import { Copy } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import Cookies from 'js-cookie';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface QrCodeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  websocketUrl: string;
  orderDetails: {
    id: number;
    client_name: string;
    queue_position: number;
    status: string;
    code_order: string;
  };
}

const QrCodeModal: React.FC<QrCodeModalProps> = ({
  isOpen,
  onOpenChange,
  websocketUrl,
  orderDetails,
}) => {
  // Extract websocket ID from the full websocket URL
  // Example: ws://84.54.12.243/ws/order/84041976-8024-4b30-b8e2-69f312916842/
  // We want to extract: 84041976-8024-4b30-b8e2-69f312916842
  const extractWebsocketId = (url: string) => {
    const pattern = /wss:\/\/.*\/ws\/order\/([^/]+)\/?/;
    const match = url?.match(pattern);
    return match ? match[1] : '';
  };


  // Get the websocket ID
  const websocketId = extractWebsocketId(websocketUrl);

  const token = Cookies.get('access_token');
  // Create the tracking URL using a path parameter (most reliable with QR codes)
  console.log(orderDetails, websocketId, "--------------------------------hhhehehhe");
  const trackingUrl = `https://octo-mobile.vercel.app/tracking/track/${orderDetails?.code_order}?token=${token}&domain=ilovedaniyal.click`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(trackingUrl);
    toast.success('URL скопирован в буфер обмена');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='bg-[#131520] text-white sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>QR-код для отслеживания заказа #{orderDetails.id}</DialogTitle>
          <DialogDescription className='text-gray-400'>
            Отсканируйте QR-код для отслеживания статуса заказа в реальном времени
          </DialogDescription>
        </DialogHeader>
        <div className='flex flex-col items-center justify-center rounded-lg bg-white p-4'>
          <QRCodeSVG
            value={trackingUrl}
            size={200}
            bgColor={'#FFFFFF'}
            fgColor={'#000000'}
            level={'H'}
            includeMargin={false}
          />
        </div>
        <div className='my-2 rounded-md bg-[#171928] p-4'>
          <p className='mb-1 text-sm font-medium'>Данные заказа:</p>
          <p className='mb-1 text-sm'>
            Клиент: <span className='text-blue-400'>{orderDetails.client_name}</span>
          </p>
          <p className='mb-1 text-sm'>
            Позиция в очереди: <span className='text-blue-400'>{orderDetails.queue_position}</span>
          </p>
          <p className='text-sm'>
            Статус:{' '}
            <span className='text-blue-400'>
              {orderDetails.status === 'pending' ? 'В ожидании' : orderDetails.status}
            </span>
          </p>
        </div>
        <DialogFooter className='flex sm:justify-between'>
          <Button
            variant='outline'
            className='border-[#1D3253] bg-[#171928] text-white'
            onClick={copyToClipboard}
          >
            <Copy className='mr-2 h-4 w-4' />
            Копировать URL
          </Button>
          <DialogClose asChild onClick={() => window.location.reload()}>
            <Button type='button' className='bg-[#01030E] text-[#0A63F0] hover:text-white'>
              Закрыть
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QrCodeModal;
