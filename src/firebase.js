import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const env = process.env;
const app = getApps().length ? getApps()[0] : initializeApp({
  apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.EXPO_PUBLIC_FIREBASE_APP_ID,
});
export const auth = Platform.OS === 'web' ? getAuth(app)
  : initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
export const db = getFirestore(app);
export const storage = getStorage(app);
