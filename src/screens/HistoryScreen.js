import React, { useEffect, useState } from 'react';
import { Screen, H1, Muted, Row } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { watchMyRides } from '../services/rides';

export default function History({ navigation }) {
  const { profile } = useAuth(); const [rides, setRides] = useState([]);
  useEffect(() => watchMyRides(profile.uid, profile.role === 'rider' ? 'riderId' : 'passengerId', setRides), []);
  return (
    <Screen>
      <H1 a="Trip" b="history" />
      {!rides.length && <Muted>No trips yet.</Muted>}
      {rides.map(r => <Row key={r.id} title={`${r.pickup?.label} → ${r.destination}`}
        sub={`${r.status} · ${r.createdAt?.toDate?.().toLocaleDateString() || ''}`} right={`KES ${r.fare}`}
        onPress={() => navigation.navigate('RideDetail', { id: r.id })} />)}
    </Screen>
  );
}
