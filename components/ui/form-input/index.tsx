import $api from '@/api/http';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// Интерфейс для объекта валидации
interface ValidationProps {
  required?: boolean;
  pattern?: RegExp;
  customValidate?: (value: string) => boolean;
  errorMessage?: string;
}

// Интерфейс для результата автозаполнения (ответ API)
interface CarSuggestion {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  car_license_plate: string;
  car_vin: string;
  car_brand: string;
  car_brand_id: string;
  car_model: string;
  car_model_id: string;
  car_body_type: string;
  car_body_type_id: string;

  [key: string]: any; // Для остальных полей, которые могут быть в ответе
}

// Интерфейс для ответа API с пагинацией
interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CarSuggestion[];
}

// Пропсы компонента
interface FormInputProps {
  title: string;
  placeholder?: string;
  value: string;
  onChange?: (value: string) => void;
  validation?: ValidationProps;
  type?: string;
  isTextArea?: boolean;
  isAutocomplete?: boolean;
  onSelectSuggestion?: (suggestion: CarSuggestion) => void;
}

const FormInput: React.FC<FormInputProps> = ({
  title,
  placeholder = '',
  value,
  onChange,
  validation,
  type = 'text',
  isTextArea = false,
  isAutocomplete = false,
  onSelectSuggestion = null,
}) => {
  const [error, setError] = useState<string>('');
  const [suggestions, setSuggestions] = useState<CarSuggestion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const [wasSearched, setWasSearched] = useState<boolean>(false); // Флаг для отслеживания поиска
  const [touched, setTouched] = useState(false); // Для отслеживания пользовательского взаимодействия
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Обработка клика вне компонента для скрытия подсказок
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setSuggestions([]);
        setWasSearched(false); // Сбрасываем флаг поиска при клике вне компонента
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Проверка валидации при изменении значения и когда поле было затронуто
  useEffect(() => {
    if (touched) {
      validateInput(value);
    }
  }, [value, touched]);

  // Валидация ввода
  const validateInput = (inputValue: string) => {
    if (!validation) return;

    if (validation.required && !inputValue.trim()) {
      setError(validation.errorMessage || `${title} is required`);
      return;
    }

    if (validation.pattern && inputValue.trim() && !validation.pattern.test(inputValue)) {
      setError(validation.errorMessage || `Invalid ${title.toLowerCase()}`);
      return;
    }

    if (validation.customValidate && !validation.customValidate(inputValue)) {
      setError(validation.errorMessage || `Invalid ${title.toLowerCase()}`);
      return;
    }

    setError('');
  };

  // Функция для получения данных автомобиля по номеру
  const fetchCarData = async (carNumber: string) => {
    if (!carNumber || carNumber.length < 2) {
      setSuggestions([]);
      setWasSearched(false);
      return;
    }

    setLoading(true);
    setWasSearched(false); // Сбрасываем флаг перед новым поиском

    try {
      const response = await $api.get(`/accounts/clients/by-car/${carNumber}`);
      if (response) {
        // Используем массив results из ответа API
        setSuggestions(response.data.results || []);
        setWasSearched(true); // Устанавливаем флаг, что поиск был выполнен
      } else {
        setSuggestions([]);
        setWasSearched(true); // Устанавливаем флаг даже при ошибке
      }
    } catch (error) {
      console.error('Error fetching car data:', error);
      setSuggestions([]);
      setWasSearched(true); // Устанавливаем флаг даже при ошибке
    } finally {
      setLoading(false);
    }
  };

  // Обработчик изменения значения в поле ввода
  const handleChange = (newValue: string) => {
    if (onChange) {
      onChange(newValue);
    }

    // Если включено автозаполнение и это поле номера авто, получаем данные
    if (isAutocomplete) {
      fetchCarData(newValue);
    }
  };

  // Функция для выбора подсказки
  const handleSelectSuggestion = (suggestion: CarSuggestion) => {
    console.log(suggestion, '----');
    if (onSelectSuggestion) {
      onSelectSuggestion(suggestion);
    }
    setSuggestions([]);
    setWasSearched(false); // Сбрасываем флаг после выбора
    setIsInputFocused(false); // Также убираем фокус с инпута
  };

  // Обработчик потери фокуса
  const handleBlur = () => {
    setTouched(true);
    validateInput(value);

    // Даем немного времени для клика на подсказку перед скрытием
    setTimeout(() => {
      setIsInputFocused(false);
      setWasSearched(false); // Сбрасываем флаг поиска при потере фокуса
    }, 500);
  };

  console.log(suggestions);

  return (
    <div className='relative w-full'>
      <div className='flex flex-col gap-1'>
        <div className='grid grid-cols-[120px_1fr] items-center gap-4'>
          <label className='text-[14px] font-semibold text-white'>
            {title} {validation?.required && <span className='text-red-500'>*</span>}
          </label>

          {isTextArea ? (
            <Textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              className={`w-full rounded-[6px] border-[1px] ${
                error ? 'border-red-500' : 'border-[#1D3253]'
              } py-5`}
              placeholder={placeholder}
              value={value}
              onChange={e => handleChange(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={handleBlur}
            />
          ) : (
            <Input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type={type}
              className={`w-full rounded-[6px] border-[1px] ${
                error ? 'border-red-500' : 'border-[#1D3253]'
              } py-5`}
              placeholder={placeholder}
              value={value}
              onChange={e => handleChange(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={handleBlur}
            />
          )}
        </div>

        {error && <p className='ml-[120px] mt-1 text-xs text-red-500'>{error}</p>}
      </div>

      {/* Список подсказок */}
      {isAutocomplete && isInputFocused && (
        <div
          ref={suggestionsRef}
          className='absolute z-10 ml-[120px] mt-1 max-h-60 w-[calc(100%-120px)] overflow-auto rounded-md border border-[#1D3253] bg-gray-800 shadow-lg'
        >
          {loading ? (
            <div className='p-2 text-center text-sm text-gray-400'>Загрузка...</div>
          ) : suggestions.length > 0 ? (
            <ul>
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className='cursor-pointer p-2 text-sm text-white hover:bg-gray-700'
                  onClick={() => handleSelectSuggestion(suggestion)}
                >
                  {suggestion.car_license_plate} - {suggestion.car_brand} {suggestion.car_model} (
                  {suggestion.first_name} {suggestion.last_name || ''})
                </li>
              ))}
            </ul>
          ) : wasSearched ? (
            <div className='p-2 text-center text-sm text-gray-400'>Автомобили не найдены</div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default FormInput;
