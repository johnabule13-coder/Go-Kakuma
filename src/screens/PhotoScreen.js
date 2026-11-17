import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import { Screen, H1, Muted, Btn, Avatar, Card } from '../components/ui';
import { PermissionDenied } from '../components/StateView';
import { useAuth } from '../context/AuthContext';
import { pickPhoto, takePhoto, checkPhoto, uploadPhoto } from '../services/photo';

export default function Photo({ navigation }) {
  const { user, profile, save } = useAuth();
  const [asset, setAsset] = useState(null); const [issues, setIssues] = useState([]); const [busy, setBusy] = useState(false); const [denied, setDenied] = useState(false);
  const choose = async fn => {
    const a = await fn(); if (!a) return;
    if (a.denied) return setDenied(true);
    const c = await checkPhoto(a); setIssues(c.issues); setAsset(c.ok ? a : null);
  };
  const finish = () => navigation.canGoBack() && navigation.goBack();
  const saveIt = async () => {
    try { setBusy(true); const url = await uploadPhoto(user.uid, asset); await save({ photoURL: url, photoStepDone: true }); finish(); }
    catch (e) { Alert.alert('Upload failed', e.message); } finally { setBusy(false); }
  };
  if (denied) return <PermissionDenied kind="photos" altLabel="Take a photo with the camera instead" onAlt={() => { setDenied(false); choose(takePhoto); }} />;
  return (
    <Screen>
      <H1 a="Profile" b="photo" />
      <View style={{ alignItems: 'center', marginVertical: 12 }}><Avatar size={160} uri={asset?.uri || profile.photoURL} name={profile.name} /></View>
      <Muted style={{ textAlign: 'center' }}>{profile.role === 'rider' ? 'Passengers see your photo when you accept.' : 'Riders see your photo before pickup.'} You can change or remove it any time.</Muted>
      {issues.length > 0 && <Card accent><Muted style={{ color: '#FF3B30' }}>This photo can't be used: {issues.join(', ')}. Face the light, hold steady, fill the frame.</Muted></Card>}
      <Btn kind="ghost" title="Take a new photo" onPress={() => choose(takePhoto)} />
      <Btn kind="ghost" title="Choose from gallery" onPress={() => choose(pickPhoto)} />
      {profile.photoURL ? <Btn kind="outline" title="Remove photo" onPress={async () => { await save({ photoURL: null }); setAsset(null); }} /> : null}
      <View style={{ flex: 1 }} />
      <Btn title={busy ? 'Saving…' : 'Save photo'} disabled={!asset || busy} onPress={saveIt} />
      <Btn kind="text" title={navigation.canGoBack() ? 'Cancel' : 'Skip for now'} onPress={async () => { await save({ photoStepDone: true }); finish(); }} />
    </Screen>
  );
}
