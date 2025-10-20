'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import SEARCH_SVG from '../../../assets/svg/Search.svg';
import style from './searchInput.module.scss';

interface Props {
  width?: string | any; // Ширина, передаваемая через пропсы
  page?: boolean; // Флаг для обновления параметра страницы
}

const SearchInput: React.FC<Props> = ({ width = '100%', page = true }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const queryName = searchParams?.get('search') || '';
    setSearchText(queryName);
  }, [searchParams]);

  const debounce = (func: any, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const updateURL = debounce((value: string) => {
    const updatedParams = new URLSearchParams(searchParams?.toString());

    if (value.trim()) {
      updatedParams.set('search', value.trim());
    } else {
      updatedParams.delete('search');
    }
    router.push(`?${updatedParams.toString()}`, { scroll: false });
  }, 10);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    updateURL(value);
  };

  return (
    <div style={{ width }} className={style.form_filed}>
      <i className={style.icon}>
        <Image src={SEARCH_SVG} alt='search' />
      </i>
      <input
        value={searchText}
        onChange={handleChange}
        type='text'
        placeholder='Поиск'
        aria-label='Search'
        style={{ width: width, height: '36px' }}
      />
    </div>
  );
};

export default SearchInput;
