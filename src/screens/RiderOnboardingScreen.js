import React, { useState } from 'react';
import { Alert, View, Text, TouchableOpacity } from 'react-native';
import { Screen, H1, Muted, Btn, Field, Card } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { pickPhoto, uploadPhoto } from '../services/photo';
import { C } from '../theme';

const DOCS = ['Refugee ID card', 'Registration document (manifest)', 'National ID'];
export default function RiderOnboarding() {
  const { user, save, logout } = useAuth();
  const [doc, setDoc] = useState(DOCS[0]); const [idA, setIdA] = useState(null); const [licA, setLicA] = useState(null);
  const [plate, setPlate] = useState(''); const [vehicle, setVehicle] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!idA || !licA || !plate.trim()) return Alert.alert('Missing details', 'Please add your ID photo, licence photo and plate number.');
    try {
      setBusy(true);
      const [idUrl, licUrl] = await Promise.all([uploadPhoto(user.uid, idA, 'id.jpg'), uploadPhoto(user.uid, licA, 'licence.jpg')]);
      await save({ idType: doc, idUrl, licenceUrl: licUrl, plate: plate.trim().toUpperCase(), vehicle: vehicle.trim(), riderStatus: 'pending' });
    } catch (e) { Alert.alert('Could not submit', e.message); } finally { setBusy(false); }
  };
  return (
    <Screen>
      <H1 a="Become a" b="GO KAKUMA rider" />
      <Muted>Step 1: Identity   ·   Step 3: Vehicle   ·   Step 4: Review</Muted>
      {DOCS.map(d => (
        <TouchableOpacity key={d} onPress={() => setDoc(d)}>
          <Card accent={doc === d} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: C.text, fontWeight: '700' }}>{d}</Text>{doc === d && <Text style={{ color: C.orange, fontWeight: '800' }}>Selected</Text>}
          </Card></TouchableOpacity>))}
      <Btn kind="ghost" title={idA ? 'ID photo added ✓ (tap to change)' : 'Upload ID photo'} onPress={async () => setIdA((await pickPhoto()) || idA)} />
      <Field label="Plate number" autoCapitalize="characters" value={plate} onChangeText={setPlate} />
      <Field label="Boda boda model / colour" value={vehicle} onChangeText={setVehicle} />
      <Btn kind="ghost" title={licA ? 'Licence photo added ✓ (tap to change)' : 'Upload licence photo'} onPress={async () => setLicA((await pickPhoto()) || licA)} />
      <Btn title={busy ? 'Submitting…' : 'Submit for verification'} disabled={busy} onPress={submit} />
      <Btn kind="text" title="Log out" onPress={logout} />
    </Screen>
  );
}
