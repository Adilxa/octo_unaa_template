'use client';

import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface Props {
  folderArr: { title: string; link: string }[];
  children: React.ReactNode | any;
}

const UiFolder: React.FC<Props> = ({ folderArr, children }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Установка значения по умолчанию, если параметр отсутствует
  const actualScreen = searchParams.get('tab') || 'info';

  // Локальное состояние для отслеживания изменений URL
  const [activeTab, setActiveTab] = useState(actualScreen);

  // Обновление локального состояния при изменении URL
  useEffect(() => {
    setActiveTab(searchParams.get('tab') || 'info');
  }, [searchParams]);

  const onSetQueryParam = (param: string, additionalParams: Record<string, string> = {}) => {
    const params = new URLSearchParams(searchParams ? Array.from(searchParams.entries()) : []);
    params.set('tab', param);

    Object.entries(additionalParams).forEach(([key, value]) => {
      params.set(key, value);
    });

    router.push(`${window.location.pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className='flex flex-col'>
      <nav className='flex items-center gap-20'>
        {folderArr.map((el, index) => (
          <motion.div
            key={el.title}
            className={`flex min-h-[48px] cursor-pointer items-center gap-4 px-6 py-3 ${
              activeTab === el.link ? `rounded-tab bg-[#131520] ${index === 0 ? 'first' : ''}` : ''
            }`}
            onClick={() => onSetQueryParam(el.link)}
          >
            <h1
              className={`text-[20px] ${
                activeTab === el.link ? 'text-[#0A63F0]' : 'text-[#71717A]'
              }`}
            >
              {el.title}
            </h1>
          </motion.div>
        ))}
      </nav>
      <main className='h-full w-full flex-1 rounded-2xl rounded-tl-none bg-[#131520] px-6 py-6'>
        {children}
      </main>
    </div>
  );
};

export default UiFolder;
