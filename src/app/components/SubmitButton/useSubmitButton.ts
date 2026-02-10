import { useCallback } from "react";

interface UseSubmitButtonReturn {
  handleClick: () => void;
}

export const useSubmitButton = (
  onSubmit: () => void
): UseSubmitButtonReturn => {
  const handleClick = useCallback(() => {
    onSubmit();
  }, [onSubmit]);

  return {
    handleClick,
  };
};
