import { DialogTrigger } from '@radix-ui/react-dialog';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // Using the App Router from Next.js
import React from 'react';
import NewDetailingBtn from '@/components/action-btns/NewDetailingBtn';
import NewWashingBtn from '@/components/action-btns/NewWashingBtn';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import DETAIL_SVG from '../../assets/svg/Detail.svg';

const NewOrderBtn = () => {
  const router = useRouter();

  const handleDetailingClick = () => {
    router.push('/detailing/new');
  };

  return (
    <Drawer>
      <DrawerTrigger
        className={
          'rounded-[6px] bg-[#0A63F0] px-3 py-2 shadow-[0px_0px_24.7px_0px_rgba(10,99,240,0.5)]'
        }
      >
        + Новая заявка
      </DrawerTrigger>
      <DrawerContent className={'mb-10 flex items-center justify-center gap-10'}>
        <DrawerHeader className={'flex items-center justify-center gap-5'}>
          <DrawerTitle className={'text-[48px] font-semibold'}>Новая заявка</DrawerTitle>
        </DrawerHeader>
        <main className={'flex items-center gap-10'}>
          <NewWashingBtn />
          <DialogTrigger
            onClick={() => handleDetailingClick()}
            className={
              'flex h-[390px] w-[390px] flex-col items-center gap-10 rounded-xl bg-[#171928] p-5 shadow'
            }
          >
            <h1 className={'text-[36px] font-bold'}>Детейлинг</h1>
            <Image src={DETAIL_SVG} alt={'pena'} />
          </DialogTrigger>
        </main>
      </DrawerContent>
    </Drawer>
  );
};

export default NewOrderBtn;
