import React from 'react';
import { View, Text } from 'react-native';
import { Screen, H1, Muted, Btn } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { C } from '../theme';

export default function RiderPending() {
  const { profile, save, logout } = useAuth();
  const rejected = profile.riderStatus === 'rejected';
  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', gap: 14 }}>
        <Text style={{ fontSize: 56, textAlign: 'center', color: C.orange }}>…</Text>
        <H1 a={rejected ? 'Not' : 'Under'} b={rejected ? 'approved' : 'review'} />
        <Muted>{rejected ? 'We could not verify your details. Please check your documents and submit again.' : 'We are checking your ID and vehicle details. This can take 1 to 2 days. We will notify you when you are approved.'}</Muted>
      </View>
      <Btn kind="ghost" title="Edit my details" onPress={() => save({ riderStatus: null })} />
      <Btn kind="text" title="Log out" onPress={logout} />
    </Screen>
  );
}
