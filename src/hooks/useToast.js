import { useCallback, useEffect, useRef, useState } from "react";

export function useToast(defaultDuration = 3000) {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const clearToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(null);
  }, []);

  const showToast = useCallback(
    (message, type = "success") => {
      if (timerRef.current) clearTimeout(timerRef.current);
      const next = { message, type, id: Date.now() };
      setToast(next);
      timerRef.current = setTimeout(() => setToast(null), defaultDuration);
    },
    [defaultDuration],
  );

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return { toast, showToast, clearToast };
}
