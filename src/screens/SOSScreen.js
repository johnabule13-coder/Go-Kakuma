import React from 'react';
import { Alert, Linking, Platform, View, Text, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Screen, H1, Muted, Btn, Row } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { C } from '../theme';

export default function SOS({ route, navigation }) {
  const { profile } = useAuth(); const ride = route.params?.ride;
  const send = async () => {
    let where = '';
    try { const l = await Location.getCurrentPositionAsync({}); where = `https://maps.google.com/?q=${l.coords.latitude},${l.coords.longitude}`; } catch {}
    await addDoc(collection(db, 'alerts'), { type: 'sos', by: profile.uid, rideId: ride?.id || null, where, at: serverTimestamp() });
    const msg = `EMERGENCY: ${profile.name} needs help. ${where}${ride?.riderPlate ? ` Rider plate: ${ride.riderPlate}` : ''}`;
    if (profile.trustedContact) Linking.openURL(`sms:${profile.trustedContact}${Platform.OS === 'ios' ? '&' : '?'}body=${encodeURIComponent(msg)}`);
    else Alert.alert('SOS recorded', 'Add a trusted contact in your profile so we can message them.');
  };
  return (
    <Screen>
      <H1 a="Emergency" b="help" />
      <Muted style={{ textAlign: 'center' }}>Your live location and trip details are sent to your trusted contact.</Muted>
      <TouchableOpacity onLongPress={send} delayLongPress={3000} accessibilityLabel="SOS. Hold for 3 seconds"
        style={{ width: 200, height: 200, borderRadius: 100, backgroundColor: C.danger, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginVertical: 24 }}>
        <Text style={{ color: '#0B0B0C', fontSize: 44, fontWeight: '800' }}>SOS</Text></TouchableOpacity>
      <Muted style={{ textAlign: 'center' }}>Hold for 3 seconds to alert</Muted>
      <Row title="Trusted contact" sub={profile.trustedContact || 'Not set. Add one in your profile.'} />
      <Btn kind="ghost" title="Cancel" onPress={() => navigation.goBack()} />
    </Screen>
  );
}
