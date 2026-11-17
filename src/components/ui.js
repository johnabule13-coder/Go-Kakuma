import React from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C } from '../theme';

export const Screen = ({ children, scroll = true, style }) => (
  <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
    {scroll ? <ScrollView contentContainerStyle={[{ padding: 20, gap: 14, flexGrow: 1 }, style]} keyboardShouldPersistTaps="handled">{children}</ScrollView>
            : <View style={[{ flex: 1, padding: 20, gap: 14 }, style]}>{children}</View>}
  </SafeAreaView>
);
export const H1 = ({ a, b }) => <Text style={{ color: C.text, fontSize: 28, fontWeight: '800' }}>{a} <Text style={{ color: C.orange }}>{b}</Text></Text>;
export const Muted = ({ children, style }) => <Text style={[{ color: C.muted, fontSize: 14 }, style]}>{children}</Text>;
export const Btn = ({ title, onPress, kind = 'primary', disabled, style }) => {
  const k = { primary:[C.orange,'#0B0B0C',0], ghost:[C.card,C.text,1], text:['transparent',C.muted,0], danger:[C.danger,'#0B0B0C',0], outline:['transparent',C.danger,1] }[kind];
  return (
    <TouchableOpacity accessibilityRole="button" disabled={disabled} onPress={onPress}
      style={[{ height:54, borderRadius:14, backgroundColor:k[0], borderWidth:k[2], borderColor: kind==='outline'?C.danger:C.border, alignItems:'center', justifyContent:'center', opacity:disabled?0.5:1 }, style]}>
      <Text style={{ color:k[1], fontWeight:'800', fontSize:16 }}>{title}</Text>
    </TouchableOpacity>
  );
};
export const Field = ({ label, style, ...p }) => (
  <View style={{ gap: 6 }}>
    {label ? <Text style={{ color: C.text, fontWeight: '700' }}>{label}</Text> : null}
    <TextInput placeholderTextColor={C.muted} {...p}
      style={[{ minHeight:52, borderWidth:1, borderColor:C.border, backgroundColor:C.card, borderRadius:14, paddingHorizontal:16, color:C.text, fontSize:15 }, style]} />
  </View>
);
export const Card = ({ children, style, accent }) => (
  <View style={[{ backgroundColor:C.card, borderWidth:1, borderColor:accent?C.orange:C.border, borderRadius:16, padding:16, gap:6 }, style]}>{children}</View>
);
export const Row = ({ title, sub, right, onPress }) => (
  <TouchableOpacity disabled={!onPress} onPress={onPress}>
    <Card style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
      <View style={{ flex:1 }}><Text style={{ color:C.text, fontWeight:'700' }}>{title}</Text>{sub ? <Muted>{sub}</Muted> : null}</View>
      {right ? <Text style={{ color:C.orange, fontWeight:'800' }}>{right}</Text> : null}
    </Card>
  </TouchableOpacity>
);
export const Toggle = ({ label, value, onChange }) => (
  <Card style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
    <Text style={{ color:C.text, fontWeight:'700' }}>{label}</Text>
    <Switch value={!!value} onValueChange={onChange} trackColor={{ true:C.orange, false:C.border }} accessibilityLabel={label} />
  </Card>
);
export const Avatar = ({ uri, name = '?', size = 56 }) => uri
  ? <Image source={{ uri }} style={{ width:size, height:size, borderRadius:size/2, borderWidth:2, borderColor:C.orange }} />
  : <View style={{ width:size, height:size, borderRadius:size/2, borderWidth:2, borderColor:C.orange, backgroundColor:C.border, alignItems:'center', justifyContent:'center' }}>
      <Text style={{ color:C.orange, fontWeight:'800', fontSize:size/3 }}>{name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}</Text></View>;
export const Stars = ({ value, onChange }) => (
  <View style={{ flexDirection:'row', justifyContent:'center', gap:6 }}>
    {[1,2,3,4,5].map(n => <TouchableOpacity key={n} onPress={() => onChange(n)} accessibilityLabel={`${n} stars`}>
      <Text style={{ fontSize:40, color: n<=value ? C.orange : C.border }}>★</Text></TouchableOpacity>)}
  </View>
);
