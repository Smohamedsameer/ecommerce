import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client';

// Defaults match the backend's application.properties, used until /api/store/info answers.
const DEFAULTS = { returnWindowDays: 7, freeDeliveryAbove: 999, deliveryFee: 49, handlingFee: 10, taxRate: 0.05, deliveryDays: 5, onlinePayments: true, returnReasons: [] };
const StoreInfoContext = createContext(DEFAULTS);
export const useStoreInfo = () => useContext(StoreInfoContext);

export function StoreInfoProvider({ children }) {
  const [info, setInfo] = useState(DEFAULTS);
  useEffect(() => { api.get('/api/store/info').then((r) => setInfo({ ...DEFAULTS, ...r.data })).catch(() => {}); }, []);
  return <StoreInfoContext.Provider value={info}>{children}</StoreInfoContext.Provider>;
}
