import React from 'react';
import { Screen, Row, Toggle, Btn } from '../components/ui';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { profile, save, logout } = useAuth(); const s = profile.settings || {};
  const set = k => v => save({ settings: { ...s, [k]: v } });
  return (
    <Screen>
      <Toggle label="Share my trip automatically" value={s.shareTrip} onChange={set('shareTrip')} />
      <Toggle label="Ride notifications" value={s.notifications} onChange={set('notifications')} />
      <Toggle label="Show my profile photo" value={s.showPhoto !== false} onChange={set('showPhoto')} />
      <Row title="Language" sub="App language" right="English" />
      <Row title="Payment" sub="Pay the rider directly" right="Cash" />
      <Btn kind="outline" title="Log out" onPress={logout} />
    </Screen>
  );
}
