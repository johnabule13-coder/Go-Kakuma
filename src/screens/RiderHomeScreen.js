import React, { useEffect, useState } from 'react';
import { Alert, View, Text, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import { Screen, H1, Muted, Btn, Card, Toggle, Avatar } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { watchRequests, acceptRide, rejectRide, watchMyRides } from '../services/rides';
import { km } from '../services/geo';
import { C } from '../theme';

const ACTIVE = ['accepted', 'arrived', 'in_progress'];
export default function RiderHome({ navigation }) {
  const { profile } = useAuth();
  const [online, setOnline] = useState(false); const [reqs, setReqs] = useState([]); const [me, setMe] = useState(null); const [active, setActive] = useState(null);

  useEffect(() => watchMyRides(profile.uid, 'riderId', r => setActive(r.find(x => ACTIVE.includes(x.status)) || null)), []);
  useEffect(() => {
    if (!online) return setReqs([]);
    (async () => { const p = await Location.getForegroundPermissionsAsync();
      if (p.granted) { const l = await Location.getCurrentPositionAsync({}); setMe({ lat: l.coords.latitude, lng: l.coords.longitude }); } })();
    return watchRequests(setReqs);
  }, [online]);

  const visible = reqs.filter(r => r.passengerId !== profile.uid && !(r.rejectedBy || []).includes(profile.uid))
    .map(r => ({ ...r, away: km(me, r.pickup) })).filter(r => r.away === null || r.away <= 5);
  const accept = async r => {
    try { await acceptRide(r.id, profile); navigation.navigate('RideDetail', { id: r.id }); }
    catch (e) { Alert.alert('Too late', e.message); }
  };
  return (
    <Screen>
      <H1 a="Rider" b="mode" />
      <Toggle label={online ? 'You are online' : 'You are offline'} value={online} onChange={setOnline} />
      {active && <TouchableOpacity onPress={() => navigation.navigate('RideDetail', { id: active.id })}>
        <Card accent><Text style={{ color: C.orange, fontWeight: '800' }}>Current ride with {active.passengerName}. Tap to open.</Text></Card></TouchableOpacity>}
      {online && !visible.length && <Muted>No requests nearby right now. Stay online.</Muted>}
      {online && visible.map(r => (
        <Card accent key={r.id}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Avatar uri={r.passengerPhoto} name={r.passengerName} size={48} /><Text style={{ color: C.text, fontWeight: '800' }}>{r.passengerName}</Text></View>
          <Muted>{r.away != null ? `${r.away.toFixed(1)} km away` : 'Distance unknown'}</Muted>
          <Text style={{ color: C.text }}><Text style={{ fontWeight: '800' }}>Pickup: </Text>{r.pickup?.label}</Text>
          <Text style={{ color: C.text }}><Text style={{ fontWeight: '800' }}>Drop-off: </Text>{r.destination}</Text>
          <Muted>Passenger offers</Muted>
          <Text style={{ color: C.orange, fontSize: 36, fontWeight: '800' }}>KES {r.fare}</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Btn kind="ghost" title="Reject" onPress={() => rejectRide(r.id, profile.uid)} style={{ flex: 1 }} />
            <Btn title="Accept" onPress={() => accept(r)} style={{ flex: 1 }} />
          </View>
        </Card>))}
    </Screen>
  );
}
