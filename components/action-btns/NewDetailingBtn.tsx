import $api from '@/api/http';
import { useQueryClient } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';
// Импортируем с правильным путем компонент BarcodeScannerModal
// Проверьте, что путь соответствует реальному расположению компонента в вашем проекте
import dynamic from 'next/dynamic';
import Image from 'next/image';
import React, { useState } from 'react';
import { toast } from 'sonner';
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
import EmployeeInput from '@/components/ui/form-input/EmployeeInput';
import MasterEmployeeInput from '@/components/ui/form-input/MaterEmployeeInput';
import MaterialsSelectInput from '@/components/ui/form-input/MaterialsSelectInput';
import PackagesInput from '@/components/ui/form-input/PackagesInput';
import ServicesSelectInput from '@/components/ui/form-input/ServicesselectInput';
import DETAIL_SVG from '../../assets/svg/Detail.svg';
import BarcodeScannerModal from './BarcodeScannerModal';

interface OrderResponse {
  id: number;
  client_name: string;
  client_phone: string;
  employee_name: string;
  total_price: string;
  status: string;
  created_at: string;
  updated_at: string;
  queue_position: number;
  websocket_url: string;
}

const NewDetailingBtn = () => {
  const queryClient: any = useQueryClient();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pickedPackage, setPackage] = useState<number[]>([]);
  const [pickedCarBody, setPickedCarBody] = useState('');
  const [employee, setEmployee] = useState<any>(0);
  const [prepayment, setPrepayment] = useState('');
  const [description, setDescription] = useState('');
  const [services, setServices] = useState<number[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);

  const [car, setCar] = useState('');
  const [modelCar, setModelCar] = useState('');
  const [carNumber, setCarNumber] = useState('');
  const [vinModalData, setVinModalData] = useState<any>({});
  const [vin, setVin] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState<OrderResponse | null>(null);
  const [formErrors, setFormErrors] = useState({
    name: false,
    phone: false,
    carBody: false,
    packages: false,
    services: false,
    employee: false,
    carNumber: false,
  });

  // Format phone number as user types
  const handlePhoneChange = (value: string) => {
    // If input is empty, reset to empty
    if (!value.trim()) {
      setPhone('');
      return;
    }

    // Strip all non-digit characters
    let cleaned = value.replace(/[^\d]/g, '');

    // Ensure it starts with 996
    if (!cleaned.startsWith('996') && cleaned.length > 0) {
      cleaned = '996' + cleaned;
    }

    // Limit to 996 followed by exactly 9 digits (per API requirement)
    if (cleaned.length > 12) {
      cleaned = cleaned.substring(0, 12);
    }

    setPhone(cleaned);
  };

  // Handle prepayment input (only numbers and decimal point)
  const handlePrepaymentChange = (value: string) => {
    // Only allow numbers and a single decimal point
    const regex = /^[0-9]*\.?[0-9]*$/;
    if (regex.test(value) || value === '') {
      setPrepayment(value);
    }
  };

  const validateForm = () => {
    const errors = {
      name: !name.trim().includes(' '), // Must have at least first and last name
      phone: !/^996\d{9}$/.test(phone), // 996 followed by exactly 9 digits
      carBody: !pickedCarBody,
      packages: pickedPackage.length === 0,
      services: services.length === 0,
      employee: !employee,
      carNumber: carNumber.length > 0 && !/^[A-Za-z0-9]+$/.test(carNumber), // Only Latin letters and numbers
    };

    setFormErrors(errors);

    // Return true if no errors
    return !Object.values(errors).some(error => error);
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setPackage([]);
    setPickedCarBody('');
    setEmployee(0);
    setPrepayment('');
    setDescription('');
    setServices([]);
    setMaterials([]);
    setCar('');
    setModelCar('');
    setCarNumber('');
    setVin('');
    setFormErrors({
      name: false,
      phone: false,
      carBody: false,
      packages: false,
      services: false,
      employee: false,
      carNumber: false,
    });
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
      client_last_name: nameParts.slice(1).join(' ') || '',
      client_phone: phone,
      car_brand: car,
      car_model: modelCar,
      car_vin: vin,
      car_license_plate: carNumber,
      car_body_type: pickedCarBody,
      services: services,
      packages: pickedPackage,
      employee: employee,
      prepayment: prepayment || '0.00',
      materials: materials.map(m => ({
        material: m.material,
        quantity: m.quantity,
      })),
    };

    try {
      const response = await $api.post('/master/orders/', data);
      await queryClient.invalidateQueries(['detailingList']);

      // Store the order details
      setOrderDetails(response.data);

      // Show success message
      toast.success('Заявка успешно создана!');
      // Close the main dialog and open QR modal
      setIsDialogOpen(false);
      setIsQrModalOpen(true);
    } catch (e: any) {
      const errorMessage = e.response?.data || 'Произошла ошибка при создании заявки';
      toast.error(errorMessage);
    }
  };

  // Обработчик успешного сканирования VIN-кода
  const handleScannedVin = (scannedVin: string) => {
    console.log('VIN отсканирован:', scannedVin);
    setVin(scannedVin);
    setIsScannerOpen(false);
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
          <h1 className={'text-[36px] font-bold'}>Детейлинг</h1>
          <Image src={DETAIL_SVG} alt={'pena'} />
        </DialogTrigger>
        <DialogContent className={'w-full max-w-[1000px] rounded-xl bg-[#131520] px-10 py-10'}>
          <DialogHeader className={'border-b-[1px] border-[#1D3253] pb-5'}>
            <div className={'mb-2 flex items-center justify-between gap-20'}>
              <h1 className={'text-[18px] font-bold'}>Новая заявка Детейлинг</h1>
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
                  title={'Имя гостя'}
                  placeholder={'Имя и фамилия'}
                  value={name}
                  onChange={setName}
                  validation={{
                    required: true,
                    customValidate: value => value.trim().includes(' '),
                    errorMessage: 'Введите имя и фамилию',
                  }}
                />
                {formErrors.name && (
                  <p className='mt-1 text-xs text-red-500'>Введите имя и фамилию</p>
                )}
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
                {formErrors.phone && (
                  <p className='mt-1 text-xs text-red-500'>{`Номер должен быть в формате: 996**********`}</p>
                )}
              </div>
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
                <MasterEmployeeInput
                  title={'Сотрудник *'}
                  placeholder={'Выберите сотрудника'}
                  value={employee}
                  onChange={setEmployee}
                />
                {formErrors.employee && (
                  <p className='mt-1 text-xs text-red-500'>Выберите сотрудника</p>
                )}
              </div>
              <FormInput
                title={'Предоплата'}
                placeholder={'Введите сумму'}
                value={prepayment}
                onChange={handlePrepaymentChange}
                type='text'
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
              <div className='relative'>
                <ServicesSelectInput
                  title={'Услуги *'}
                  placeholder={'Выберите услугу'}
                  onChange={setServices}
                />
                {formErrors.services && (
                  <p className='mt-1 text-xs text-red-500'>Выберите хотя бы одну услугу</p>
                )}
              </div>
              <MaterialsSelectInput
                title={'Материалы *'}
                placeholder={'Выберите материал'}
                onChange={setMaterials}
              />
              <div className='flex items-center gap-2'>
                <FormInput
                  title='VIN код авто'
                  placeholder='Введите код или отсканируйте'
                  value={vin}
                  onChange={setVin}
                />
                <button
                  onClick={() => setIsScannerOpen(true)}
                  className='mt-6 rounded bg-blue-500 px-3 py-2 text-sm text-white hover:bg-blue-600'
                >
                  Скан
                </button>
              </div>
              <CarInput
                title={'Марка авто'}
                placeholder={'Выберите марку'}
                value={car}
                onChange={setCar}
              />
              <CarModelInput
                title={'Модель авто'}
                placeholder={'Выберите модель'}
                value={modelCar}
                onChange={setModelCar}
                modelId={car}
              />
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
                />
                {formErrors.carNumber && (
                  <p className='mt-1 text-xs text-red-500'>Только латинские буквы и цифры</p>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Модальное окно сканера VIN-кода, которое появляется только когда isScannerOpen = true */}
      {isScannerOpen && (
        <BarcodeScannerModal
          onClose={() => setIsScannerOpen(false)}
          onScanned={handleScannedVin}
          setVin={setVin}
          initialVin={vin}
          setVinModalData={setVinModalData}
          setCar={setCar}
          setModelCar={setModelCar}
        />
      )}
    </>
  );
};

export default NewDetailingBtn;
