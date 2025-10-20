import $api from '@/api/http';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Minus, Plus } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/shadcn/select';

interface MaterialItem {
  material: string;
  quantity: string;
}

interface Props {
  title: string;
  placeholder: string;
  onChange?: (values: MaterialItem[]) => void;
}

const fetchCategories = async () => {
  const res = await $api.get('/material/list/');
  return res.data;
};

const MaterialsSelectInput: React.FC<Props> = ({ title, placeholder, onChange }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['materialList'],
    queryFn: fetchCategories,
  });

  const [materials, setMaterials] = useState<MaterialItem[]>([{ material: '', quantity: '' }]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [tempQuantity, setTempQuantity] = useState('');

  const handleMaterialChange = (index: number, value: string) => {
    const newMaterials = [...materials];
    newMaterials[index].material = value;
    setMaterials(newMaterials);
    setCurrentIndex(index);
    setIsDialogOpen(true);
  };

  const confirmQuantity = () => {
    if (!tempQuantity) return;
    const newMaterials = [...materials];
    if (currentIndex !== null) {
      newMaterials[currentIndex].quantity = tempQuantity;
      setMaterials(newMaterials);
      onChange && onChange(newMaterials);
    }
    setIsDialogOpen(false);
    setTempQuantity('');
  };

  const addMaterial = () => {
    setMaterials([...materials, { material: '', quantity: '' }]);
  };

  const removeMaterial = (index: number) => {
    const newMaterials = materials.filter((_, i) => i !== index);
    setMaterials(newMaterials);
    onChange && onChange(newMaterials);
  };

  if (isLoading) return <Loader2 className={'spin-in'} />;

  return (
    <div className={'flex flex-col gap-3'}>
      {materials.map((item, index) => (
        <div key={index} className={'relative flex items-center justify-between gap-[10rem]'}>
          <h1 className={'w-[60px] whitespace-nowrap text-[14px] font-semibold text-white'}>
            {title}
            {item.quantity ? (
              <span className={'ml-5 text-white'}>({item.quantity})</span>
            ) : (
              <span className={'ml-5 text-red-500'}>(Не получено)</span>
            )}
          </h1>

          <div className={'flex w-full items-center gap-5'}>
            <Select
              onValueChange={value => handleMaterialChange(index, value)}
              value={item.material}
            >
              <SelectTrigger className={'w-full rounded-[6px] border-[1px] border-[#1D3253] py-5'}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent className={'bg-[#131520]'}>
                {data?.results?.map((el: any) => (
                  <SelectItem key={el.id} value={el.id}>
                    {el.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {index === materials.length - 1 ? (
              <Button
                onClick={addMaterial}
                className={
                  'rounded-[6px] bg-[#0A63F0] px-3 py-2 shadow-[0px_0px_24.7px_0px_rgba(10,99,240,0.5)]'
                }
              >
                <Plus />
              </Button>
            ) : (
              <Button
                onClick={() => removeMaterial(index)}
                className={
                  'rounded-[6px] bg-[#0A63F0] px-3 py-2 shadow-[0px_0px_24.7px_0px_rgba(10,99,240,0.5)]'
                }
              >
                <Minus />
              </Button>
            )}
          </div>
        </div>
      ))}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Введите количество</DialogTitle>
          </DialogHeader>
          <Input
            type='text'
            placeholder='Введите количество'
            value={tempQuantity}
            onChange={e => setTempQuantity(e.target.value)}
            className={'w-full rounded-[6px] border-[1px] border-[#1D3253] py-2'}
          />
          <DialogFooter>
            <Button onClick={confirmQuantity} className={'bg-[#0A63F0] px-4 py-2'}>
              Подтвердить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaterialsSelectInput;
