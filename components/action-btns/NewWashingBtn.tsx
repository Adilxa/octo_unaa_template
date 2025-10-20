import $api from '@/api/http';
import { useQueryClient } from '@tanstack/react-query';
import { Check, QrCode, X } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import BarcodeWashing from '@/components/barcode-washing';
import EmployeesSelect from '@/components/employees-select';
import QrCodeModal from '@/components/qrCode/QrCodeModal';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import FormInput from '@/components/ui/form-input';
import CarModelInput from '@/components/ui/form-input/AutoModelInput';
import CarBodyInput from '@/components/ui/form-input/CarBodyInput';
import CarInput from '@/components/ui/form-input/CarInput';
import PackagesInput from '@/components/ui/form-input/PackagesInput';
import VinCodeInput from '@/components/ui/form-input/VinCodeInput';
import PENA_SVG from '../../assets/svg/pena.svg';
import BarcodeScannerModal from './BarcodeScannerModal';

interface OrderResponse {
  id: number;
  client_name: string;
  client_phone: string;
  employee_name: string;
  package_details: Array<{
    name: string;
    price: number;
  }>;
  total_price: string;
  status: string;
  created_at: string;
  updated_at: string;
  queue_position: number;
  websocket_url: string;
}

const NewWashingBtn = () => {
  const queryClient: any = useQueryClient();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pickedPackage, setPackage] = useState<any>('');
  const [pickedCarBody, setPickedCarBody] = useState('');
  const [description, setDescription] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const [car, setCar] = useState('');
  const [employee, setEmployee] = useState('');
  const [modelCar, setModelCar] = useState('');
  const [carNumber, setCarNumber] = useState('');
  const [vin, setVin] = useState('');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState<OrderResponse | null>(null);
  const [formErrors, setFormErrors] = useState({
    phone: false,
    carBody: false,
    packages: false,
    carNumber: false,
  });

  const handleSelectCarSuggestion = (suggestion: any) => {
    // Заполняем данные клиента
    setName(`${suggestion.first_name} ${suggestion.last_name || ''}`);
    setPhone(suggestion.phone);

    // Заполняем данные автомобиля
    setCarNumber(suggestion.car_license_plate);
    setVin(suggestion.car_vin || '');

    // Преобразуем ID в числа
    const brandId = parseInt(suggestion.car_brand_id, 10);
    const modelId = parseInt(suggestion.car_model_id, 10);
    const bodyTypeId = parseInt(suggestion.car_body_type_id, 10);

    // Сначала устанавливаем марку автомобиля
    setCar(brandId.toString());

    // Последовательное заполнение полей с задержками
    setTimeout(() => {
      // Пробуем выбрать значение в селекторе марки
      forceSelectValue('Марка авто', brandId);

      // Затем с задержкой пробуем выбрать модель
      setTimeout(() => {
        setModelCar(modelId.toString());
        forceSelectValue('Модель авто', modelId);

        // В конце с задержкой выбираем тип кузова
        setTimeout(() => {
          setPickedCarBody(bodyTypeId.toString());
          forceSelectValue('Тип кузова', bodyTypeId);
        }, 800);
      }, 800);
    }, 300);

    const forceSelectValue = (selectLabel: any, valueToSelect: any) => {
      try {
        // Находим все элементы типа SelectTrigger
        const selectTriggers: any = document.querySelectorAll('[data-state]');

        for (const trigger of selectTriggers) {
          const parentDiv = trigger.closest('div');
          if (!parentDiv) continue;

          // Ищем заголовок/метку рядом с селектором
          const label = parentDiv.querySelector('h1, label');
          if (!label) continue;

          const labelText = label.textContent;

          // Находим селектор с нужной меткой
          if (labelText && labelText.includes(selectLabel)) {
            // Имитируем клик на селектор
            trigger.click();

            // Даем время на открытие выпадающего списка
            setTimeout(() => {
              try {
                // Ищем все элементы списка
                const selectItems: any = document.querySelectorAll('[role="option"]');
                let itemFound = false;

                for (const item of selectItems) {
                  const dataValue =
                    item.getAttribute('data-value') ||
                    item.getAttribute('value') ||
                    item.textContent;

                  // Пробуем найти элемент по значению или содержимому
                  if (
                    dataValue === valueToSelect.toString() ||
                    item.textContent.includes(valueToSelect.toString())
                  ) {
                    item.click();
                    itemFound = true;
                    console.log(`Выбрано значение для ${selectLabel}: ${valueToSelect}`);
                    break;
                  }
                }

                // Если не нашли, закрываем селектор
                if (!itemFound) {
                  console.log(`Не найдено значение ${valueToSelect} для селектора ${selectLabel}`);
                  document.body.click(); // Клик в любом месте закрывает селектор
                }
              } catch (err: any) {
                console.error(`Ошибка при выборе значения: ${err.message}`);
                document.body.click(); // В случае ошибки закрываем селектор
              }
            }, 300);

            return true; // Нашли и обработали нужный селектор
          }
        }

        return false; // Не нашли селектор с такой меткой
      } catch (error: any) {
        toast.error(error.response?.data);
        return false;
      }
    };

    // Сбрасываем ошибки формы
    setFormErrors(prevErrors => ({
      ...prevErrors,
      carNumber: false,
      name: false,
      phone: false,
      carBody: false,
    }));
  };

  const handlePhoneChange = (value: string) => {
    if (!value.trim()) {
      setPhone('');
      return;
    }

    let cleaned = value.replace(/[^\d]/g, '');

    if (!cleaned.startsWith('996') && cleaned.length > 0) {
      cleaned = '996' + cleaned;
    }

    if (cleaned.length > 12) {
      cleaned = cleaned.substring(0, 12);
    }

    setPhone(cleaned);
  };

  const validateForm = () => {
    const errors = {
      phone: !/^996\d{9}$/.test(phone), // 996 followed by exactly 9 digits
      carBody: !pickedCarBody,
      packages: !pickedPackage,
      carNumber: carNumber.length > 0 && !/^[A-Za-z0-9]+$/.test(carNumber), // Only Latin letters and numbers
    };

    setFormErrors(errors);

    // Return true if no errors
    return !Object.values(errors).some(error => error);
  };

  const onCreateApplicationWashing = async () => {
    // Validate form before submission
    if (!validateForm()) {
      toast.error('Пожалуйста, заполните все обязательные поля корректно');
      return;
    }

    const nameParts = name.trim().split(' ');

    const data = {
      client_first_name: nameParts[0] || '',
      // client_last_name: nameParts.slice(1).join(' ') || '',
      client_phone: phone,
      car_model: modelCar,
      car_vin: vin,
      car_license_plate: carNumber,
      car_body_type: pickedCarBody,
      packages: pickedPackage,
      car_brand: car,
      employee: employee,
    };

    try {
      const response = await $api.post('washing/washing_orders/', data);
      await queryClient.invalidateQueries(['washingList']);

      // Store the order details
      setOrderDetails(response.data);

      // Show success message
      toast.success('Заявка успешно создана!');

      // Close the main dialog and open QR modal
      setIsDialogOpen(false);
      setIsQrModalOpen(true);
    } catch (e: any) {
      toast.error(e.response?.data);
    }
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setPackage('');
    setPickedCarBody('');
    setDescription('');
    setCar('');
    setModelCar('');
    setCarNumber('');
    setVin('');
    setEmployee('');
    setFormErrors({
      phone: false,
      carBody: false,
      packages: false,
      carNumber: false,
    });
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger
          onClick={() => setIsDialogOpen(true)}
          className={
            'flex h-[390px] w-[390px] flex-col items-center gap-10 rounded-xl bg-[#171928] p-5 shadow'
          }
        >
          <h1 className={'text-[36px] font-bold'}>Мойка</h1>
          <Image src={PENA_SVG} alt={'pena'} />
        </DialogTrigger>
        <DialogContent className={'w-full max-w-[1000px] rounded-xl bg-[#131520] px-10 py-10'}>
          <DialogHeader className={'border-b-[1px] border-[#1D3253] pb-5'}>
            <div className={'mb-2 flex items-center justify-between gap-20'}>
              <h1 className={'text-[18px] font-bold'}>Новая заявка МОЙКА</h1>
              <div className={'flex items-center gap-5'}>
                <Button
                  onClick={() => onCreateApplicationWashing()}
                  className={'rounded-[4px] bg-[#171928]'}
                >
                  <Check /> Сохранить
                </Button>
                <DialogClose asChild>
                  <Button
                    onClick={resetForm}
                    className={'rounded-[4px] bg-[#01030E] text-[#0A63F0] hover:text-white'}
                  >
                    <X />
                    Отменить
                  </Button>
                </DialogClose>
              </div>
            </div>
            <p className={'text-[12px] font-medium text-[#1D3253]'}>
              После добавления информации <br /> обязательно нажмите кнопку сохранить
            </p>
          </DialogHeader>
          <div className={'flex items-start justify-between gap-5'}>
            <div className={'flex flex-col gap-5'}>
              <div className='relative'>
                <FormInput
                  title={'Номер авто'}
                  placeholder={'01xxx01'}
                  value={carNumber}
                  onChange={setCarNumber}
                  validation={{
                    pattern: /^[A-Za-z0-9]+$/,
                    errorMessage: 'Только латинские буквы и цифры',
                  }}
                  isAutocomplete={true} // Включаем автозаполнение
                  onSelectSuggestion={handleSelectCarSuggestion}
                />
                {formErrors.carNumber && (
                  <p className='mt-1 text-xs text-red-500'>Только латинские буквы и цифры</p>
                )}
              </div>
              <CarInput
                title={'Марка авто'}
                placeholder={'Выбрать марку'}
                value={car}
                onChange={setCar}
              />

              <CarModelInput
                title={'Модель авто'}
                placeholder={'Выбрать модель'}
                value={modelCar}
                onChange={setModelCar}
                modelId={car}
              />
              <div className='relative'>
                <CarBodyInput
                  title={'Тип кузова *'}
                  placeholder={'Выберете кузов'}
                  value={pickedCarBody}
                  onChange={setPickedCarBody}
                />
                {formErrors.carBody && (
                  <p className='mt-1 text-xs text-red-500'>Выберите тип кузова</p>
                )}
              </div>
              <div className='relative'>
                <FormInput
                  title={'Имя гостя'}
                  placeholder={'Имя *'}
                  value={name}
                  onChange={setName}
                />
              </div>
              <div className='relative'>
                <FormInput
                  title={'Телефон'}
                  placeholder={'996xxxxxxxxx'}
                  value={phone}
                  onChange={handlePhoneChange}
                  validation={{
                    required: true,
                    pattern: /^996\d{9}$/,
                    errorMessage: 'Формат: 996xxxxxxxxx (9 цифр)',
                  }}
                  type='tel'
                />
                {formErrors.phone && <p className='mt-1 text-xs text-red-500'>{`996**********`}</p>}
              </div>
              <EmployeesSelect
                title={'Мойщик'}
                placeholder={'Выберете мойщика'}
                value={employee}
                onChange={setEmployee}
              />
              <FormInput
                title={'Примечание'}
                placeholder={'Опциональное поле'}
                value={description}
                onChange={setDescription}
                isTextArea={true}
              />
            </div>
            <div className={'flex flex-col gap-5'}>
              <div className='relative'>
                {pickedCarBody && (
                  <>
                    <PackagesInput
                      carBodyType={pickedCarBody}
                      title={'Пакеты *'}
                      placeholder={'Выберете пакет'}
                      onChange={setPackage}
                    />
                    {formErrors.packages && (
                      <p className='mt-1 text-xs text-red-500'>Выберите пакет</p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Modal */}
      {orderDetails && (
        <QrCodeModal
          isOpen={isQrModalOpen}
          onOpenChange={setIsQrModalOpen}
          websocketUrl={orderDetails.websocket_url}
          orderDetails={{
            id: orderDetails.id,
            client_name: orderDetails.client_name,
            queue_position: orderDetails.queue_position,
            status: orderDetails.status,
          }}
        />
      )}
    </>
  );
};

export default NewWashingBtn;
