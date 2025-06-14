// userId.js
import * as SecureStore from 'expo-secure-store';

export async function getOrCreateUserId() {
  console.log('Retrieving or creating userId...');
  let userId;

  // Web: use localStorage and window.crypto
  if (typeof window !== 'undefined' && window.localStorage) {
    userId = window.localStorage.getItem('userId');
    if (!userId) {
      console.log('No userId found in localStorage, generating a new one...');
      const array = new Uint8Array(32);
      if (window.crypto && window.crypto.getRandomValues) {
        window.crypto.getRandomValues(array);
      } else {
        // fallback: fill with Math.random (not cryptographically secure)
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 256);
        }
      }
      userId = Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
      window.localStorage.setItem('userId', userId);
      console.log(`Generated new userId (web): ${userId}`);
    } else {
      console.log(`Found existing userId in localStorage: ${userId}`);
    }
    return userId;
  }

  // Native: use SecureStore and globalThis.crypto
  try {
    userId = await SecureStore.getItemAsync('userId');
    if (!userId) {
      console.log('No userId found in SecureStore, generating a new one...');
      const array = new Uint8Array(32);
      if (globalThis.crypto && globalThis.crypto.getRandomValues) {
        globalThis.crypto.getRandomValues(array);
      } else {
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 256);
        }
      }
      userId = Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
      await SecureStore.setItemAsync('userId', userId);
      console.log(`Generated new userId (native): ${userId}`);
    } else {
      console.log(`Found existing userId in SecureStore: ${userId}`);
    }
    return userId;
  } catch (e) {
    console.error('SecureStore error:', e);
    return null;
  }
}