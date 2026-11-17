import React from 'react';
import { Linking, Platform, View, Text } from 'react-native';
import { Screen, Btn, Muted } from './ui';
import { C } from '../theme';

// Generic empty / error state: big icon, title, message, up to 2 buttons.
export function StateView({ icon = '!', color = C.danger, title, message, primary, secondary, scroll = false }) {
  return (
    <Screen scroll={scroll}>
      <View style={{ flex: 1, justifyContent: 'center', gap: 14 }}>
        <View style={{ width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderColor: color, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color, fontSize: 48, fontWeight: '800' }}>{icon}</Text></View>
        <Text style={{ color: C.text, fontSize: 26, fontWeight: '800', textAlign: 'center' }}>{title}</Text>
        <Muted style={{ textAlign: 'center', fontSize: 15 }}>{message}</Muted>
      </View>
      {primary && <Btn title={primary.label} onPress={primary.onPress} />}
      {secondary && <Btn kind="ghost" title={secondary.label} onPress={secondary.onPress} />}
    </Screen>
  );
}

const STEPS = {
  location: { ios: ['Open Settings', 'Tap GO KAKUMA, then Location', 'Choose While Using the App'],
    android: ['Open Settings, then Apps', 'Tap GO KAKUMA, then Permissions', 'Tap Location and choose Allow while using the app'] },
  photos: { ios: ['Open Settings', 'Tap GO KAKUMA, then Photos', 'Choose Selected Photos or All Photos'],
    android: ['Open Settings, then Apps', 'Tap GO KAKUMA, then Permissions', 'Tap Photos and videos and choose Allow'] },
};
// Shown after the person says "Don't allow". Explains how to turn access back on.
export function PermissionDenied({ kind, altLabel, onAlt }) {
  const loc = kind === 'location';
  const steps = (STEPS[kind][Platform.OS] || STEPS[kind].android);
  return (
    <Screen>
      <View style={{ width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderColor: C.danger, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginTop: 12 }}>
        <Text style={{ color: C.danger, fontSize: 48, fontWeight: '800' }}>!</Text></View>
      <Text style={{ color: C.text, fontSize: 26, fontWeight: '800', textAlign: 'center' }}>{loc ? 'Location is off' : 'Photo access is off'}</Text>
      <Muted style={{ textAlign: 'center', fontSize: 15 }}>{loc ? 'GO KAKUMA needs your location to find nearby riders.' : 'GO KAKUMA needs photo access to choose a picture from your gallery.'} You can turn it on in your phone settings.</Muted>
      {steps.map((s, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 14 }}>
          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: C.orange, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontWeight: '800', color: '#0B0B0C' }}>{i + 1}</Text></View>
          <Text style={{ color: C.text, flex: 1 }}>{s}</Text></View>))}
      <View style={{ flex: 1 }} />
      {Platform.OS !== 'web' && <Btn title="Open settings" onPress={() => Linking.openSettings()} />}
      <Btn kind="text" title={altLabel} onPress={onAlt} />
    </Screen>
  );
}
