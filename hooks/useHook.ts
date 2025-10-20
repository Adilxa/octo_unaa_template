import { useState } from 'react';

export const useHook = () => {
  const [state, setState] = useState(0);

  const increment = () => {
    setState(state + 1);
  };

  return { state, increment };
};
