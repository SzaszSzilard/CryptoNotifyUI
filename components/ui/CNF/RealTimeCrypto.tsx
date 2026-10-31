import { CryptoPrice } from '@/models/CryptoPrice';
import { HttpService } from '@/services/httpService';
import { getApp } from '@react-native-firebase/app';
import { getMessaging, getToken } from '@react-native-firebase/messaging';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { CryptoDataContextInterface } from './CryptoContextInterface';

const CryptoDataContext = createContext<CryptoDataContextInterface | undefined>(undefined);
const UserIdContext = createContext<string>('');
const CryptosRefContext = createContext<React.RefObject<CryptoPrice[]>>({ current: [] });

export const CryptoDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [cryptos, setCryptos] = useState<CryptoPrice[]>([]);
  const [userId, setUserId] = useState<string>('');
  const cryptosRef = useRef<CryptoPrice[]>([]);

  useEffect(() => {
    let isMounted = true;
    let isFetching = false;

    try {
      getToken(getMessaging(getApp()))
        .then(token => {
          if (isMounted) setUserId(token);
        })
        .catch(error => {
          console.error('Failed to get messaging token:', error);
        });
    } catch (error) {
      console.error('Firebase messaging initialization error:', error);
    }

    const fetchCryptos = async () => {
      if (isFetching || !isMounted) return;
      isFetching = true;
      try {
        const data = await HttpService.get<CryptoPrice[]>('crypto/list');
        if (!isMounted || !Array.isArray(data)) return;

        const sorted = [...data].sort((a, b) => b.price - a.price);
        cryptosRef.current = sorted;

        setCryptos(prev => {
          if (
            prev.length === sorted.length &&
            prev.every((item, idx) => item.symbol === sorted[idx].symbol && item.price === sorted[idx].price)
          ) {
            return prev;
          }

          const prevBySymbol = new Map(prev.map(item => [item.symbol, item]));
          return sorted.map(item => {
            const existing = prevBySymbol.get(item.symbol);
            return existing && existing.price === item.price ? existing : item;
          });
        });
      } catch (error) {
        console.error('Failed to fetch cryptos:', error);
      } finally {
        isFetching = false;
      }
    };

    fetchCryptos();
    const intervalId = setInterval(fetchCryptos, 1000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const contextValue = useMemo(() => ({ cryptos, userId }), [cryptos, userId]);

  return (
    <UserIdContext.Provider value={userId}>
      <CryptosRefContext.Provider value={cryptosRef}>
        <CryptoDataContext.Provider value={contextValue}>
          {children}
        </CryptoDataContext.Provider>
      </CryptosRefContext.Provider>
    </UserIdContext.Provider>
  );
};

export const useCryptoData = () => {
  const context = useContext(CryptoDataContext);
  if (!context) {
    throw new Error('useCryptoData must be used within a CryptoDataProvider');
  }
  return context;
};

export const useUserId = () => useContext(UserIdContext);

export const useLatestCryptoGetter = () => {
  const cryptosRef = useContext(CryptosRefContext);
  return useCallback(
    (symbol?: string) => cryptosRef.current?.find(c => c.symbol === symbol) ?? null,
    [cryptosRef]
  );
};
