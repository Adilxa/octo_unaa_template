import $api from '@/api/http';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Copy, Download, LoaderCircle, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
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

const download = async () => {
  try {
    const res = await $api.get('/shared/files/apk/list/');
    return res.data;
  } catch (e: any) {
    console.log(e);
  }
};

const DownloadAppBtn = () => {
  const [open, setOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const { data, isLoading } = useQuery<any>({
    queryKey: ['downloadbtndata'],
    queryFn: () => download(),
  });

  console.log(data);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const copyQRCodeURL = () => {
    navigator.clipboard
      .writeText(data[0]?.download_url)
      .then(() => {
        setCopySuccess(true);
        toast('URL QR-кода скопирован');

        setTimeout(() => {
          setCopySuccess(false);
        }, 2000);
      })
      .catch(err => {
        console.error('Ошибка при копировании URL:', err);
        toast('Не удалось скопировать URL');
      });
  };

  if (isLoading) return <LoaderCircle className={'spin-in'} />;
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger>
        <Button
          onClick={() => setOpen(true)}
          className={`flex ${data[0]?.is_new ? 'bg-[#0A63F0] shadow-[0px_0px_24.7px_0px_rgba(10,99,240,0.5)]' : 'bg-[#171928]'} items-center gap-2 rounded-[8px] px-4 py-5`}
        >
          <Download width={20} height={20} />
          Скачать .apk
        </Button>
      </DialogTrigger>
      <DialogContent
        className={'w-full max-w-[500px] rounded-xl bg-[#131520] px-10 py-10'}
        onClick={handleDialogClick}
      >
        <DialogHeader className={'border-b-[1px] border-[#1D3253] pb-5'}>
          <div className={'mb-2 flex items-center justify-between gap-20'}>
            <h1 className={'text-[18px] font-bold'}>Мобильное приложение для сотрудника</h1>
            <div className={'flex items-center gap-5'}>
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
        </DialogHeader>
        {isLoading ? (
          <LoaderCircle className={'spin-in'} />
        ) : (
          <div className={'flex items-start justify-between gap-5'}>
            <QRCodeSVG
              size={200}
              bgColor={'#ffffff'}
              fgColor={'#000000'}
              level={'L'}
              value={data[0]?.download_url}
            />
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DownloadAppBtn;
