import { useEffect, useState } from "react";


export function useDemora(ativo, ms = 4000) {
  const [demorou, SetDemorou] = useState(false);

  useEffect(() => {
    if (!ativo) {
      SetDemorou(false);
      return;
    }
    const timer = setTimeout(() => SetDemorou(true), ms);
    return () => clearTimeout(timer);
  }, [ativo, ms]);

  return demorou;
}
