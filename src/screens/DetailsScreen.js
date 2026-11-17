import React, { useState } from 'react';
import { Alert } from 'react-native';
import { Screen, H1, Muted, Btn, Field } from '../components/ui';
import { useAuth } from '../context/AuthContext';

export default function Details() {
  const { profile, save } = useAuth();
  const [phone, setPhone] = useState(''); const [bio, setBio] = useState(''); const [trusted, setTrusted] = useState('');
  const next = async () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 9) return Alert.alert('Phone number', 'Please enter a valid phone number.');
    await save({ phone: '+254' + digits.slice(-9), bio: bio.trim(), trustedContact: trusted.replace(/\D/g, ''), detailsDone: true });
  };
  return (
    <Screen>
      <H1 a="Your" b="details" />
      <Muted>Riders and passengers use this to contact and recognise you.</Muted>
      <Field label="Phone number (+254)" keyboardType="phone-pad" placeholder="7XX XXX XXX" value={phone} onChangeText={setPhone} />
      <Field label="Short bio" placeholder="Tell people a little about you" multiline maxLength={120} value={bio} onChangeText={setBio} style={{ height: 110, paddingTop: 14, textAlignVertical: 'top' }} />
      <Muted style={{ textAlign: 'right' }}>{bio.length} / 120</Muted>
      <Field label="Trusted contact phone (for SOS and Share My Trip)" keyboardType="phone-pad" placeholder="Optional" value={trusted} onChangeText={setTrusted} />
      <Btn title="Continue" onPress={next} style={{ marginTop: 12 }} />
    </Screen>
  );
}
