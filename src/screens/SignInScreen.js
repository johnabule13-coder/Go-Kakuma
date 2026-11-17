import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Screen, Btn, Field, Muted } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { C } from '../theme';

export default function SignIn() {
  const { signInGoogle, signUpEmail, signInEmail, googleSignInConfigured, googleSignInReady } = useAuth();
  const [role, setRole] = useState('passenger');
  const [mode, setMode] = useState('register');
  const [f, setF] = useState({ name: '', email: '', pw: '' });
  const set = k => v => setF({ ...f, [k]: v });
  const continueWithGoogle = async () => {
    try { await signInGoogle(role); }
    catch (e) { Alert.alert('Could not continue with Google', e.message); }
  };
  const go = async () => {
    try { mode === 'register' ? await signUpEmail(f.name, f.email, f.pw, role) : await signInEmail(f.email, f.pw); }
    catch (e) { Alert.alert('Could not continue', e.message); }
  };
  return (
    <Screen style={{ width: '100%', maxWidth: 520, alignSelf: 'center' }}>
      <Text style={{ color: C.orange, fontWeight: '800', fontSize: 20, marginTop: 24 }}>GO KAKUMA</Text>
      <Text style={{ color: C.text, fontSize: 34, fontWeight: '800' }}>Get around Kakuma, <Text style={{ color: C.orange }}>safely.</Text></Text>
      <Muted>Request a boda boda, offer your fare, share your trip.</Muted>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Continue with Google"
        accessibilityState={{ disabled: !googleSignInReady }}
        disabled={!googleSignInReady}
        onPress={continueWithGoogle}
        style={{
          minHeight: 62,
          width: '100%',
          borderRadius: 14,
          borderWidth: 1,
          borderColor: '#DADCE0',
          backgroundColor: '#FFFFFF',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          opacity: googleSignInReady ? 1 : 0.65,
          elevation: 2,
          shadowColor: '#000000',
          shadowOpacity: 0.16,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
        }}>
        {googleSignInReady
          ? <FontAwesome name="google" size={23} color="#4285F4" />
          : <ActivityIndicator size="small" color="#4285F4" />}
        <Text style={{ color: '#202124', fontSize: 17, fontWeight: '700' }}>
          {googleSignInReady ? 'Continue with Google' : 'Loading Google sign-in...'}
        </Text>
      </TouchableOpacity>
      {!googleSignInConfigured && <Muted>Google sign-in needs a platform OAuth client ID. You can still use email.</Muted>}
      <Muted style={{ textAlign: 'center' }}>or use email</Muted>
      <View style={{ flexDirection: 'row', backgroundColor: C.card, borderRadius: 14, padding: 4, gap: 8 }}>
        {['passenger', 'rider'].map(r => (
          <TouchableOpacity key={r} onPress={() => setRole(r)} style={{ flex: 1, height: 44, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: role === r ? C.orange : 'transparent' }}>
            <Text style={{ fontWeight: '800', color: role === r ? '#0B0B0C' : C.muted }}>{r === 'rider' ? 'Boda rider' : 'Passenger'}</Text>
          </TouchableOpacity>))}
      </View>
      {mode === 'register' && <Field placeholder="Full name" value={f.name} onChangeText={set('name')} />}
      <Field placeholder="Email address" autoCapitalize="none" keyboardType="email-address" value={f.email} onChangeText={set('email')} />
      <Field placeholder="Password (6+ characters)" secureTextEntry value={f.pw} onChangeText={set('pw')} />
      <Btn title={mode === 'register' ? 'Create account' : 'Log in'} onPress={go} />
      <TouchableOpacity onPress={() => setMode(mode === 'register' ? 'login' : 'register')}>
        <Muted style={{ textAlign: 'center' }}>{mode === 'register' ? 'Already have an account? ' : 'New here? '}<Text style={{ color: C.orange, fontWeight: '800' }}>{mode === 'register' ? 'Log in' : 'Register'}</Text></Muted>
      </TouchableOpacity>
    </Screen>
  );
}
