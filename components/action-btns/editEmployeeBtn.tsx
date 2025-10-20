import $api from '@/api/http';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';
import React, { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogPortal,
  DialogTrigger,
} from '@/components/ui/dialog';
import FormInput from '@/components/ui/form-input';
import EmployeeCategoriesInput from '@/components/ui/form-input/EmployeeCategoryInput';
import FillialInput from '@/components/ui/form-input/FillialInput';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface Props {
  id: number;
  onSuccess?: () => void; // Колбэк при успешном обновлении
}

const fetchEmployee = async (id: number) => {
  const res = await $api.get('/employee/employees/' + id + '/');
  return res.data;
};

const fetchPositions = async () => {
  const res = await $api.get('/accounts/positions/list/');
  return res.data;
};

const fetchFillials = async () => {
  const res = await $api.get('/shared/branches/');
  return res.data;
};

const EditEmployeeBtn: React.FC<Props> = ({ id, onSuccess }) => {
  const queryClient: any = useQueryClient();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState<any>('');
  const [fillial, setFillial] = useState<any>('');
  const [salary, setSalary] = useState('');
  const [procentageGraph, setProcentageGraph] = useState('');
  const [status, setStatus] = useState('active');
  const [description, setDescription] = useState('');

  // Состояние для ошибок валидации
  const [errors, setErrors] = useState<{
    fullName?: string;
    phone?: string;
    position?: string;
    fillial?: string;
  }>({});

  // Флаг для блокировки обработки клавиши Escape
  const [blockEscClose, setBlockEscClose] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => fetchEmployee(id),
    enabled: !!id && open,
  });

  const { data: positionsList } = useQuery({
    queryKey: ['positionList'],
    queryFn: fetchPositions,
    enabled: open,
  });

  const { data: fillialsList } = useQuery({
    queryKey: ['fillialsList'],
    queryFn: fetchFillials,
    enabled: open,
  });

  // Функция для поиска ID позиции по имени
  const findPositionId = (positionName: any) => {
    if (!positionsList || !positionName) return '';
    const position = positionsList.find((pos: any) => pos.name === positionName);
    return position ? position.id : '';
  };

  // Функция для поиска ID филиала по имени
  const findFillialId = (branchName: any) => {
    if (!fillialsList || !branchName) return '';
    const branch = fillialsList.find((branch: any) => branch.name === branchName);
    return branch ? branch.id : '';
  };

  useEffect(() => {
    if (data) {
      // Форматируем полное имя из first_name и last_name
      setFullName(`${data.first_name || ''} ${data.last_name || ''}`.trim());

      // Форматируем телефон
      let phoneNumber = data.phone || '';
      if (phoneNumber && !phoneNumber.includes(' ')) {
        if (phoneNumber.length > 3) {
          phoneNumber = phoneNumber.substring(0, 3) + ' ' + phoneNumber.substring(3);
        }
        if (phoneNumber.length > 7) {
          phoneNumber = phoneNumber.substring(0, 7) + ' ' + phoneNumber.substring(7);
        }
      }
      setPhone(phoneNumber);

      setSalary(data.commission_rate || data.salary || '0.00');
      setStatus(data.status === 'True' ? 'active' : 'inactive');
      setDescription(data.description || '');

      // Установим значение графика работы из данных
      setProcentageGraph(data.salary || '0.00');

      // Сбрасываем ошибки при загрузке данных
      setErrors({});
    }
  }, [data]);

  useEffect(() => {
    if (data && positionsList) {
      const posId = findPositionId(data.position_name || data.position);
      setPosition(posId);
    }
  }, [data, positionsList]);

  useEffect(() => {
    if (data && fillialsList) {
      const fillId = findFillialId(data.branch_name);
      setFillial(fillId);
    }
  }, [data, fillialsList]);

  // Форматирование номера телефона при вводе
  const handlePhoneChange = (value: string) => {
    // Удаляем все нецифровые символы
    let cleaned = value.replace(/\D/g, '');

    // Если номер начинается не с 996, добавляем его
    if (!cleaned.startsWith('996')) {
      // Если номер начинается с 0, заменяем его на 996
      if (cleaned.startsWith('0')) {
        cleaned = '996' + cleaned.substring(1);
      }
      // Если номер не пустой и не начинается с 996, добавляем 996 в начало
      else if (cleaned && !cleaned.startsWith('996')) {
        cleaned = '996' + cleaned;
      }
    }

    // Ограничиваем длину до 12 символов (996 + 9 цифр)
    cleaned = cleaned.substring(0, 12);

    // Форматируем номер телефона для отображения
    let formatted = cleaned;
    if (cleaned.length > 3) {
      formatted = cleaned.substring(0, 3) + ' ' + cleaned.substring(3);
    }
    if (cleaned.length > 6) {
      formatted = formatted.substring(0, 7) + ' ' + formatted.substring(7);
    }

    setPhone(formatted);

    // Валидация номера телефона
    validatePhone(formatted);
  };

  // Валидация номера телефона
  const validatePhone = (phoneNumber: string) => {
    const cleaned = phoneNumber.replace(/\D/g, '');

    if (!cleaned) {
      setErrors(prev => ({ ...prev, phone: 'Номер телефона обязателен' }));
      return false;
    }

    if (!cleaned.startsWith('996')) {
      setErrors(prev => ({ ...prev, phone: 'Номер должен начинаться с 996' }));
      return false;
    }

    if (cleaned.length !== 12) {
      setErrors(prev => ({ ...prev, phone: 'Номер должен состоять из 12 цифр (996 + 9 цифр)' }));
      return false;
    }

    // Если все проверки пройдены, очищаем ошибку
    setErrors(prev => ({ ...prev, phone: undefined }));
    return true;
  };

  // Валидация поля имени и фамилии
  const validateFullName = (name: string) => {
    if (!name.trim()) {
      setErrors(prev => ({ ...prev, fullName: 'Имя и фамилия обязательны' }));
      return false;
    }

    const nameParts = name.trim().split(' ');
    if (nameParts.length < 2) {
      setErrors(prev => ({ ...prev, fullName: 'Введите и имя, и фамилию' }));
      return false;
    }

    // Проверка на минимальную длину имени и фамилии
    if (nameParts[0].length < 2 || nameParts[1].length < 2) {
      setErrors(prev => ({ ...prev, fullName: 'Имя и фамилия должны быть не короче 2 символов' }));
      return false;
    }

    // Если все проверки пройдены, очищаем ошибку
    setErrors(prev => ({ ...prev, fullName: undefined }));
    return true;
  };

  // Обработчик изменения полного имени
  const handleFullNameChange = (value: string) => {
    setFullName(value);
    validateFullName(value);
  };

  // Валидация должности
  const validatePosition = () => {
    if (!position) {
      setErrors(prev => ({ ...prev, position: 'Должность обязательна' }));
      return false;
    }
    setErrors(prev => ({ ...prev, position: undefined }));
    return true;
  };

  // Валидация филиала
  const validateFillial = () => {
    if (!fillial) {
      setErrors(prev => ({ ...prev, fillial: 'Филиал обязателен' }));
      return false;
    }
    setErrors(prev => ({ ...prev, fillial: undefined }));
    return true;
  };

  // Валидация формы перед отправкой
  const validateForm = () => {
    const isNameValid = validateFullName(fullName);
    const isPhoneValid = validatePhone(phone);
    const isPositionValid = validatePosition();
    const isFillialValid = validateFillial();

    return isNameValid && isPhoneValid && isPositionValid && isFillialValid;
  };

  // Обработчик для перехвата нажатий на клавиши
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Если диалог открыт и нажат пробел, предотвращаем действие по умолчанию
      if (open && e.key === ' ' && !isTargetInput(e.target as HTMLElement)) {
        e.stopPropagation();
        e.preventDefault();
      }

      // Если пользователь находится в поле ввода, блокируем закрытие по Escape
      if (open && e.key === 'Escape' && isTargetInput(e.target as HTMLElement)) {
        e.stopPropagation();
        e.preventDefault();
        setBlockEscClose(true);
        // Сбрасываем флаг через небольшую задержку
        setTimeout(() => setBlockEscClose(false), 100);
      }
    };

    // Проверка является ли целевой элемент полем ввода
    const isTargetInput = (target: HTMLElement): boolean => {
      return (
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
      );
    };

    // Добавляем обработчик к документу
    document.addEventListener('keydown', handleKeyDown as any);

    // Удаляем обработчик при размонтировании
    return () => {
      document.removeEventListener('keydown', handleKeyDown as any);
    };
  }, [open]);

  const onUpdateEmployee = async () => {
    // Проверяем валидацию перед отправкой
    if (!validateForm()) {
      toast('Пожалуйста, исправьте ошибки в форме');
      return;
    }

    try {
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Выполняем API-запрос
      const response = await $api.put(`/employee/employees/${id}/update/`, {
        first_name: firstName,
        last_name: lastName,
        phone: phone.replace(/\s/g, ''), // Удаляем пробелы перед отправкой
        position: position,
        branch: fillial,
        is_active: status === 'active',
        commission_rate: salary,
        description: description,
      });

      // Если запрос успешен, сразу закрываем окно
      setOpen(false);

      // Показываем сообщение об успехе
      toast('Сотрудник успешно обновлен');

      // Инвалидируем запросы для обновления данных (это можно делать после закрытия)
      queryClient.invalidateQueries(['employeeList']);
      queryClient.invalidateQueries(['employee', id]);

      // Вызов колбэка успешного обновления, если он был передан
      if (typeof onSuccess === 'function') {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Update error:', error);
      toast('Ошибка при обновлении сотрудника');
    }
  };

  // Обработчик для открытия/закрытия диалога
  const handleOpenChange = (newOpen: boolean) => {
    // Если пытаемся закрыть диалог и установлен флаг блокировки - игнорируем
    if (!newOpen && blockEscClose) {
      return;
    }
    setOpen(newOpen);
    if (newOpen) {
      // Сбрасываем ошибки при открытии диалога
      setErrors({});
    }
  };

  // Stop propagation for all clicks inside the dialog
  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Обработчик для кнопки "Изменить"
  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          className='w-full text-left'
          onClick={handleTriggerClick}
          onKeyDown={e => {
            // Предотвращаем закрытие диалога при нажатии пробела на кнопке триггера
            if (e.key === ' ') {
              e.stopPropagation();
            }
          }}
        >
          Изменить
        </button>
      </DialogTrigger>
      <DialogPortal>
        <DialogContent
          ref={dialogRef}
          className='fixed left-[50%] top-[50%] z-50 w-full max-w-[700px] translate-x-[-50%] translate-y-[-50%] rounded-xl bg-[#131520] px-10 py-10'
          onClick={handleDialogClick}
          onKeyDown={e => {
            // Предотвращаем действие по умолчанию для пробела внутри диалога
            if (e.key === ' ') {
              e.stopPropagation();
            }
          }}
        >
          {isLoading ? (
            <div className='flex items-center justify-center py-8'>
              <p>Загрузка данных сотрудника...</p>
            </div>
          ) : (
            <>
              <DialogHeader className={'border-b-[1px] border-[#1D3253] pb-5'}>
                <div className={'mb-2 flex items-center justify-between gap-20'}>
                  <h1 className={'text-[18px] font-bold'}>Редактирование сотрудника</h1>
                  <div className={'flex items-center gap-5'}>
                    <Button
                      onClick={e => {
                        e.stopPropagation();
                        onUpdateEmployee();
                      }}
                      className={'rounded-[4px] bg-[#171928]'}
                    >
                      <Check /> Сохранить
                    </Button>
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
                <p className={'text-[12px] font-medium text-[#1D3253]'}>
                  После изменения информации <br /> обязательно нажмите кнопку сохранить
                </p>
              </DialogHeader>
              <div
                className={'flex flex-col gap-5'}
                onClick={e => e.stopPropagation()}
                onKeyDown={e => {
                  // Предотвращаем обработку пробела на уровне формы
                  if (e.key === ' ') {
                    e.stopPropagation();
                  }
                }}
              >
                <div>
                  <FormInput
                    title={'Фамилия Имя'}
                    placeholder={'Введите имя и фамилию'}
                    value={fullName}
                    onChange={handleFullNameChange}
                  />
                  {errors.fullName && (
                    <p className='mt-1 text-sm text-red-500'>{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <FormInput
                    title={'Телефон'}
                    placeholder={'996 XXX XXXXXX'}
                    value={phone}
                    onChange={handlePhoneChange}
                  />
                  {errors.phone && <p className='mt-1 text-sm text-red-500'>{errors.phone}</p>}
                </div>

                <div>
                  <EmployeeCategoriesInput
                    title={'Должность'}
                    placeholder={'Должность'}
                    value={position}
                    onChange={val => {
                      setPosition(val);
                      if (val) {
                        setErrors(prev => ({ ...prev, position: undefined }));
                      }
                    }}
                  />
                  {errors.position && (
                    <p className='mt-1 text-sm text-red-500'>{errors.position}</p>
                  )}
                </div>

                <div>
                  <FillialInput
                    title={'Филиал'}
                    placeholder={'Филиал'}
                    value={fillial}
                    onChange={val => {
                      setFillial(val);
                      if (val) {
                        setErrors(prev => ({ ...prev, fillial: undefined }));
                      }
                    }}
                  />
                  {errors.fillial && <p className='mt-1 text-sm text-red-500'>{errors.fillial}</p>}
                </div>

                <FormInput
                  title={'Зарплата в процентах %'}
                  placeholder={'Введите процент с заказа'}
                  value={salary}
                  onChange={setSalary}
                />

                <div
                  className='flex items-center justify-between gap-[10rem]'
                  onClick={e => e.stopPropagation()}
                >
                  <Label className={'w-[60px]'}>Статус</Label>
                  <RadioGroup value={status} onValueChange={setStatus} className='flex gap-5'>
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='active' id={`active-${id}`} />
                      <Label htmlFor={`active-${id}`}>Активный</Label>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='inactive' id={`inactive-${id}`} />
                      <Label htmlFor={`inactive-${id}`}>Не активный</Label>
                    </div>
                  </RadioGroup>
                </div>
                <FormInput
                  title={'Примечание'}
                  placeholder={'Опциональное поле'}
                  value={description}
                  onChange={setDescription}
                  isTextArea={true}
                />
              </div>
            </>
          )}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default EditEmployeeBtn;
