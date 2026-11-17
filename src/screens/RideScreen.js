import React, { useEffect, useState } from 'react';
import { Alert, Share, View, Text } from 'react-native';
import * as Location from 'expo-location';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Screen, H1, Muted, Btn, Card, Avatar, Stars } from '../components/ui';
import { StateView } from '../components/StateView';
import RideMap from '../components/RideMap';
import { useAuth } from '../context/AuthContext';
import { watchRide, setStatus, raiseFare, retryRide, updateRiderLocation, rate } from '../services/rides';
import { C } from '../theme';

const LABEL = { requested: 'Looking for a rider', accepted: 'Rider accepted', arrived: 'Rider has arrived', in_progress: 'Trip in progress', completed: 'Trip complete', cancelled: 'Cancelled' };
const WAIT_SECONDS = 60; // after this with no response, show "No riders nearby"

export default function Ride({ route, navigation }) {
  const { profile } = useAuth(); const isRider = profile.role === 'rider';
  const [ride, setRide] = useState(null); const [stars, setStars] = useState(5); const [waited, setWaited] = useState(0);
  useEffect(() => watchRide(route.params.id, setRide), []);

  const status = ride?.status;
  const live = ['accepted', 'arrived', 'in_progress'].includes(status);

  // passenger: count seconds while waiting for a rider
  useEffect(() => {
    if (status !== 'requested') return;
    const t = setInterval(() => setWaited(w => w + 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  // rider: share live location with the passenger during the ride
  useEffect(() => {
    if (!isRider || !live) return;
    let sub;
    (async () => {
      try {
        const p = await Location.getForegroundPermissionsAsync(); if (!p.granted) return;
        sub = await Location.watchPositionAsync({ distanceInterval: 20 },
          l => updateRiderLocation(route.params.id, { lat: l.coords.latitude, lng: l.coords.longitude }));
      } catch {}
    })();
    return () => sub?.remove();
  }, [isRider, live]);

  if (!ride) return <Screen><Muted>Loading…</Muted></Screen>;

  const rejectedCount = (ride.rejectedBy || []).length;
  const cancel = async () => { await setStatus(ride.id, 'cancelled'); navigation.goBack(); };

  // ---- error / empty states (passenger side) ----
  if (!isRider && status === 'requested' && rejectedCount > 0)
    return <StateView icon="×" title="Offer not accepted"
      message={`Nearby riders could not accept KES ${ride.fare}. You can raise your offer or try again.`}
      primary={{ label: `Offer KES ${ride.fare + 20}`, onPress: () => raiseFare(ride.id, ride.fare + 20) }}
      secondary={{ label: 'Cancel request', onPress: cancel }} />;
  if (!isRider && status === 'requested' && waited >= WAIT_SECONDS)
    return <StateView icon="0" title="No riders nearby"
      message="No riders are available in your area right now. Try again, or raise your fare offer."
      primary={{ label: 'Try again', onPress: () => { setWaited(0); retryRide(ride.id); } }}
      secondary={{ label: `Increase my offer to KES ${ride.fare + 20}`, onPress: () => { setWaited(0); raiseFare(ride.id, ride.fare + 20); } }} />;

  const other = isRider ? { name: ride.passengerName, photo: ride.passengerPhoto } : { name: ride.riderName, photo: ride.riderPhoto };
  const given = isRider ? ride.passengerRatingGiven : ride.riderRatingGiven;
  const share = () => Share.share({ message: `I'm on a GO KAKUMA ride${ride.riderName ? ` with ${ride.riderName} (${ride.riderPlate})` : ''} from ${ride.pickup?.label} to ${ride.destination}. Fare: KES ${ride.fare}.` });
  const report = () => Alert.alert('Report a problem', 'Send a report about this trip?', [{ text: 'Cancel', style: 'cancel' },
    { text: 'Send', onPress: async () => { await addDoc(collection(db, 'alerts'), { type: 'report', rideId: ride.id, by: profile.uid, at: serverTimestamp() }); Alert.alert('Report sent'); } }]);
  const next = { accepted: ['I have arrived', 'arrived'], arrived: ['Start trip', 'in_progress'], in_progress: ['Complete trip', 'completed'] }[status];

  return (
    <Screen>
      <H1 a={LABEL[status]} b="" />
      <RideMap pickup={ride.pickup} rider={ride.riderLocation} />
      <Card accent><Muted>{ride.pickup?.label} → {ride.destination}</Muted><Text style={{ color: C.orange, fontSize: 30, fontWeight: '800' }}>KES {ride.fare}</Text></Card>

      {status === 'requested' && <>
        <Muted>Nearby riders can see your offer and accept or reject it. Waiting {waited}s…</Muted>
        {!isRider && <Btn kind="outline" title="Cancel request" onPress={cancel} />}
      </>}

      {(live || status === 'completed') && ride.riderId && (
        <Card><View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Avatar uri={other.photo} name={other.name} size={64} />
          <View style={{ flex: 1 }}><Text style={{ color: C.text, fontWeight: '800', fontSize: 16 }}>{other.name}</Text>
            {!isRider && <Muted>{ride.riderVehicle} · {ride.riderPlate}{ride.riderRating ? ` · ★ ${ride.riderRating}` : ''}</Muted>}</View></View></Card>)}

      {live && <>
        {isRider && next && <Btn title={next[0]} onPress={() => setStatus(ride.id, next[1])} />}
        {!isRider && <Muted>Status: {LABEL[status]}</Muted>}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Btn kind="ghost" title="Share My Trip" onPress={share} style={{ flex: 1 }} />
          <Btn kind="ghost" title="SOS" onPress={() => navigation.navigate('SOS', { ride })} style={{ flex: 1 }} />
        </View>
        <Btn kind="text" title="Report a problem" onPress={report} />
      </>}

      {status === 'completed' && (given ? <Muted style={{ textAlign: 'center' }}>Thanks for your feedback.</Muted> : <>
        <H1 a="How was your" b="trip?" /><Stars value={stars} onChange={setStars} />
        <Btn title="Submit feedback" onPress={() => rate(ride, isRider ? 'rider' : 'passenger', stars)} />
        <Btn kind="text" title="Report a problem" onPress={report} /></>)}
    </Screen>
  );
}
