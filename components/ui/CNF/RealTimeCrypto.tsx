import { CryptoPrice } from '@/models/CryptoPrice';
import { HttpService } from '@/services/httpService';
import { getApp } from '@react-native-firebase/app';
import { getMessaging, getToken } from '@react-native-firebase/messaging';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { CryptoDataContextInterface } from './CryptoContextInterface';

const CryptoDataContext = createContext<CryptoDataContextInterface | undefined>(undefined);

export const CryptoDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [cryptos, setCryptos] = useState<CryptoPrice[]>([]);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    getToken(getMessaging(getApp()))
      .then(token => setUserId(token))

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
    <CryptoDataContext.Provider value={{ cryptos, userId }}>
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