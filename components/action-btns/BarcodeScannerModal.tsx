'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import $api from '../../api/http';

interface BarcodeScannerModalProps {
  onClose: () => void;
  onScanned?: (vin: string) => void;
  setVin?: React.Dispatch<React.SetStateAction<string>>;
  initialVin?: string;
  setVinModalData: (_: any) => any;
  setCar: (_: any) => any;
  setModelCar: (_: any) => any;
}

const fetchCarByVin = async (code: string) => {
  const res = await $api.get(`/accounts/clients/by-car/vin/${code}`);
  return res.data;
};

const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  onClose,
  onScanned,
  setVin,
  initialVin = '',
  setVinModalData,
  setCar,
  setModelCar,
}) => {
  const [prompt, setPrompt] = useState<string>(
    'Извлеки VIN-код из изображения и верни только сам VIN-код без дополнительного текста. Формат: 17 символов, состоящих из цифр и букв латинского алфавита (кроме I, O, Q).',
  );
  const [vinCode, setVinCode] = useState<string>(initialVin);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [image, setImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraInitialized, setCameraInitialized] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [data, setData] = useState({});

  // API ключи
  const GEMINI_API_KEY = 'AIzaSyC14c0a5D4SgOKzN_2FApbs5ukpqVlcFek';
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  // Функция для обработки загрузки изображения через выбор файла
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setImage(result.split(',')[1]); // Extract base64 data

        // Автоматически анализируем загруженное изображение
        setTimeout(() => {
          analyzeImage(result.split(',')[1]);
        }, 500);
      };
      reader.readAsDataURL(file);
    }
  };

  // Функция для активации камеры
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      setError('');

      // Используем более широкий набор настроек для максимальной совместимости с разными устройствами
      const constraints = {
        video: {
          facingMode: 'environment', // Использовать заднюю камеру
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      console.log('Запрашиваем доступ к камере...');
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Доступ к камере получен, настраиваем видеопоток');

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Добавляем обработчик события для подтверждения, что видео действительно начало воспроизводиться
        videoRef.current.onloadedmetadata = () => {
          console.log(
            'Метаданные видео загружены, размеры:',
            videoRef.current?.videoWidth,
            'x',
            videoRef.current?.videoHeight,
          );
          if (videoRef.current) {
            videoRef.current
              .play()
              .then(() => {
                console.log('Видео успешно запущено');
                setCameraInitialized(true);
              })
              .catch(err => {
                console.error('Ошибка воспроизведения видео:', err);
                setError(`Ошибка запуска камеры: ${err.message}`);
              });
          }
        };
      } else {
        console.error('Ссылка на видеоэлемент отсутствует');
        setError('Не удалось инициализировать видео элемент');
      }
    } catch (err: any) {
      console.error('Ошибка доступа к камере:', err);
      setError(`Ошибка доступа к камере: ${err.message}`);
      setIsCameraActive(false);
    }
  };

  // Функция для остановки камеры
  const stopCamera = () => {
    if (streamRef.current) {
      console.log('Останавливаем поток камеры');
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraActive(false);
    setCameraInitialized(false);
  };

  // Функция для захвата фото с камеры
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error('Ссылки на видео или canvas элементы отсутствуют');
      return;
    }

    setProcessing(true);
    console.log('Начинаем захват фото с камеры');

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) {
      console.error('Не удалось получить контекст canvas');
      setProcessing(false);
      return;
    }

    try {
      // Установка размеров canvas в соответствии с размерами видео
      console.log('Размеры видео:', video.videoWidth, 'x', video.videoHeight);
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Отрисовка кадра из видео на canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Получение base64 изображения
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      console.log('Изображение захвачено, размер base64:', imageDataUrl.length);
      setImagePreview(imageDataUrl);
      const imageBase64 = imageDataUrl.split(',')[1]; // Extract base64 data
      setImage(imageBase64);

      // Остановка камеры после захвата фото
      stopCamera();

      // Автоматически анализируем захваченное изображение
      setTimeout(() => {
        analyzeImage(imageBase64);
      }, 500);
    } catch (err: any) {
      console.error('Ошибка при захвате фото:', err);
      setError(`Ошибка при захвате фото: ${err.message}`);
      setProcessing(false);
    }
  };

  // Функция для отправки запроса в Gemini API
  const analyzeImage = async (imageData: string | null = null) => {
    const imageToAnalyze = imageData || image;

    if (!imageToAnalyze) {
      setError('Необходимо сделать фото или загрузить изображение');
      setProcessing(false);
      return;
    }

    setLoading(true);
    setError('');
    console.log('Начинаем анализ изображения');

    try {
      const requestBody = {
        contents: [
          {
            parts: [
              { text: prompt },
              { inlineData: { mimeType: 'image/jpeg', data: imageToAnalyze } },
            ],
          },
        ],
      };

      console.log('Отправляем запрос в Gemini API...');
      const res = await axios.post(GEMINI_API_URL, requestBody);
      console.log('Получен ответ от Gemini API');

      // Убираем лишние пробелы и переносы строк
      let cleanedText = '';

      // Получаем текст из ответа, проверяя разные возможные структуры
      if (res.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        cleanedText = res.data.candidates[0].content.parts[0].text.trim();
      } else if (res.data?.candidates?.[0]?.content?.text) {
        cleanedText = res.data.candidates[0].content.text.trim();
      } else if (typeof res.data === 'string') {
        cleanedText = res.data.trim();
      } else {
        console.log('Формат ответа от Gemini API:', res.data);
        cleanedText = JSON.stringify(res.data);
      }

      console.log('Полученный текст:', cleanedText);

      // Проверка на соответствие формату VIN-кода (17 символов, буквы и цифры)
      const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
      let detectedVin = null;

      if (vinRegex.test(cleanedText)) {
        detectedVin = cleanedText.toUpperCase();
      } else {
        // Если в ответе есть что-то похожее на VIN-код, пытаемся его извлечь
        const vinMatch = cleanedText.match(/[A-HJ-NPR-Z0-9]{17}/i);
        if (vinMatch) {
          detectedVin = vinMatch[0].toUpperCase();
        } else {
          console.log('Получен ответ без VIN-кода:', cleanedText);
          setError('VIN-код не распознан. Попробуйте сделать более четкое фото.');
          setLoading(false);
          setProcessing(false);
          return;
        }
      }

      console.log('Распознан VIN-код:', detectedVin);

      // Установка распознанного VIN-кода
      setVinCode(detectedVin);
      const result: any = await fetchCarByVin(detectedVin);

      if (result.found) {
        setVinModalData(result.data);
        console.log(result.data);
      } else {
        const autoDev: any = await axios.get(
          `https://auto.dev/api/vin/${detectedVin}?apikey=ZrQEPSkKYWRpbGhhbmltZXJvdjgyQGdtYWlsLmNvbQ==`,
        );

        const data = {
          brand: autoDev.data.make.name,
          model: autoDev.data.model.name,
        };

        const getCar: any = await $api.post('/accounts/clients/get-or-create/brand-model/', data);

        setCar(String(getCar.data.brand.id));
        setModelCar(String(getCar.data.model.id));
      }

      // if(result.data)
      // Обновляем VIN в родительском компоненте
      if (setVin) {
        setVin(detectedVin);
      }

      // Вызываем callback с результатом сканирования, если он предоставлен
      if (onScanned) {
        onScanned(detectedVin);
      }

      // Закрываем модальное окно после успешного сканирования
      // onClose();
    } catch (error: any) {
      console.error('Ошибка при обращении к Gemini API:', error.response?.data || error.message);
      setError('Не удалось получить ответ от сервера. Проверьте подключение к интернету.');
    } finally {
      setLoading(false);
      setProcessing(false);
    }
  };

  // Инициализируем камеру при первой загрузке компонента
  useEffect(() => {
    if (isCameraActive && !cameraInitialized) {
      startCamera();
    }
  }, [isCameraActive, cameraInitialized]);

  // Очистка ресурсов при размонтировании компонента
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-70 p-4'>
      <div className='max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-md'>
        <div className='mb-4 flex items-center justify-between'>
          <h1 className='text-2xl font-bold'>Сканер VIN-кода</h1>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700'
            disabled={loading || processing}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-6 w-6'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        <div
          className='relative mb-4 overflow-hidden rounded-lg bg-gray-100'
          style={{ minHeight: '300px', maxHeight: '60vh' }}
        >
          {isCameraActive ? (
            <div className='relative h-full w-full'>
              <video
                ref={videoRef}
                className='h-full w-full object-cover'
                playsInline
                muted
                autoPlay
              />
              {!cameraInitialized && (
                <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50'>
                  <div className='flex flex-col items-center text-white'>
                    <div className='mb-2 h-12 w-12 animate-spin rounded-full border-4 border-white border-t-blue-500 border-opacity-25'></div>
                    <p>Активация камеры...</p>
                  </div>
                </div>
              )}
              <div className='absolute left-0 right-0 top-0 bg-black bg-opacity-50 p-2 text-center text-white'>
                Наведите камеру на VIN-код и нажмите кнопку Сделать фото
              </div>
            </div>
          ) : imagePreview ? (
            <div className='relative h-full'>
              <img src={imagePreview} alt='Предпросмотр' className='h-full w-full object-contain' />
              {(loading || processing) && (
                <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50'>
                  <div className='flex flex-col items-center text-white'>
                    <div className='mb-2 h-12 w-12 animate-spin rounded-full border-4 border-white border-t-blue-500 border-opacity-25'></div>
                    <p>Распознавание VIN-кода...</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className='flex h-full min-h-[300px] items-center justify-center'>
              <p className='text-gray-500'>Нажмите кнопку камеры или загрузите изображение</p>
            </div>
          )}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        <div className='mb-4 grid grid-cols-2 gap-2'>
          {isCameraActive ? (
            <button
              onClick={capturePhoto}
              disabled={processing || !cameraInitialized}
              className='flex items-center justify-center rounded-lg bg-green-600 px-4 py-3 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                className='mr-2 h-6 w-6'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z'
                />
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15 13a3 3 0 11-6 0 3 3 0 016 0z'
                />
              </svg>
              {processing ? 'Обработка...' : 'Сделать фото'}
            </button>
          ) : (
            <button
              onClick={() => setIsCameraActive(true)}
              disabled={loading || processing}
              className='flex items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                className='mr-2 h-6 w-6'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z'
                />
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15 13a3 3 0 11-6 0 3 3 0 016 0z'
                />
              </svg>
              Открыть камеру
            </button>
          )}

          <div className='relative'>
            <input
              type='file'
              accept='image/*'
              onChange={handleImageUpload}
              ref={fileInputRef}
              disabled={loading || processing}
              className='hidden'
            />
            <button
              type='button'
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || processing}
              className='flex w-full items-center justify-center rounded-lg bg-gray-600 px-4 py-3 text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-400'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                className='mr-2 h-6 w-6'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12'
                />
              </svg>
              Загрузить фото
            </button>
          </div>
        </div>

        {/* Сообщение об ошибке распознавания VIN-кода */}
        {error && (
          <div className='mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700'>
            <p>{error}</p>

            {/* Кнопка повторного анализа доступна только если изображение есть */}
            {image && (
              <div className='mt-2 flex gap-2'>
                <button
                  onClick={() => analyzeImage()}
                  disabled={loading || processing}
                  className='rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400'
                >
                  Повторить распознавание
                </button>
                <button
                  onClick={() => setIsCameraActive(true)}
                  disabled={loading || processing}
                  className='rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400'
                >
                  Сделать новое фото
                </button>
              </div>
            )}
          </div>
        )}

        {/* Кнопка "Отмена" */}
        <div className='mt-4 flex justify-end'>
          <button
            onClick={onClose}
            disabled={loading || processing}
            className='rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-400'
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScannerModal;
