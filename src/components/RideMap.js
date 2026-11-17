import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { C } from '../theme';

const DARK = [
  { elementType: 'geometry', stylers: [{ color: '#121214' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#A1A1A8' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0B0B0C' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2A2A2E' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0B0B0C' }] },
];
const ll = p => ({ latitude: p.lat, longitude: p.lng });

// pickup and rider are { lat, lng }. Shows both pins and keeps them in view.
export default function RideMap({ pickup, rider, height = 220 }) {
  const ref = useRef(null);
  const pts = [pickup, rider].filter(p => p && p.lat != null);
  const key = pts.map(p => `${p.lat},${p.lng}`).join('|');
  useEffect(() => {
    if (pts.length > 1) ref.current?.fitToCoordinates(pts.map(ll), { edgePadding: { top: 50, right: 50, bottom: 50, left: 50 }, animated: true });
  }, [key]);
  if (!pts.length) return null;
  return (
    <View style={{ height, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: C.border }}>
      <MapView ref={ref} style={{ flex: 1 }} customMapStyle={DARK}
        initialRegion={{ ...ll(pts[0]), latitudeDelta: 0.02, longitudeDelta: 0.02 }}>
        {pickup?.lat != null && <Marker coordinate={ll(pickup)} title="Pickup" pinColor="#FFFFFF" />}
        {rider?.lat != null && <Marker coordinate={ll(rider)} title="Rider" pinColor="#FF6B00" />}
      </MapView>
    </View>
  );
}
