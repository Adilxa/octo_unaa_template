import { Dot } from 'lucide-react';
import React from 'react';
import EditPackageBtn from '@/components/action-btns/editPackageBtn';

type ServiceData = {
  id: number;
  name: string;
  quantity: number;
};

type MaterialData = {
  id: number;
  name: string;
};

interface Props {
  id: number;
  is_active: boolean;
  name: string;
  category_name: string;
  price: string;
  description: string;
  services?: ServiceData[];
  materials?: MaterialData[];
}

const PackagesCard: React.FC<Props> = ({
  id,
  is_active,
  name,
  category_name,
  price,
  services = [],
  materials = [],
  description,
}) => {
  return (
    <div className={'flex flex-col gap-5 rounded-xl bg-[#1C1F33] px-6 py-7'}>
      <header className={'flex items-center justify-between'}>
        <div className={'rounded-full bg-[#0A63F0] px-3 py-1'}>
          {is_active ? 'Активный' : 'Неактивный'}
        </div>
        <EditPackageBtn id={id} />
      </header>
      <div className={'flex flex-col gap-5 pl-2'}>
        <h1 className={'text-[18px] font-semibold text-[#FFFFFF]'}>Пакет: {name}</h1>
        <p className={'text-[16px] text-[#30B4E7]'}>{description}</p>
      </div>
      {services.length > 0 && (
        <div className={'pl-2'}>
          <h1 className={'text-[16px] font-semibold'}>Услуги</h1>
          {services.map(el => (
            <p key={el.id} className='flex items-center gap-2 font-light text-[#C3E8FF66]'>
              <Dot /> {el.name}
            </p>
          ))}
        </div>
      )}
      {materials.length > 0 && (
        <div className={'pl-2'}>
          <h1 className={'text-[16px] font-semibold'}>Материалы</h1>
          {materials.map(el => (
            <p key={el.id} className='flex items-center gap-2 font-light text-[#C3E8FF66]'>
              <Dot /> {el.name}
            </p>
          ))}
        </div>
      )}
      <h1 className={'pl-2 text-[18px] font-semibold'}>
        Стоимость: <span className={'text-[#0A63F0]'}>{price} сом</span>
      </h1>
    </div>
  );
};

export default PackagesCard;
