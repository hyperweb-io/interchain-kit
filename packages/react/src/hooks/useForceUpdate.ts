import { useState, useCallback } from 'react';
export function useForceUpdate(): () => void {
  const [, setTick] = useState(0);
  const update = useCallback(() => {
    setTick(tick => tick + 1);
  }, []);
  return update;
}