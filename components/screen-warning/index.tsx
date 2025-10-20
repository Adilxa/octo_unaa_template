import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const ScreenSizeWarning = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);

  // You can add an effect to handle window resize
  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Dialog open={isSmallScreen}>
      <DialogContent className='p-6 text-center'>
        <DialogHeader>
          <DialogTitle>Внимание</DialogTitle>
        </DialogHeader>
        <p className='text-lg font-semibold'>Вам нужно устройство с большим разрешением экрана</p>
      </DialogContent>
    </Dialog>
  );
};

export default ScreenSizeWarning;
