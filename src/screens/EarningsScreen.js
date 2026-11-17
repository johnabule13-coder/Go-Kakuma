import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { Screen, H1, Muted, Card, Row } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { watchMyRides } from '../services/rides';
import { C } from '../theme';

export default function Earnings() {
  const { profile } = useAuth(); const [rides, setRides] = useState([]);
  useEffect(() => watchMyRides(profile.uid, 'riderId', setRides), []);
  const week = Date.now() / 1000 - 7 * 86400;
  const done = rides.filter(r => r.status === 'completed' && (r.createdAt?.seconds || 0) > week);
  const total = done.reduce((s, r) => s + (r.fare || 0), 0);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const per = days.map((_, i) => done.filter(r => new Date(r.createdAt.seconds * 1000).getDay() === i).reduce((s, r) => s + r.fare, 0));
  const max = Math.max(...per, 1);
  return (
    <Screen>
      <H1 a="Your" b="earnings" />
      <Card accent><Muted>Last 7 days</Muted><Text style={{ color: C.orange, fontSize: 40, fontWeight: '800' }}>KES {total}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 150, gap: 8, marginTop: 10 }}>
          {per.map((v, i) => <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
            <View style={{ width: '100%', height: Math.max(4, (v / max) * 120), borderRadius: 6, backgroundColor: v === max && v > 0 ? C.orange : C.border }} />
            <Muted style={{ fontSize: 11 }}>{days[i]}</Muted></View>)}
        </View></Card>
      <Row title="Trips completed" sub="Last 7 days" right={String(done.length)} />
      <Row title="Average rating" sub="From passengers" right={profile.ratingCount ? (profile.ratingSum / profile.ratingCount).toFixed(1) : '–'} />
    </Screen>
  );
}
