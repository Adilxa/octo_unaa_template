'use client';

import $api from '@/api/http';
import { useQueryClient } from '@tanstack/react-query';
import { Check, ChevronLeft, ChevronRight, Download, Eye, Plus, Printer, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { toast, Toaster } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import FormInput from '@/components/ui/form-input';
import CarModelInput from '@/components/ui/form-input/AutoModelInput';
import CarBodyInput from '@/components/ui/form-input/CarBodyInput';
import CarInput from '@/components/ui/form-input/CarInput';
import MasterEmployeeInput from '@/components/ui/form-input/MaterEmployeeInput';
import MaterialsSelectInput from '@/components/ui/form-input/MaterialsSelectInput';
import PackagesInput from '@/components/ui/form-input/PackagesInput';
import BarcodeScannerModal from '../action-btns/BarcodeScannerModal';
import MaterialsTab from '../materials-tab';
import MiniOrdersList from '../mini-orders';
import ServiceDropdownModal from '../service-modal';
import ServiceDrawer from '../service-modal';
import UiFolder from '../ui/ui-folder';
import print_icon from '/public/images/icon.svg';

// Интерфейс для материалов
interface Material {
  material: string;
  quantity: string;
}

// Интерфейс для mini_order
interface MiniOrder {
  employee: number;
  services: number[];
  commission_rate: string;
  materials: Material[];
  employeeName?: any;
}

// Интерфейс для данных заказа
interface OrderData {
  car: string;
  modelCar: string;
  carNumber: string;
  vin: string;
  pickedCarBody: string;
  prepayment: string;
  description: string;
  miniOrders: MiniOrder[];
  allMaterials: Material[]; // Derived
}

// Интерфейс для данных чека
interface ReceiptData {
  orderId: number;
  orderNumber: string;
  clientName: string;
  clientPhone: string;
  carInfo: string;
  carVin?: string;
  services: Array<{
    name: string;
    price: string;
    employeeName: string;
  }>;
  materials: Array<{
    name: string;
    quantity: string;
    price: string;
    totalPrice: number;
  }>;
  totalAmount: number | string;
  prepayment: string;
  createdDate: string;
}

const DetailingScreen = () => {
  // Define the tabs for the folder component
  const folderTabs = [
    { title: 'Информация о заявке', link: 'info' },
    { title: 'Материалы', link: 'materials' },
  ];

  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'info';
  const router = useRouter();

  // Состояние для модального окна с чеком
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [currentReceiptIndex, setCurrentReceiptIndex] = useState(0);
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);

  const onCloseModal = () => {
    if (receiptModalOpen) {
      setReceiptModalOpen(false);
      router.push('/applications');
    } else {
      setReceiptModalOpen(true);
    }
  };

  // Устанавливаем значение по умолчанию при загрузке страницы
  useEffect(() => {
    // Проверяем, есть ли параметр tab в URL
    if (!searchParams.has('tab')) {
      // Если нет, добавляем его
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set('tab', 'info');

      // Заменяем текущий URL с новыми параметрами
      router.replace(`${window.location.pathname}?${newParams.toString()}`, { scroll: false });
    }
  }, [router, searchParams]);

  // Shared states
  const [sharedName, setSharedName] = useState('');
  const [sharedPhone, setSharedPhone] = useState('');

  // Per-order states
  const [orders, setOrders] = useState<OrderData[]>([
    {
      car: '',
      modelCar: '',
      carNumber: '',
      vin: '',
      pickedCarBody: '',
      prepayment: '',
      description: '',
      miniOrders: [],
      allMaterials: [],
    },
  ]);
  const [currentOrderIndex, setCurrentOrderIndex] = useState(0);

  const currentOrder = orders[currentOrderIndex];

  // Derived setters for current order
  const setCar = (val: string) => updateOrder('car', val);
  const setModelCar = (val: string) => updateOrder('modelCar', val);
  const setCarNumber = (val: string) => updateOrder('carNumber', val);
  const setVin = (val: string) => updateOrder('vin', val);
  const setPickedCarBody = (val: string) => updateOrder('pickedCarBody', val);
  const setPrepayment = (val: string) => updateOrder('prepayment', val);
  const setDescription = (val: string) => updateOrder('description', val);
  const setMiniOrders = (val: MiniOrder[] | ((prev: MiniOrder[]) => MiniOrder[])) => {
    setOrders(prev => {
      const newOrders = [...prev];
      const current = newOrders[currentOrderIndex];
      newOrders[currentOrderIndex] = {
        ...current,
        miniOrders: typeof val === 'function' ? val(current.miniOrders) : val,
        allMaterials: getAllMaterialsFromMiniOrders(
          typeof val === 'function' ? val(current.miniOrders) : val,
        ),
      };
      return newOrders;
    });
  };

  const updateOrder = (key: keyof OrderData, val: any) => {
    setOrders(prev => {
      const newOrders = [...prev];
      newOrders[currentOrderIndex] = {
        ...newOrders[currentOrderIndex],
        [key]: val,
      };
      return newOrders;
    });
  };

  // Temp states (for adding)
  const [pickedPackage, setPackage] = useState<number[]>([]); // Unused?
  const [employee, setEmployee] = useState<any>(0);
  const [services, setServices] = useState<number[]>([]);
  const [materials, setMaterials] = useState<any[]>([]); // Unused?
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null); // Unused now
  const [vinModalData, setVinModalData] = useState<any>({});

  useEffect(() => {
    if (vinModalData) {
      setSharedName(vinModalData.first_name || '');
      setSharedPhone(vinModalData.phone || '');
      setCar(vinModalData.car_brand_id || '');
      setModelCar(vinModalData.car_model_id || '');
      setCarNumber(vinModalData.car_license_plate || '');
    }
  }, [vinModalData]);

  const [formErrors, setFormErrors] = useState({
    name: false,
    phone: false,
    carBody: false,
    packages: false,
    services: false,
    employee: false,
    carNumber: false,
  });

  // Navigation for orders
  const handlePrevOrder = () => {
    if (currentOrderIndex > 0) {
      setCurrentOrderIndex(currentOrderIndex - 1);
    }
  };

  const handleNextOrder = () => {
    if (currentOrderIndex === orders.length - 1) {
      setOrders([
        ...orders,
        {
          car: '',
          modelCar: '',
          carNumber: '',
          vin: '',
          pickedCarBody: '',
          prepayment: '',
          description: '',
          miniOrders: [],
          allMaterials: [],
        },
      ]);
    }
    setCurrentOrderIndex(currentOrderIndex + 1);
  };

  // Обработчики изменений
  const handlePhoneChange = (value: string) => {
    if (!value.trim()) {
      setSharedPhone('');
      return;
    }
    let cleaned = value.replace(/[^\d]/g, '');
    if (!cleaned.startsWith('996') && cleaned.length > 0) {
      cleaned = '996' + cleaned;
    }
    if (cleaned.length > 12) {
      cleaned = cleaned.substring(0, 12);
    }
    setSharedPhone(cleaned);
  };

  const handlePrepaymentChange = (value: string) => {
    const regex = /^[0-9]*\.?[0-9]*$/;
    if (regex.test(value) || value === '') {
      setPrepayment(value);
    }
  };

  // Валидация для одного заказа
  const validateOrder = (order: OrderData, sharedName: string, sharedPhone: string) => {
    const errors = {
      name: !sharedName.trim(), // Проверяем, что поле имени не пустое
      phone: !/^996\d{9}$/.test(sharedPhone),
      services: order.miniOrders.length === 0,
      carNumber: order.carNumber.length > 0 && !/^[A-Za-z0-9]+$/.test(order.carNumber),
    };

    console.log('Результаты проверок для заказа:', {
      name: { value: sharedName, isValid: !errors.name },
      phone: { value: sharedPhone, isValid: !errors.phone },
      services: { count: order.miniOrders.length, isValid: !errors.services },
      carNumber: { value: order.carNumber, isValid: !errors.carNumber },
    });

    // Устанавливаем ошибки для текущего (только для отображения)
    if (orders.indexOf(order) === currentOrderIndex) {
      setFormErrors(errors as any);
    }

    return !Object.values(errors).some(error => error);
  };

  // Функция для сброса формы
  const resetForm = () => {
    setSharedName('');
    setSharedPhone('');
    setOrders([
      {
        car: '',
        modelCar: '',
        carNumber: '',
        vin: '',
        pickedCarBody: '',
        prepayment: '',
        description: '',
        miniOrders: [],
        allMaterials: [],
      },
    ]);
    setCurrentOrderIndex(0);
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

  // Обновленная функция для обработки выбора услуг
  const handleServicesSelected = (selectedServices: number[]) => {
    if (selectedServices.length === 0) {
      setFormErrors(prev => ({
        ...prev,
        services: true,
      }));
      return;
    }

    const newMiniOrder: MiniOrder = {
      employee: employee || 0,
      services: selectedServices,
      commission_rate: '10.00',
      materials: [],
    };

    setMiniOrders(prev => [...prev, newMiniOrder]);

    setServices(selectedServices);

    setFormErrors(prev => ({
      ...prev,
      services: false,
    }));

    toast.success('Услуги добавлены');
  };

  // Функция для удаления mini_order
  const removeMiniOrder = (index: number) => {
    setMiniOrders(prev => prev.filter((_, i) => i !== index));

    if (currentOrder.miniOrders.length <= 1) {
      setFormErrors(prev => ({
        ...prev,
        services: true,
      }));
      setServices([]);
    }
  };

  const updateMiniOrderEmployee = (
    miniOrderIndex: number,
    employeeId: number,
    employeeName: string,
  ) => {
    setMiniOrders(prev => {
      const updated = [...prev];
      if (updated[miniOrderIndex]) {
        updated[miniOrderIndex] = {
          ...updated[miniOrderIndex],
          employee: employeeId,
          employeeName: employeeName,
        };
      }
      return updated;
    });
  };

  const handleRedirect = () => {
    router.push('/applications');
  };

  // Рефакторинг generateReceipt для принятия параметров
  const generateReceipt = async (
    orderData: OrderData,
    orderId: number,
    clientName: string,
    clientPhone: string,
  ): Promise<ReceiptData> => {
    console.log('Начало генерации чека для заказа с ID:', orderId);

    const newReceiptData: ReceiptData = {
      orderId: orderId,
      orderNumber: `#${orderId}`,
      clientName: clientName,
      clientPhone: clientPhone,
      carInfo: `${orderData.car} ${orderData.modelCar} ${orderData.carNumber ? `(${orderData.carNumber})` : ''}`,
      carVin: orderData.vin || undefined,
      services: [],
      materials: [],
      totalAmount: 0,
      prepayment: orderData.prepayment || '0.00',
      createdDate: new Date().toLocaleString('ru-RU'),
    };

    let totalAmount = 0;

    console.log('Получаем данные для услуг и материалов...');
    console.log('Список miniOrders:', orderData.miniOrders);

    const fetchPromises = [];

    for (const miniOrder of orderData.miniOrders) {
      if (miniOrder.services && miniOrder.services.length > 0) {
        for (const serviceId of miniOrder.services) {
          const servicePromise = (async () => {
            try {
              const serviceResponse = await $api.get(`/services/${serviceId}/`);
              const serviceData = serviceResponse.data;
              console.log(`Получены данные услуги #${serviceId}:`, serviceData);

              if (serviceData && serviceData.name && serviceData.price) {
                const servicePrice = parseFloat(serviceData.price);
                totalAmount += servicePrice;

                newReceiptData.services.push({
                  name: serviceData.name,
                  price: serviceData.price,
                  employeeName: miniOrder.employeeName || 'Не указан',
                });

                console.log(`Добавлена услуга: ${serviceData.name}, цена: ${serviceData.price}`);
              } else {
                console.warn(`Получены некорректные данные для услуги ${serviceId}:`, serviceData);
                newReceiptData.services.push({
                  name: serviceData?.name || 'Услуга',
                  price: serviceData?.price || '0.00',
                  employeeName: miniOrder.employeeName || 'Не указан',
                });
              }
            } catch (error) {
              console.error(`Ошибка при получении данных услуги ${serviceId}:`, error);
              newReceiptData.services.push({
                name: 'Услуга',
                price: '0.00',
                employeeName: miniOrder.employeeName || 'Не указан',
              });
            }
          })();

          fetchPromises.push(servicePromise);
        }
      }

      if (miniOrder.materials && miniOrder.materials.length > 0) {
        for (const material of miniOrder.materials) {
          const materialPromise = (async () => {
            try {
              const materialResponse = await $api.get(`material/detail/${material.material}/`);
              const materialData = materialResponse.data;
              console.log(`Получены данные материала #${material.material}:`, materialData);

              if (materialData && materialData.name) {
                const quantity = parseFloat(material.quantity) || 1;
                const unitPrice = parseFloat(materialData.sell_price || '0');
                const totalPrice = unitPrice * quantity;

                totalAmount += totalPrice;

                newReceiptData.materials.push({
                  name: materialData.name,
                  quantity: material.quantity,
                  price: unitPrice.toFixed(2),
                  totalPrice: totalPrice,
                });

                console.log(
                  `Добавлен материал: ${materialData.name}, количество: ${quantity}, цена: ${unitPrice}, общая стоимость: ${totalPrice}`,
                );
              } else {
                console.warn(
                  `Получены некорректные данные для материала ${material.material}:`,
                  materialData,
                );
                newReceiptData.materials.push({
                  name: materialData?.name || 'Материал',
                  quantity: material.quantity || '1',
                  price: '0.00',
                  totalPrice: 0,
                });
              }
            } catch (error) {
              console.error(`Ошибка при получении данных материала ${material.material}:`, error);
              newReceiptData.materials.push({
                name: 'Материал',
                quantity: material.quantity || '1',
                price: '0.00',
                totalPrice: 0,
              });
            }
          })();

          fetchPromises.push(materialPromise);
        }
      }
    }

    await Promise.all(fetchPromises);

    newReceiptData.totalAmount = totalAmount.toFixed(2);

    console.log('Итоговые данные чека:', JSON.stringify(newReceiptData, null, 2));

    return newReceiptData;
  };

  // Функция для скачивания чека в формате HTML (как PDF-like)
  const downloadReceipt = () => {
    if (!receiptData) return;

    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Заявка ID:${receiptData.orderNumber}</title>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .receipt { max-width: 800px; margin: 0 auto; border: 1px solid #ccc; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .info { margin-bottom: 20px; }
            .info-row { display: flex; margin-bottom: 5px; }
            .info-label { font-weight: bold; width: 150px; }
            .info-value { flex: 1; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { text-align: right; font-weight: bold; margin-top: 20px; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h1>ЧЕК №${receiptData.orderNumber}</h1>
              <p>Дата: ${receiptData.createdDate}</p>
            </div>

            <div class="info">
              <div class="info-row">
                <div class="info-label">Клиент:</div>
                <div class="info-value">${receiptData.clientName}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Телефон:</div>
                <div class="info-value">${receiptData.clientPhone}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Автомобиль:</div>
                <div class="info-value sluitData.carInfo}</div>
              </div>
              ${
                receiptData.carVin
                  ? `
              <div class="info-row">
                <div class="info-label">VIN:</div>
                <div class="info-value">${receiptData.carVin}</div>
              </div>
              `
                  : ''
              }
            </div>

            <h2>Услуги</h2>
            <table>
              <thead>
                <tr>
                  <th>№</th>
                  <th>Наименование услуги</th>
                  <th>Сотрудник</th>
                  <th>Цена</th>
                </tr>
              </thead>
              <tbody>
                ${receiptData.services
                  .map(
                    (service, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${service.name}</td>
                  <td>${service.employeeName}</td>
                  <td>${service.price} сом</td>
                </tr>
                `,
                  )
                  .join('')}
              </tbody>
            </table>

            ${
              receiptData.materials.length > 0
                ? `
            <h2>Материалы</h2>
            <table>
              <thead>
                <tr>
                  <th>№</th>
                  <th>Наименование материала</th>
                  <th>Количество</th>
                  <th>Цена за ед.</th>
                  <th>Сумма</th>
                </tr>
              </thead>
              <tbody>
                ${receiptData.materials
                  .map(
                    (material, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${material.name}</td>
                  <td>${material.quantity}</td>
                  <td>${material.price} сом</td>
                  <td>${material.totalPrice.toFixed(2)} сом</td>
                </tr>
                `,
                  )
                  .join('')}
              </tbody>
            </table>
            `
                : ''
            }

            <div class="total">
              <p>Предоплата: ${receiptData.prepayment} сом</p>
              <p>Итого к оплате: ${receiptData.totalAmount} сом</p>
            </div>

            <div class="footer">
              <p>Спасибо за обращение в наш сервис!</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `Чек_${receiptData.orderNumber}.html`;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      toast.success('Чек успешно скачан');
    } catch (error) {
      console.error('Ошибка при скачивании чека:', error);
      toast.error('Не удалось скачать чек');
    }
  };

  // Функция для печати чека
  const printReceipt = () => {
    if (!receiptData) return;

    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error(
          'Не удалось открыть окно печати. Проверьте настройки блокировки всплывающих окон.',
        );
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Чек №${receiptData.orderNumber}</title>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .receipt { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .info { margin-bottom: 20px; }
            .info-row { display: flex; margin-bottom: 5px; }
            .info-label { font-weight: bold; width: 150px; }
            .info-value { flex: 1; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { text-align: right; font-weight: bold; margin-top: 20px; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
            @media print {
              body { margin: 0; padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h1>ЧЕК №${receiptData.orderNumber}</h1>
              <p>Дата: ${receiptData.createdDate}</p>
            </div>

            <div class="info">
              <div class="info-row">
                <div class="info-label">Клиент:</div>
                <div class="info-value">${receiptData.clientName}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Телефон:</div>
                <div class="info-value">${receiptData.clientPhone}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Автомобиль:</div>
                <div class="info-value">${receiptData.carInfo}</div>
              </div>
              ${
                receiptData.carVin
                  ? `
              <div class="info-row">
                <div class="info-label">VIN:</div>
                <div class="info-value">${receiptData.carVin}</div>
              </div>
              `
                  : ''
              }
            </div>

            <h2>Услуги</h2>
            <table>
              <thead>
                <tr>
                  <th>№</th>
                  <th>Наименование услуги</th>
                  <th>Сотрудник</th>
                  <th>Цена</th>
                </tr>
              </thead>
              <tbody>
                ${receiptData.services
                  .map(
                    (service, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${service.name}</td>
                  <td>${service.employeeName}</td>
                  <td>${service.price} сом</td>
                </tr>
                `,
                  )
                  .join('')}
              </tbody>
            </table>

            ${
              receiptData.materials.length > 0
                ? `
            <h2>Материалы</h2>
            <table>
              <thead>
                <tr>
                  <th>№</th>
                  <th>Наименование материала</th>
                  <th>Количество</th>
                  <th>Цена за ед.</th>
                  <th>Сумма</th>
                </tr>
              </thead>
              <tbody>
                ${receiptData.materials
                  .map(
                    (material, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${material.name}</td>
                  <td>${material.quantity}</td>
                  <td>${material.price} сом</td>
                  <td>${material.totalPrice.toFixed(2)} сом</td>
                </tr>
                `,
                  )
                  .join('')}
              </tbody>
            </table>
            `
                : ''
            }

            <div class="total">
              <p>Предоплата: ${receiptData.prepayment} сом</p>
              <p>Итого к оплате: ${receiptData.totalAmount} сом</p>
            </div>

            <div class="footer">
              <p>Спасибо за обращение в наш сервис!</p>
            </div>

            <div class="no-print" style="text-align: center; margin-top: 30px;">
              <button onclick="window.print();" style="padding: 10px 20px; background: #0A63F0; color: white; border: none; border-radius: 5px; cursor: pointer;">
                Печать
              </button>
              <button onclick="window.close();" style="padding: 10px 20px; margin-left: 10px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer;">
                Закрыть
              </button>
            </div>
          </div>
        </body>
        </html>
      `);

      printWindow.document.close();

      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 500);
    } catch (error) {
      console.error('Ошибка при печати чека:', error);
      toast.error('Не удалось распечатать чек');
    }
  };

  const onCreateApplication = async () => {
    console.log('Начинаем создание заявок');

    let hasErrors = false;
    for (const order of orders) {
      if (!validateOrder(order, sharedName, sharedPhone)) {
        hasErrors = true;
      }
    }

    if (hasErrors) {
      return toast.error('Пожалуйста, заполните все обязательные поля корректно во всех заказах');
    }

    setIsGeneratingReceipt(true);

    try {
      const createdIds: number[] = [];
      for (const order of orders) {
        const nameParts = sharedName.trim().split(' ');

        const data = {
          client_first_name: nameParts[0] || '',
          client_last_name: nameParts.slice(1).join(' ') || '',
          client_phone: sharedPhone,
          car_brand: order.car,
          car_model: order.modelCar,
          car_vin: order.vin,
          car_license_plate: order.carNumber,
          car_body_type: order.pickedCarBody || '2',
          prepayment: order.prepayment || '0.00',
          mini_orders: order.miniOrders,
        };

        console.log('Данные для отправки:', data);

        console.log('Отправляем запрос на /master/orders/');
        const response = await $api.post('/master/orders/', data);
        console.log('Получен ответ:', response);

        createdIds.push(response.data.id);
      }

      await queryClient.invalidateQueries({ queryKey: ['detailingList'] });
      toast.success('Заявки успешно созданы!');

      // Генерируем чеки
      const generatedReceipts: ReceiptData[] = [];
      for (let i = 0; i < orders.length; i++) {
        const receipt = await generateReceipt(orders[i], createdIds[i], sharedName, sharedPhone);
        generatedReceipts.push(receipt);
      }

      setReceipts(generatedReceipts);
      setCurrentReceiptIndex(0);
      setReceiptModalOpen(true);
    } catch (e: any) {
      toast.error('Номер машины уже зарегистрирован в базе под другим номером клиента');
    } finally {
      setIsGeneratingReceipt(false);
    }
  };

  // Добавление материала к mini_order
  const addMaterialToMiniOrder = (miniOrderIndex: number, material: Material) => {
    setMiniOrders(prev => {
      const updated = [...prev];
      if (updated[miniOrderIndex]) {
        const existingMaterialIndex = updated[miniOrderIndex].materials.findIndex(
          m => m.material === material.material,
        );

        if (existingMaterialIndex >= 0) {
          updated[miniOrderIndex].materials[existingMaterialIndex].quantity = material.quantity;
        } else {
          updated[miniOrderIndex].materials.push({ ...material });
        }
      }
      return updated;
    });

    toast.success('Материал добавлен');
  };

  // Удаление материала из mini_order
  const removeMaterialFromMiniOrder = (miniOrderIndex: number, materialId: string) => {
    setMiniOrders(prev => {
      const updated = [...prev];
      if (updated[miniOrderIndex]) {
        updated[miniOrderIndex].materials = updated[miniOrderIndex].materials.filter(
          m => m.material !== materialId,
        );
      }
      return updated;
    });

    toast.success('Материал удален');
  };

  // Вспомогательная функция
  const getAllMaterialsFromMiniOrders = (orders: MiniOrder[]): Material[] => {
    const allMaterials: Material[] = [];
    orders.forEach(order => {
      order.materials.forEach(material => {
        allMaterials.push(material);
      });
    });
    return allMaterials;
  };

  const forceSelectValue = (selectLabel: any, valueToSelect: any) => {
    try {
      const selectTriggers: any = document.querySelectorAll('[data-state]');

      for (const trigger of selectTriggers) {
        const parentDiv = trigger.closest('div');
        if (!parentDiv) continue;

        const label = parentDiv.querySelector('h1, label');
        if (!label) continue;

        const labelText = label.textContent;

        if (labelText && labelText.includes(selectLabel)) {
          trigger.click();

          setTimeout(() => {
            try {
              const selectItems: any = document.querySelectorAll('[role="option"]');
              let itemFound = false;

              for (const item of selectItems) {
                const dataValue =
                  item.getAttribute('data-value') || item.getAttribute('value') || item.textContent;

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

              if (!itemFound) {
                console.log(`Не найдено значение ${valueToSelect} для селектора ${selectLabel}`);
                document.body.click();
              }
            } catch (err: any) {
              console.error(`Ошибка при выборе значения: ${err.message}`);
              document.body.click();
            }
          }, 300);

          return true;
        }
      }

      return false;
    } catch (error: any) {
      console.error(`Ошибка в forceSelectValue: ${error.message}`);
      return false;
    }
  };

  const handleSelectCarSuggestion = (suggestion: any) => {
    setSharedName(`${suggestion.first_name} ${suggestion.last_name || ''}`);
    setSharedPhone(suggestion.phone);

    setCarNumber(suggestion.car_license_plate);
    setVin(suggestion.car_vin || '');

    const brandId = parseInt(suggestion.car_brand_id, 10);
    const modelId = parseInt(suggestion.car_model_id, 10);
    const bodyTypeId = parseInt(suggestion.car_body_type_id, 10);

    setCar(brandId.toString());

    setTimeout(() => {
      forceSelectValue('Марка авто', brandId);

      setTimeout(() => {
        setModelCar(modelId.toString());
        forceSelectValue('Модель авто', modelId);

        setTimeout(() => {
          setPickedCarBody(bodyTypeId.toString());
          forceSelectValue('Тип кузова', bodyTypeId);
        }, 800);
      }, 800);
    }, 300);

    setFormErrors(prevErrors => ({
      ...prevErrors,
      name: false,
      phone: false,
      carNumber: false,
      carBody: false,
    }));
  };

  console.log(currentOrder.car);

  // Navigation for receipts
  const handlePrevReceipt = () => {
    if (currentReceiptIndex > 0) {
      setCurrentReceiptIndex(currentReceiptIndex - 1);
    }
  };

  const handleNextReceipt = () => {
    if (currentReceiptIndex < receipts.length - 1) {
      setCurrentReceiptIndex(currentReceiptIndex + 1);
    }
  };

  // Update receiptData when index changes
  useEffect(() => {
    if (receipts.length > 0) {
      setReceiptData(receipts[currentReceiptIndex]);
    }
  }, [currentReceiptIndex, receipts]);

  // Компонент для вкладки "Материалы"
  const MaterialsTabContent = () => (
    <MaterialsTab
      miniOrders={currentOrder.miniOrders}
      onAddMaterial={addMaterialToMiniOrder}
      onRemoveMaterial={removeMaterialFromMiniOrder}
      materials={currentOrder.allMaterials}
    />
  );

  return (
    <div className='min-h-screen w-full p-6 text-white'>
      {/* Header with title and action buttons */}
      <div className='mb-6 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <h1 className='text-xl font-medium'>
            Новая заявка {currentOrderIndex + 1}/{orders.length}
          </h1>
          <span className='text-xl text-[#0A63F0]'>Детейлинг</span>
        </div>
        <div className='flex items-center gap-3'>
          <Button className='p-2' onClick={handlePrevOrder} disabled={currentOrderIndex === 0}>
            <ChevronLeft />
          </Button>
          <Button className='p-2' onClick={handleNextOrder}>
            <ChevronRight />
          </Button>
          <Button
            className='flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-white'
            onClick={() => onCreateApplication()}
          >
            <Check />
            <span>Сохранить и распечатать</span>
          </Button>
          <Button
            className='rounded-xl bg-blue-600 px-3 py-2 text-white'
            onClick={() => resetForm()}
          >
            <span>Сбросить</span>
          </Button>
          <Button
            className='flex items-center gap-2 rounded-xl border border-gray-700 px-3 py-2'
            onClick={() => handleRedirect()}
          >
            <X />
            <span>Отменить</span>
          </Button>
        </div>
      </div>

      {/* Main content with tabs */}
      <UiFolder folderArr={folderTabs}>
        {currentTab === 'materials' ? (
          <MaterialsTabContent />
        ) : (
          <div>
            <div className='grid grid-cols-2 gap-6'>
              {/* Left column - Car details */}
              <div className='flex flex-col'>
                <h2 className='mb-4 text-lg font-medium text-gray-300'>Данные автомобиля</h2>
                <div className='grid gap-4'>
                  <div className='relative'>
                    <FormInput
                      title={'Номер авто'}
                      placeholder={'01xxx01'}
                      value={currentOrder.carNumber}
                      onChange={setCarNumber}
                      validation={{
                        pattern: /^[A-Za-z0-9]+$/,
                        errorMessage: 'Только латинские буквы и цифры',
                      }}
                      isAutocomplete={true}
                      onSelectSuggestion={handleSelectCarSuggestion}
                    />
                    {formErrors.carNumber && (
                      <p className='mt-1 text-xs text-red-500'>Только латинские буквы и цифры</p>
                    )}
                  </div>
                  <div className='grid grid-cols-10 items-center gap-2'>
                    <div className='col-span-8'>
                      <FormInput
                        title='VIN код авто'
                        placeholder='Введите код или отсканируйте'
                        value={currentOrder.vin}
                        onChange={setVin}
                      />
                    </div>
                    <div className='col-span-2'>
                      <Button className='w-full rounded' onClick={() => setIsScannerOpen(true)}>
                        Сканировать
                      </Button>
                    </div>

                    {isScannerOpen && (
                      <BarcodeScannerModal
                        onClose={() => setIsScannerOpen(false)}
                        onScanned={(scannedVin: string) => {
                          console.log('VIN отсканирован:', scannedVin);
                          setIsScannerOpen(false);
                        }}
                        setVin={(res: any) => setVin(res)}
                        initialVin={currentOrder.vin}
                        setVinModalData={setVinModalData}
                        setCar={setCar}
                        setModelCar={setModelCar}
                      />
                    )}
                  </div>

                  <CarInput
                    title={'Марка авто'}
                    placeholder={'Выберите марку'}
                    value={currentOrder.car}
                    onChange={setCar}
                  />
                  <CarModelInput
                    title={'Модель авто'}
                    placeholder={'Выберите модель'}
                    value={currentOrder.modelCar}
                    onChange={setModelCar}
                    modelId={currentOrder.car}
                  />
                  <CarBodyInput
                    title={'Тип кузова'}
                    placeholder={'Выберите тип'}
                    value={currentOrder.pickedCarBody}
                    onChange={setPickedCarBody}
                  />
                </div>

                {/* Services section */}
                <div className='mt-6'>
                  <div className='relative mb-5'>
                    {formErrors.services && currentOrder.miniOrders.length === 0 && (
                      <p className='mb-2 text-xs text-red-500'>Выберите хотя бы одну услугу</p>
                    )}
                    <MiniOrdersList
                      miniOrders={currentOrder.miniOrders}
                      onRemove={removeMiniOrder}
                      onEmployeeChange={updateMiniOrderEmployee}
                    />
                  </div>
                </div>
              </div>

              {/* Right column - Client details */}
              <div className='flex flex-col'>
                <h2 className='mb-4 text-lg font-medium text-gray-300'>Данные клиента</h2>
                <div className='grid gap-4'>
                  <div className='relative'>
                    <FormInput
                      title={'ФИО'}
                      placeholder={'Имя'}
                      value={sharedName}
                      onChange={setSharedName}
                      validation={{
                        required: true,
                        errorMessage: 'Введите имя',
                      }}
                    />
                    {formErrors.name && <p className='mt-1 text-xs text-red-500'>Введите имя</p>}
                  </div>
                  <div className='relative'>
                    <FormInput
                      title={'Телефон'}
                      placeholder={'996xxxxxxxxx'}
                      value={sharedPhone}
                      onChange={handlePhoneChange}
                      validation={{
                        required: true,
                        pattern: /^996\d{9}$/,
                        errorMessage: 'Формат: 996xxxxxxxxx (9 цифр)',
                      }}
                      type='tel'
                    />
                    {formErrors.phone && (
                      <p className='mt-1 text-xs text-red-500'>
                        Номер телефона должен быть в формате: 996xxxxxxxxx
                      </p>
                    )}
                  </div>
                  <FormInput
                    title={'Предоплата'}
                    placeholder={'Введите сумму'}
                    value={currentOrder.prepayment}
                    onChange={handlePrepaymentChange}
                    type='text'
                  />
                  <FormInput
                    title={'Примечание'}
                    placeholder={'Опциональное поле'}
                    value={currentOrder.description}
                    onChange={setDescription}
                    isTextArea={true}
                  />
                </div>
              </div>
            </div>
            {/* Save button at the bottom */}
            <div className='mt-auto flex w-full justify-center pt-10'>
              <ServiceDrawer
                onSubmit={handleServicesSelected}
                buttonText={
                  currentOrder.miniOrders.length > 0 ? 'Добавить еще услугу' : 'Выбрать услугу'
                }
              />
            </div>
          </div>
        )}
      </UiFolder>

      {/* Модальное окно для отображения чека */}
      <Dialog open={receiptModalOpen} onOpenChange={onCloseModal}>
        <DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto border-gray-700 bg-[#171928] text-white'>
          <DialogHeader>
            <DialogTitle className='text-center text-xl font-bold'>
              ЧЕК №{receiptData?.orderNumber}
            </DialogTitle>
            <DialogDescription className='text-center text-gray-300'>
              {receiptData?.createdDate}
            </DialogDescription>
          </DialogHeader>

          {isGeneratingReceipt ? (
            <div className='text-center'>Генерация чека...</div>
          ) : (
            receiptData && (
              <div className='mt-4'>
                <div className='mb-4 rounded-lg bg-[#1A1A24] p-4'>
                  <h3 className='mb-2 font-medium'>Информация о клиенте</h3>
                  <div className='grid grid-cols-2 gap-2'>
                    <div className='text-gray-400'>Клиент:</div>
                    <div>{receiptData.clientName}</div>
                    <div className='text-gray-400'>Телефон:</div>
                    <div>{receiptData.clientPhone}</div>
                    <div className='text-gray-400'>Автомобиль:</div>
                    <div>{receiptData.carInfo}</div>
                    {receiptData.carVin && (
                      <>
                        <div className='text-gray-400'>VIN:</div>
                        <div>{receiptData.carVin}</div>
                      </>
                    )}
                  </div>
                </div>

                <h3 className='mb-2 font-medium'>Услуги</h3>
                <div className='overflow-x-auto'>
                  <table className='mb-4 w-full'>
                    <thead>
                      <tr className='bg-[#0A63F0] text-white'>
                        <th className='w-12 px-4 py-2 text-left'>#</th>
                        <th className='px-4 py-2 text-left'>Наименование услуги</th>
                        <th className='px-4 py-2 text-left'>Сотрудник</th>
                        <th className='px-4 py-2 text-right'>Цена</th>
                      </tr>
                    </thead>
                    <tbody>
                      {receiptData.services.map((service, index) => (
                        <tr key={index} className='border-b border-gray-700'>
                          <td className='px-4 py-2'>{index + 1}</td>
                          <td className='px-4 py-2'>{service.name}</td>
                          <td className='px-4 py-2'>{service.employeeName}</td>
                          <td className='px-4 py-2 text-right'>{service.price} сом</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {receiptData.materials.length > 0 && (
                  <>
                    <h3 className='mb-2 font-medium'>Материалы</h3>
                    <div className='overflow-x-auto'>
                      <table className='mb-4 w-full'>
                        <thead>
                          <tr className='bg-[#0A63F0] text-white'>
                            <th className='w-12 px-4 py-2 text-left'>#</th>
                            <th className='px-4 py-2 text-left'>Наименование материала</th>
                            <th className='px-4 py-2 text-center'>Количество</th>
                            <th className='px-4 py-2 text-right'>Цена за ед.</th>
                            <th className='px-4 py-2 text-right'>Сумма</th>
                          </tr>
                        </thead>
                        <tbody>
                          {receiptData.materials.map((material, index) => (
                            <tr key={index} className='border-b border-gray-700'>
                              <td className='px-4 py-2'>{index + 1}</td>
                              <td className='px-4 py-2'>{material.name}</td>
                              <td className='px-4 py-2 text-center'>{material.quantity}</td>
                              <td className='px-4 py-2 text-right'>{material.price} сом</td>
                              <td className='px-4 py-2 text-right'>
                                {material.totalPrice.toFixed(2)} сом
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                <div className='rounded-lg bg-[#1A1A24] p-4'>
                  <div className='mb-2 flex items-center justify-between'>
                    <span className='text-gray-400'>Предоплата:</span>
                    <span>{receiptData.prepayment} сом</span>
                  </div>
                  <div className='flex items-center justify-between text-lg font-bold'>
                    <span>Итого к оплате:</span>
                    <span>{receiptData.totalAmount} сом</span>
                  </div>
                </div>
              </div>
            )
          )}

          <DialogFooter className='sticky bottom-0 mt-6 flex flex-col gap-2 border-t border-gray-700 bg-[#171928] py-3 sm:flex-row'>
            {receipts.length > 1 && (
              <div className='flex items-center gap-2'>
                <Button
                  className='p-2'
                  onClick={handlePrevReceipt}
                  disabled={currentReceiptIndex === 0}
                >
                  <ChevronLeft />
                </Button>
                <span>
                  {currentReceiptIndex + 1} / {receipts.length}
                </span>
                <Button
                  className='p-2'
                  onClick={handleNextReceipt}
                  disabled={currentReceiptIndex === receipts.length - 1}
                >
                  <ChevronRight />
                </Button>
              </div>
            )}
            <Button
              className='flex w-full items-center justify-center gap-2 sm:w-auto'
              onClick={downloadReceipt}
            >
              <Download size={18} />
              Скачать чек
            </Button>
            <Button
              className='flex w-full items-center justify-center gap-2 sm:w-auto'
              onClick={printReceipt}
            >
              <Printer size={18} />
              Распечатать
            </Button>
            <Button
              className='flex w-full items-center justify-center gap-2 bg-gray-600 sm:w-auto'
              onClick={() => {
                setReceiptModalOpen(false);
                handleRedirect();
              }}
            >
              <X size={18} />
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Scanner Modal */}
      <Toaster />
    </div>
  );
};

export default DetailingScreen;
