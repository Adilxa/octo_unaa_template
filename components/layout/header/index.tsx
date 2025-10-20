'use client';

import { motion } from 'framer-motion';
import Cookies from 'js-cookie';
import { ChartColumnBig, File, LogOut, Menu, Settings, X } from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import LOGO_SVG from '../../../app/icon.svg';
import FIRSTACTIVESVG from '../../../assets/svg/tabbar/active/bars-v.svg';
import FIFTHACTIVESVG from '../../../assets/svg/tabbar/active/element.svg';
import THIRTHACTIVESVG from '../../../assets/svg/tabbar/active/gem.svg';
import SECONDACTIVESVG from '../../../assets/svg/tabbar/active/inbox-unread.svg';
import FOURTHACTIVESVG from '../../../assets/svg/tabbar/active/jigsaw-puzzle.svg';
import EIGHTHACTIVESVG from '../../../assets/svg/tabbar/active/settings.svg';
import SEVENTHACTIVESVG from '../../../assets/svg/tabbar/active/users.svg';
import SIXTHACTIVESVG from '../../../assets/svg/tabbar/active/wallet-withdraw.svg';
import fifthInactive from '../../../assets/svg/tabbar/inactive/logos/fifth.svg';
import firstInactive from '../../../assets/svg/tabbar/inactive/logos/first.svg';
import fourthInactive from '../../../assets/svg/tabbar/inactive/logos/fourth.svg';
import secondInactive from '../../../assets/svg/tabbar/inactive/logos/second.svg';
import sixthInactive from '../../../assets/svg/tabbar/inactive/logos/sixth.svg';
import thirdInactive from '../../../assets/svg/tabbar/inactive/logos/third.svg';
import zeroInactive from '../../../assets/svg/tabbar/inactive/logos/zero.svg';
import USERS from '../../../assets/users.svg';

interface IScreens {
  title: string;
  logo: any;
  navigateTo: string;
}

export const screensArr = [
  {
    title: 'Сводка',
    logo: <Image src={FIRSTACTIVESVG} alt='Сводка' width={20} height={20} />,
    logoInactive: <Image src={zeroInactive} alt='Сводка' width={20} height={20} />,
    navigateTo: '/dashboard',
  },
  {
    title: 'Заявки',
    logo: <Image src={SECONDACTIVESVG} alt={'application'} width={20} height={20} />,
    logoInactive: <Image src={firstInactive} alt='Сводка' width={20} height={20} />,
    navigateTo: '/applications',
  },
  {
    title: 'Услуги',
    logo: <Image src={THIRTHACTIVESVG} alt={'services'} width={20} height={20} />,
    logoInactive: <Image src={secondInactive} alt='Сводка' width={20} height={20} />,
    navigateTo: '/services',
  },
  {
    title: 'Материалы',
    logo: <Image src={FOURTHACTIVESVG} alt={'materials'} width={20} height={20} />,
    logoInactive: <Image src={thirdInactive} alt='Сводка' width={20} height={20} />,
    navigateTo: '/materials',
  },
  {
    title: 'Пакеты',
    logo: <Image src={FIFTHACTIVESVG} alt={'packages'} width={20} height={20} />,
    logoInactive: <Image src={fourthInactive} alt='Сводка' width={20} height={20} />,
    navigateTo: '/packages',
  },
  {
    title: 'Сотрудники',
    logo: <Image src={SEVENTHACTIVESVG} alt={'employees'} width={20} height={20} />,
    logoInactive: <Image src={fifthInactive} alt='Сводка' width={20} height={20} />,
    navigateTo: '/employees',
  },
  {
    title: 'Расходы',
    logo: <Image src={SIXTHACTIVESVG} alt={'expenses'} width={20} height={20} />,
    logoInactive: <Image src={sixthInactive} alt='Сводка' width={20} height={20} />,
    navigateTo: '/expenses',
  },
  {
    title: 'Клиенты',
    logo: <Image src={USERS} alt={'expenses'} width={20} height={20} />,
    logoInactive: <Image src={USERS} alt='Сводка' width={20} height={20} />,
    navigateTo: '/clients',
  },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1024);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Обработка изменения размера окна
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false);
      }
    };

    // Устанавливаем начальное значение
    setWindowWidth(window.innerWidth);

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Закрытие профильного меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleNavigation = (path: any) => {
    router.push(path, { scroll: false });
    if (windowWidth < 1024) {
      setIsMenuOpen(false);
    }
  };

  console.log(pathname);

  const renderExportBtn = () => {
    switch (pathname) {
      case '/dashboard':
        return <div></div>;
      case '/application':
        return <div></div>;
      case '/packages':
        return <div></div>;
      default:
        return <div></div>;
    }
  };

  const handleLogout = () => {
    // Очистка куков
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');

    // Перенаправление на страницу входа
    router.push('/auth');
  };

  const renderItems = () =>
    screensArr.map(el => (
      <motion.div
        key={el.title}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={windowWidth < 1024 ? 'w-full' : ''}
      >
        <Button
          onClick={() => handleNavigation(el.navigateTo)}
          className={`rounded-[8px] transition-all duration-300 ease-in-out ${
            pathname === el.navigateTo
              ? 'bg-primary text-white shadow-[0px_0px_24.7px_0px_rgba(10,99,240,0.5)] hover:bg-primary/90'
              : 'bg-secondary/10 text-secondary-foreground hover:bg-secondary/30 shadow-[0px_0px_0px_0px_rgb(0,0,0)]'
          } ${windowWidth < 1024 ? 'w-full justify-start px-4' : ''}`}
        >
          {pathname === el.navigateTo ? el.logo : el.logoInactive}
          <span
            className={`text-[16px] font-semibold ${
              windowWidth < 1024 ? 'ml-3' : pathname !== el.navigateTo ? 'hidden' : 'ml-2'
            }`}
          >
            {el.title}
          </span>
        </Button>
      </motion.div>
    ));

  return (
    <header className='mb-[1rem] w-full rounded-[12px] bg-[#131520] px-4 py-3'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-8'>
          <Image src={LOGO_SVG} width={50} height={60} alt='logo' className='' />

          {/* Десктопная навигация */}
          <nav className='hidden items-center gap-8 lg:flex'>{renderItems()}</nav>

          {/* Кнопка меню для планшетов/мобильных */}
          <button
            className='ml-2 flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#1D232F] lg:hidden'
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X width={20} height={20} /> : <Menu width={20} height={20} />}
          </button>
        </div>

        <div className='flex gap-3'>
          {/* <button className='hidden h-[40px] w-[40px] items-center justify-center rounded-full bg-[#1D232F] px-2 py-2 sm:flex'>
            <Settings width={20} height={20} />
          </button> */}

          {/* Аватар с модальным окном для выхода */}
          <div className='relative' ref={profileMenuRef}>
            <Avatar className='cursor-pointer' onClick={toggleProfileMenu}>
              <AvatarImage src='https://github.com/shadcn.png' />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>

            {/* Модальное окно для профиля */}
            {isProfileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className='absolute right-0 z-50 mt-2 w-48 rounded-md bg-[#1D232F] py-1 shadow-lg ring-1 ring-black ring-opacity-5'
              >
                <Button
                  onClick={handleLogout}
                  className='flex w-full items-center rounded-md px-4 py-2 text-sm text-white hover:bg-[#2A3342]'
                >
                  <LogOut className='mr-2 rounded-md' size={16} />
                  <span>Выйти</span>
                </Button>
              </motion.div>
            )}
          </div>

          {renderExportBtn()}
          {/* <Button className='ml-3 hidden items-center gap-1 rounded-[8px] sm:flex'>
          <File />
          <span className='hidden sm:inline'>Экспорт</span>
        </Button> */}
        </div>
      </div>

      {/* Мобильное меню */}
      {isMenuOpen && (
        <div className='mt-4 pb-2 lg:hidden'>
          <nav className='flex flex-col gap-2'>{renderItems()}</nav>
        </div>
      )}
    </header>
  );
}
