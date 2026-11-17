import React, { useEffect, useState } from 'react';
import { Alert, Linking, View, Text } from 'react-native';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Screen, H1, Muted, Btn, Card, Avatar } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { C } from '../theme';

// Only users whose role is 'admin' reach this screen (see App.js and firestore.rules).
export default function Admin() {
  const { logout } = useAuth(); const [list, setList] = useState([]);
  useEffect(() => onSnapshot(query(collection(db, 'users'), where('riderStatus', '==', 'pending')),
    s => setList(s.docs.map(d => ({ uid: d.id, ...d.data() })))), []);
  const decide = (u, status) => updateDoc(doc(db, 'users', u.uid), { riderStatus: status });
  const confirmReject = u => Alert.alert('Reject this rider?', `${u.name} will be asked to submit their details again.`,
    [{ text: 'Cancel', style: 'cancel' }, { text: 'Reject', style: 'destructive', onPress: () => decide(u, 'rejected') }]);
  return (
    <Screen>
      <H1 a="Rider" b="approvals" />
      <Muted>{list.length} waiting for review</Muted>
      {!list.length && <Card><Muted>No riders are waiting. New applications appear here automatically.</Muted></Card>}
      {list.map(u => (
        <Card accent key={u.uid}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Avatar uri={u.photoURL} name={u.name} size={56} />
            <View style={{ flex: 1 }}><Text style={{ color: C.text, fontWeight: '800', fontSize: 16 }}>{u.name}</Text><Muted>{u.phone || 'No phone'}</Muted></View>
          </View>
          <Text style={{ color: C.text }}><Text style={{ fontWeight: '800' }}>ID type: </Text>{u.idType}</Text>
          <Text style={{ color: C.text }}><Text style={{ fontWeight: '800' }}>Plate: </Text>{u.plate}  ·  {u.vehicle || 'No model'}</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Btn kind="ghost" title="View ID" onPress={() => Linking.openURL(u.idUrl)} style={{ flex: 1, height: 44 }} />
            <Btn kind="ghost" title="View licence" onPress={() => Linking.openURL(u.licenceUrl)} style={{ flex: 1, height: 44 }} />
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Btn kind="outline" title="Reject" onPress={() => confirmReject(u)} style={{ flex: 1 }} />
            <Btn title="Approve" onPress={() => decide(u, 'approved')} style={{ flex: 1 }} />
          </View>
        </Card>))}
      <Btn kind="text" title="Log out" onPress={logout} />
    </Screen>
  );
}
