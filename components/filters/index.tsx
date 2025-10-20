import React from 'react';
import { DatePickerWithRange } from '@/components/ui/date/DatePickerWithRange';
import SearchInput from '@/components/ui/search-input/index';
import ServiceSwitcher from '@/components/ui/service-tabs';
import TabSwitcher from '@/components/ui/tabs/index';

interface Props {
  title: string;
  underTitle: string;
  byCriteriaText?: string;
  criteriaArr?: any[];
  showCalendar?: boolean;
  showButton?: boolean;
  btn?: React.ReactNode;
  showSearchInput?: boolean;
  type?: boolean;
}

const serviceTab = [
  {
    name: 'Мойка',
    link: 'washing',
  },
  {
    name: 'Детейлинг',
    link: 'detailing',
  },
];

const FilterUi: React.FC<Props> = ({
  title,
  underTitle,
  byCriteriaText,
  criteriaArr,
  showCalendar,
  showButton,
  btn,
  showSearchInput = false,
  type = false,
}) => {
  return (
    <div className={'scroll-x flex items-center justify-between overflow-x-scroll px-10 py-10'}>
      <div className={'flex items-center gap-10'}>
        <div className={'flex flex-col gap-2'}>
          <h1 className={'text-3xl font-semibold text-[#FFFFFF]'}>{title}</h1>
          <h4 style={{ width: '100%' }} className={'size-[20px] font-medium text-[#71717A]'}>
            {underTitle}
          </h4>
        </div>
        {showSearchInput && <SearchInput />}
      </div>
      {type && (
        <div className={'flex items-center gap-10'}>
          <h1 className={'text-[20px] text-[#71717A]'}>Тип</h1>
          <ServiceSwitcher tabArr={serviceTab} />
        </div>
      )}
      <div className={'flex items-center gap-6'}>
        <h1 className={'text-[20px] text-[#71717A]'}>{byCriteriaText}</h1>
        {showCalendar && (
          <>
            <TabSwitcher tabArr={criteriaArr} />
            <DatePickerWithRange />
          </>
        )}
        {showButton && btn}
      </div>
    </div>
  );
};

export default FilterUi;
