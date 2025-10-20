import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const invoices = [
  {
    invoice: 'INV001',
    paymentStatus: 'Paid',
    totalAmount: '$250.00',
    paymentMethod: 'Credit Card',
  },
  {
    invoice: 'INV002',
    paymentStatus: 'Pending',
    totalAmount: '$150.00',
    paymentMethod: 'PayPal',
  },
  {
    invoice: 'INV003',
    paymentStatus: 'Unpaid',
    totalAmount: '$350.00',
    paymentMethod: 'Bank Transfer',
  },
  {
    invoice: 'INV004',
    paymentStatus: 'Paid',
    totalAmount: '$450.00',
    paymentMethod: 'Credit Card',
  },
  {
    invoice: 'INV005',
    paymentStatus: 'Paid',
    totalAmount: '$550.00',
    paymentMethod: 'PayPal',
  },
  {
    invoice: 'INV006',
    paymentStatus: 'Pending',
    totalAmount: '$200.00',
    paymentMethod: 'Bank Transfer',
  },
  {
    invoice: 'INV007',
    paymentStatus: 'Unpaid',
    totalAmount: '$300.00',
    paymentMethod: 'Credit Card',
  },
];

interface TableProps {
  tableHeader: any;
  tableBody: any;
  totalPages?: any;
}

const CoreTable: React.FC<TableProps> = ({ tableHeader, tableBody, totalPages }) => {
  const searchParams = useSearchParams();
  const pageParam = searchParams.get('page');
  const router = useRouter();

  // Получаем значения из URL с правильными дефолтными значениями
  const pageFromUrl = Number(searchParams.get('page') || '1');
  const sizeFromUrl = Number(searchParams.get('size') || '10');

  // Локальное состояние, инициализированное из URL
  const [size, setSize] = useState(sizeFromUrl);
  const [page, setPage] = useState(pageFromUrl);

  // Убедимся, что в URL всегда есть нужные параметры
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    let needsUpdate = false;

    if (!params.has('page') || params.get('page') !== String(page)) {
      params.set('page', String(page));
      needsUpdate = true;
    }

    if (!params.has('size') || params.get('size') !== String(size)) {
      params.set('size', String(size));
      needsUpdate = true;
    }

    // Обновляем URL только если что-то изменилось
    if (needsUpdate) {
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [router, searchParams, page, size]);

  // Синхронизируем состояние с URL при изменении URL
  useEffect(() => {
    const newPage = Number(searchParams.get('page') || '1');
    const newSize = Number(searchParams.get('size') || '10');

    if (newPage !== page) {
      setPage(newPage);
    }

    if (newSize !== size) {
      setSize(newSize);
    }
  }, [searchParams]);

  // Функция для обновления URL и состояния
  const updateURL = (value: number, param: 'page' | 'size') => {
    // Проверка валидности значения страницы
    if (param === 'page' && (value < 1 || value > totalPages)) {
      console.warn(`Недопустимое значение страницы: ${value}`);
      return;
    }

    // Обновляем локальное состояние
    if (param === 'size') {
      setSize(value);
      setPage(1); // Сбрасываем на первую страницу при изменении размера
    } else {
      setPage(value);
    }

    // Обновляем URL
    const updatedParams = new URLSearchParams(searchParams.toString());
    updatedParams.set(param, String(value));

    if (param === 'size') {
      updatedParams.set('page', '1');
    }

    router.push(`?${updatedParams.toString()}`, { scroll: false });

    console.log(`Обновлен параметр ${param} на значение ${value}, totalPages=${totalPages}`);
  };

  // Выводим отладочную информацию
  console.log(
    `Текущее состояние: page=${page}, size=${size}, totalPages=${totalPages}, totalItems=${42}`,
  );
  console.log(totalPages);

  return (
    <>
      <Table className={'rounded-t-2xl bg-[#171928]'}>
        {tableHeader}
        {tableBody}
      </Table>
      <div className='flex items-center justify-end gap-10 rounded-b-2xl bg-[#171928] px-4 py-3'>
        <div className='flex items-center gap-10 text-sm'>
          <div className='flex items-center gap-5'>
            <span>Количество записей</span>
            <Select
              value={String(size)}
              onValueChange={value => updateURL(parseInt(value), 'size')}
            >
              <SelectTrigger className='h-8 w-[70px] border-0'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className='bg-[#171928]'>
                <SelectItem value='10'>10</SelectItem>
                <SelectItem value='20'>20</SelectItem>
                <SelectItem value='50'>50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className='flex items-center gap-5'>
          <span className='text-sm text-gray-500'>
            Страница {pageParam} из {totalPages || 1}
          </span>
          <div className='flex gap-1'>
            <Button
              variant='outline'
              onClick={() => updateURL(1, 'page')}
              disabled={page === 1 || totalPages === 0}
              size='icon'
            >
              <ChevronsLeft className='h-4 w-4' />
            </Button>
            <Button
              variant='outline'
              onClick={() => updateURL(page - 1, 'page')}
              disabled={page === 1 || totalPages === 0}
              size='icon'
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <Button
              variant='outline'
              onClick={() => updateURL(page + 1, 'page')}
              disabled={page >= totalPages || totalPages === 0}
              size='icon'
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
            <Button
              variant='outline'
              onClick={() => updateURL(totalPages, 'page')}
              disabled={page >= totalPages || totalPages === 0}
              size='icon'
            >
              <ChevronsRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CoreTable;
