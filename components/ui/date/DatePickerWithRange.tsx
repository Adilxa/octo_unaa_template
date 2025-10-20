'use client';

import { addDays, format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';
import type { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export function DatePickerWithRange({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize date from URL params if they exist, otherwise use undefined
  const [date, setDate] = React.useState<DateRange | undefined>(() => {
    // If both start_date and end_date exist in URL, use them
    if (searchParams.get('start_date') && searchParams.get('end_date')) {
      return {
        from: new Date(searchParams.get('start_date')!),
        to: new Date(searchParams.get('end_date')!),
      };
    }
    // Otherwise return undefined to show "Pick a date"
    return undefined;
  });

  // Function to update query params when date changes
  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate);

    // Create a new URLSearchParams instance
    const params = new URLSearchParams(searchParams.toString());

    if (newDate?.from) {
      // Update start_date
      params.set('start_date', format(newDate.from, 'yyyy-MM-dd'));

      // Update end_date if 'to' date exists
      if (newDate.to) {
        params.set('end_date', format(newDate.to, 'yyyy-MM-dd'));
      } else {
        // If only one date is selected, use it for both start and end
        params.set('end_date', format(newDate.from, 'yyyy-MM-dd'));
      }
    } else {
      // If no date is selected, remove both start_date and end_date from URL
      params.delete('start_date');
      params.delete('end_date');
    }

    // Update the URL with new query parameters
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id='date'
            variant={'outline'}
            className={cn(
              'h-[45px] w-[300px] justify-start rounded-[8px] bg-muted text-left font-normal',
              !date && 'text-muted-foreground',
            )}
          >
            <CalendarIcon className='mr-2 h-4 w-4' />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
                </>
              ) : (
                format(date.from, 'LLL dd, y')
              )
            ) : (
              <span>Выбрать дату</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <Calendar
            initialFocus
            mode='range'
            defaultMonth={date?.from || new Date()} // Use current date if no date is selected
            selected={date}
            onSelect={handleDateChange}
            numberOfMonths={2}
            className={'bg-muted'}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
