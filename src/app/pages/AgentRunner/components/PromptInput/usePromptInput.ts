import { useState, useCallback } from "react";

interface UsePromptInputReturn {
  value: string;
  setValue: (value: string) => void;
  clear: () => void;
  isEmpty: boolean;
}

export const usePromptInput = (initialValue: string = ""): UsePromptInputReturn => {
  const [value, setValueState] = useState<string>(initialValue);

  const setValue = useCallback((newValue: string) => {
    setValueState(newValue);
  }, []);

  const clear = useCallback(() => {
    setValueState("");
  }, []);

  const isEmpty = value.trim().length === 0;

  return {
    value,
    setValue,
    clear,
    isEmpty,
  };
};
