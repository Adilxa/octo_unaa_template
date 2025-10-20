'use client';

import { Locale } from '@/plugins/i18n/config';
import { LanguageIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { useTransition } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/shadcn/select';
import { setUserLocale } from '@/lib/locale';

type Props = {
  defaultValue: string;
  items: Array<{ value: string; label: string }>;
  label: string;
};

export default function LocaleSwitcherSelect({ defaultValue, items, label }: Props) {
  const [isPending, startTransition] = useTransition();

  function onChange(value: string) {
    const locale = value as Locale;
    startTransition(() => {
      setUserLocale(locale);
    });
  }

  return (
    <div className='relative'>
      <Select defaultValue={defaultValue} onValueChange={onChange}>
        <SelectTrigger
          aria-label={label}
          className={clsx(
            'rounded-sm p-2 transition-colors hover:bg-slate-200',
            isPending && 'pointer-events-none opacity-60',
          )}
        >
          <div>
            <LanguageIcon className='h-6 w-6 text-slate-600 transition-colors group-hover:text-slate-900' />
          </div>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className='min-w-[8rem] overflow-hidden rounded-sm bg-card shadow-md'>
          {items.map(item => (
            <SelectItem
              key={item.value}
              value={item.value}
              className='flex cursor-default items-center px-3 py-2 text-base text-foreground data-[highlighted]:bg-muted'
            >
              <span className=''>{item.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
