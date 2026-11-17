import React, { useState } from 'react';
import { Alert, View, Text } from 'react-native';
import { Screen, Muted, Btn, Field, Avatar } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { C } from '../theme';

export default function Profile({ navigation }) {
  const { profile, save, logout } = useAuth();
  const [bio, setBio] = useState(profile.bio || ''); const [phone, setPhone] = useState(profile.phone || ''); const [tc, setTc] = useState(profile.trustedContact || '');
  const rating = profile.ratingCount ? `★ ${(profile.ratingSum / profile.ratingCount).toFixed(1)} (${profile.ratingCount})` : 'No ratings yet';
  return (
    <Screen>
      <View style={{ alignItems: 'center', gap: 6, marginTop: 8 }}>
        <Avatar size={96} uri={profile.photoURL} name={profile.name} />
        <Btn kind="text" title="Change photo" onPress={() => navigation.navigate('Photo')} style={{ height: 40 }} />
        <Text style={{ color: C.text, fontSize: 24, fontWeight: '800' }}>{profile.name}</Text>
        <Muted>{profile.role === 'rider' ? `Boda boda rider${profile.plate ? ' · ' + profile.plate : ''}` : 'Passenger'} · {rating}</Muted>
      </View>
      <Field label="Short bio" value={bio} onChangeText={setBio} maxLength={120} multiline />
      <Field label="Phone" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <Field label="Trusted emergency contact" keyboardType="phone-pad" value={tc} onChangeText={setTc} />
      <Muted>Signed in as {profile.email || 'Google account'}</Muted>
      <Btn title="Save changes" onPress={async () => { await save({ bio: bio.trim(), phone, trustedContact: tc.replace(/\D/g, '') }); Alert.alert('Saved'); }} />
      <Btn kind="ghost" title="Settings" onPress={() => navigation.navigate('Settings')} />
      <Btn kind="outline" title="Log out" onPress={logout} />
    </Screen>
  );
}
