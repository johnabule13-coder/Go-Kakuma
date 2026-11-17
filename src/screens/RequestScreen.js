import React, { useEffect, useState } from 'react';
import { Alert, Linking, View, Text, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import { Screen, H1, Muted, Btn, Field, Card } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import RideMap from '../components/RideMap';
import { createRide, watchMyRides } from '../services/rides';
import { C } from '../theme';

const ACTIVE = ['requested', 'accepted', 'arrived', 'in_progress'];
export default function Request({ navigation }) {
  const { profile } = useAuth();
  const [coords, setCoords] = useState(null); const [locOff, setLocOff] = useState(false);
  const [pickup, setPickup] = useState(''); const [dest, setDest] = useState(''); const [fare, setFare] = useState(100);
  const [active, setActive] = useState(null); const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const p = await Location.getForegroundPermissionsAsync();
      if (!p.granted) return setLocOff(true);
      const l = await Location.getCurrentPositionAsync({});
      setCoords({ lat: l.coords.latitude, lng: l.coords.longitude }); setLocOff(false);
    })();
  }, []);
  useEffect(() => watchMyRides(profile.uid, 'passengerId', r => setActive(r.find(x => ACTIVE.includes(x.status)) || null)), []);

  const find = async () => {
    if (!dest.trim()) return Alert.alert('Destination', 'Where are you going?');
    if (!coords && !pickup.trim()) return Alert.alert('Pickup', 'Type your pickup point or turn on location.');
    try {
      setBusy(true);
      const ref = await createRide(profile, { pickup: { ...(coords || {}), label: pickup.trim() || 'My location' }, destination: dest.trim(), fare });
      navigation.navigate('RideDetail', { id: ref.id });
    } catch (e) { Alert.alert('Could not request', e.message); } finally { setBusy(false); }
  };
  return (
    <Screen>
      <H1 a="Where" b="to?" />
      {coords && <RideMap pickup={coords} height={180} />}
      {active && <TouchableOpacity onPress={() => navigation.navigate('RideDetail', { id: active.id })}>
        <Card accent><Text style={{ color: C.orange, fontWeight: '800' }}>You have a ride in progress. Tap to open it.</Text></Card></TouchableOpacity>}
      {locOff && <Card><Text style={{ color: C.danger, fontWeight: '800' }}>Location is off</Text>
        <Muted>Turn it on to find nearby riders, or type your pickup below.</Muted>
        <Btn kind="text" title="Open settings" onPress={() => Linking.openSettings()} /></Card>}
      <Field label="Pickup" placeholder={coords ? 'Using my current location' : 'Type your pickup point'} value={pickup} onChangeText={setPickup} />
      <Field label="Destination" placeholder="Where are you going?" value={dest} onChangeText={setDest} />
      <Card accent style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View><Muted>Your fare offer</Muted><Text style={{ color: C.orange, fontSize: 30, fontWeight: '800' }}>KES {fare}</Text></View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Btn kind="ghost" title="−" onPress={() => setFare(Math.max(20, fare - 10))} style={{ width: 48, height: 48 }} />
          <Btn title="+" onPress={() => setFare(fare + 10)} style={{ width: 48, height: 48 }} />
        </View>
      </Card>
      <Muted>Nearby riders will see your offer and can accept or reject it.</Muted>
      <Btn title={busy ? 'Requesting…' : 'Find riders'} disabled={busy} onPress={find} />
    </Screen>
  );
}
