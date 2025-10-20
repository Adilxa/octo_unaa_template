'use client';

import $api from '@/api/http';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const AuthScreen = () => {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle phone number formatting
  const handlePhoneChange = (value: string) => {
    // Strip all non-digit characters
    let cleaned = value.replace(/[^\d]/g, '');

    // Ensure it starts with 996
    if (!cleaned.startsWith('996') && cleaned.length > 0) {
      cleaned = '996' + cleaned;
    }

    // Limit to 996 followed by exactly 9 digits
    if (cleaned.length > 12) {
      cleaned = cleaned.substring(0, 12);
    }

    setPhoneNumber(cleaned);
  };

  const validateForm = () => {
    if (!phoneNumber || !password) {
      toast.error('Ошибка входа', {
        description: 'Пожалуйста, заполните все поля',
      });
      return false;
    }

    if (!/^996\d{9}$/.test(phoneNumber)) {
      toast.error('Неверный формат номера', {
        description: 'Формат: 996xxxxxxxxx (9 цифр)',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const res = await $api.post('/accounts/api/login/', {
        phone: phoneNumber,
        password,
      });

      const { access, refresh } = res.data;

      const oneWeekInSeconds = 7 * 24 * 60 * 60;

      // Set cookies
      document.cookie = `access_token=${access}; path=/; max-age=${oneWeekInSeconds}; Secure`;
      document.cookie = `refresh_token=${refresh}; path=/; max-age=${oneWeekInSeconds}; Secure`;

      toast.success('Успешный вход', {
        description: 'Вы успешно вошли в систему',
      });

      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 300);
    } catch (error: any) {
      console.log(error);
      toast.error('Ошибка входа', {
        description: error.response.data,
      });
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  console.log(isLoading);

  return (
    <div className='flex items-center'>
      <div className='flex h-screen w-[100%] items-center justify-center'>
        <Card className='flex w-full max-w-md flex-col gap-10 border-[0px] bg-[#01030e]'>
          <CardHeader className='text-center'>
            {/* <img
              style={{ margin: '0 auto 40px' }}
              width={'256px'}
              src='/images/logo.svg'
              alt='logo'
            /> */}
            <CardTitle className='text-2xl'>Войдите в систему</CardTitle>
            <CardDescription className='color-[#71717A]'>
              Введите номер телефона <br />и пароль от системы
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-5'>
              <div className='space-y-2'>
                <Label htmlFor='phone'>Телефон</Label>
                <Input
                  className='rounded-[8px]'
                  id='phone'
                  type='tel'
                  value={phoneNumber}
                  onChange={e => handlePhoneChange(e.target.value)}
                  placeholder='996xxxxxxxxx'
                  required
                />
              </div>
              <div className='mb-[2rem] space-y-2'>
                <Label htmlFor='password'>Пароль</Label>
                <Input
                  id='password'
                  type='password'
                  value={password}
                  className='rounded-[8px]'
                  onChange={e => setPassword(e.target.value)}
                  placeholder='••••••••'
                  required
                />
              </div>
              <Button
                type='submit'
                className='w-full rounded-[8px] shadow-[0px_0px_24.7px_0px_rgba(10,99,240,0.5)]'
                style={{ marginTop: '4rem' }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className='flex items-center'>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Загрузка...
                  </span>
                ) : (
                  'Войти'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        <Toaster />
      </div>
    </div>
  );
};

export default AuthScreen;
