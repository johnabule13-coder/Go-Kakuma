import React, { useState } from 'react';
import { View, Text } from 'react-native';
import * as Location from 'expo-location';
import { Screen, H1, Muted, Btn } from '../components/ui';
import { PermissionDenied } from '../components/StateView';
import { useAuth } from '../context/AuthContext';
import { C } from '../theme';

export default function LocationAsk() {
  const { save } = useAuth(); const [denied, setDenied] = useState(false);
  const allow = async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (granted) await save({ locationAsked: true }); else setDenied(true);
  };
  if (denied) return <PermissionDenied kind="location" altLabel="Enter pickup manually" onAlt={() => save({ locationAsked: true })} />;
  return (
    <Screen>
      <H1 a="Allow" b="location" />
      <View style={{ width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: C.orange, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginVertical: 16 }}>
        <Text style={{ fontSize: 48 }}>📍</Text></View>
      <Muted style={{ textAlign: 'center' }}>GO KAKUMA uses your location to find nearby riders and set your pickup point. It is only used while the app is open.</Muted>
      <View style={{ flex: 1 }} />
      <Btn title="Allow location" onPress={allow} />
      <Btn title="Not now" kind="text" onPress={() => save({ locationAsked: true })} />
    </Screen>
  );
}
