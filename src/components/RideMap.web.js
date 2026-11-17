import React from 'react';
import { Linking } from 'react-native';
import { Card, Btn, Muted } from './ui';

// react-native-maps does not run on the web, so show a link instead.
export default function RideMap({ pickup, rider }) {
  const p = rider?.lat != null ? rider : pickup;
  if (!p || p.lat == null) return null;
  return (
    <Card>
      <Muted>{rider?.lat != null ? 'Rider location' : 'Pickup location'}: {p.lat.toFixed(4)}, {p.lng.toFixed(4)}</Muted>
      <Btn kind="ghost" title="Open in Google Maps" onPress={() => Linking.openURL(`https://maps.google.com/?q=${p.lat},${p.lng}`)} />
    </Card>
  );
}
