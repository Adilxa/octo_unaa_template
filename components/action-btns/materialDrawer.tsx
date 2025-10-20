'use client';

import { EllipsisVertical, Minus, Plus } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import TabSwitcher from '@/components/ui/tabs/index';

interface Props {
  title: string;
}

const tabsArr = [
  {
    link: 'day',
    name: 'День',
  },
  {
    link: 'week',
    name: 'Неделя',
  },
  {
    link: 'month',
    name: 'Месяц',
  },
];

export function MaterialDrawer({ title }: Props) {
  return (
    <Drawer>
      {/*<DrawerTrigger asChild>*/}
      {/*</DrawerTrigger>*/}
      <DrawerContent>
        <div className='mx-auto w-full max-w-sm'>
          <DrawerHeader className={'flex flex-col justify-center gap-5'}>
            <DrawerTitle className={'text-center text-[48px] font-semibold'}>{title}</DrawerTitle>
            <div className={'flex w-full items-center justify-center gap-5'}>
              <TabSwitcher tabArr={tabsArr} />
            </div>
          </DrawerHeader>
          {/*<DrawerFooter>*/}
          {/*  <Button>Submit</Button>*/}
          {/*  <DrawerClose asChild>*/}
          {/*    <Button variant='outline'>Cancel</Button>*/}
          {/*  </DrawerClose>*/}
          {/*</DrawerFooter>*/}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
