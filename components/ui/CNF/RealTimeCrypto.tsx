import React, { createContext, useState, useEffect, useContext } from 'react';
import { HttpService } from '@/services/httpService';
import { CryptoPrice } from '@/models/CryptoPrice';

const CryptoDataContext = createContext<CryptoPrice[] | undefined>(undefined);

export const CryptoDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [cryptos, setCryptos] = useState<CryptoPrice[]>([]);

  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        const data = await HttpService.get<CryptoPrice[]>('crypto/list');
        setCryptos(data.sort((a, b) => b.price - a.price));
      } catch (error) {
        console.error('Failed to fetch cryptos:', error);
      }
    };

    fetchCryptos();
    const intervalId = setInterval(fetchCryptos, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <CryptoDataContext.Provider value={cryptos}>
      {children}
    </CryptoDataContext.Provider>
  );
};

export const useCryptoData = () => {
  const context = useContext(CryptoDataContext);
  if (!context) {
    throw new Error('useCryptoData must be used within a CryptoDataProvider');
  }
  return context;
};