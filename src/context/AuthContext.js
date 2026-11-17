import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { Platform } from 'react-native';
import { onAuthStateChanged, signInWithCredential, GoogleAuthProvider, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

WebBrowser.maybeCompleteAuthSession();
const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

function GoogleSignInHandler({ onPromptReady }) {
  const env = process.env;
  const [, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });

  useEffect(() => {
    onPromptReady(promptAsync);
    return () => onPromptReady(null);
  }, [onPromptReady, promptAsync]);

  useEffect(() => {
    if (response?.type === 'success') {
      const cred = GoogleAuthProvider.credential(response.params.id_token);
      signInWithCredential(auth, cred).catch(e => alert(e.message));
    }
  }, [response]);

  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);   // undefined = still loading
  const [profile, setProfile] = useState(null);
  const [googlePromptAsync, setGooglePromptAsync] = useState(null);
  const pendingGoogleRole = useRef(null);
  const env = process.env;
  const googleClientId = Platform.OS === 'web' ? env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
    : Platform.OS === 'android' ? env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID
      : Platform.OS === 'ios' ? env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID : undefined;
  const googleSignInReady = Platform.OS === 'web' ? Boolean(googleClientId) : Boolean(googlePromptAsync);
  const onPromptReady = useCallback(promptAsync => setGooglePromptAsync(() => promptAsync), []);

  useEffect(() => {
    let unsub = () => {};
    const off = onAuthStateChanged(auth, async u => {
      unsub(); setUser(u || null);
      if (!u) return setProfile(null);
      const ref = doc(db, 'users', u.uid);
      if (!(await getDoc(ref)).exists()) {
        const role = pendingGoogleRole.current || (await AsyncStorage.getItem('pendingRole')) || 'passenger';
        pendingGoogleRole.current = null;
        const name = (await AsyncStorage.getItem('pendingName')) || u.displayName || '';
        await setDoc(ref, { role, name, email: u.email || '', photoURL: u.photoURL || null, ratingSum: 0, ratingCount: 0,
          settings: { shareTrip: true, notifications: true }, createdAt: serverTimestamp() });
      }
      unsub = onSnapshot(ref, s => setProfile({ uid: u.uid, ...s.data() }));
    });
    return () => { off(); unsub(); };
  }, []);

  const value = {
    user, profile, googleSignInConfigured: Boolean(googleClientId), googleSignInReady,
    signInGoogle: async role => {
      if (!googleClientId) throw new Error('Google sign-in is not configured for this platform.');
      if (Platform.OS === 'web') {
        pendingGoogleRole.current = role;
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        await signInWithPopup(auth, provider);
        return;
      }
      if (!googlePromptAsync) throw new Error('Google sign-in is still loading. Please try again.');
      await AsyncStorage.setItem('pendingRole', role);
      googlePromptAsync();
    },
    signUpEmail: async (name, email, pw, role) => {
      await AsyncStorage.multiSet([['pendingRole', role], ['pendingName', name]]);
      const c = await createUserWithEmailAndPassword(auth, email.trim(), pw);
      await updateProfile(c.user, { displayName: name });
    },
    signInEmail: (email, pw) => signInWithEmailAndPassword(auth, email.trim(), pw),
    logout: () => signOut(auth),
    save: patch => updateDoc(doc(db, 'users', user.uid), patch),
  };
  return <Ctx.Provider value={value}>
    {Platform.OS !== 'web' && googleClientId ? <GoogleSignInHandler onPromptReady={onPromptReady} /> : null}
    {children}
  </Ctx.Provider>;
}
