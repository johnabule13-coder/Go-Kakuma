import React from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNetInfo } from '@react-native-community/netinfo';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { C } from './src/theme';
import SignIn from './src/screens/SignInScreen';
import Details from './src/screens/DetailsScreen';
import Location from './src/screens/LocationScreen';
import Photo from './src/screens/PhotoScreen';
import RiderOnboarding from './src/screens/RiderOnboardingScreen';
import RiderPending from './src/screens/RiderPendingScreen';
import Request from './src/screens/RequestScreen';
import RiderHome from './src/screens/RiderHomeScreen';
import Ride from './src/screens/RideScreen';
import History from './src/screens/HistoryScreen';
import Earnings from './src/screens/EarningsScreen';
import Profile from './src/screens/ProfileScreen';
import Settings from './src/screens/SettingsScreen';
import Admin from './src/screens/AdminScreen';
import { StateView } from './src/components/StateView';
import SOS from './src/screens/SOSScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const theme = { ...DarkTheme, colors: { ...DarkTheme.colors, background: C.bg, card: C.bg, primary: C.orange, border: C.border } };
const tabOpts = { headerShown: false, tabBarActiveTintColor: C.orange, tabBarInactiveTintColor: C.muted, tabBarStyle: { backgroundColor: C.bg, borderTopColor: C.border } };

const PassengerTabs = () => (
  <Tab.Navigator screenOptions={tabOpts}>
    <Tab.Screen name="Ride" component={Request} />
    <Tab.Screen name="History" component={History} />
    <Tab.Screen name="Profile" component={Profile} />
  </Tab.Navigator>
);
const RiderTabs = () => (
  <Tab.Navigator screenOptions={tabOpts}>
    <Tab.Screen name="Online" component={RiderHome} />
    <Tab.Screen name="Earnings" component={Earnings} />
    <Tab.Screen name="History" component={History} />
    <Tab.Screen name="Profile" component={Profile} />
  </Tab.Navigator>
);

function Root() {
  const { user, profile } = useAuth();
  const net = useNetInfo();
  const hdr = { headerShown: false };
  let screens;
  if (net.isConnected === false) return <StateView title="No connection" message="Check your mobile data or Wi-Fi. Your request has not been sent." primary={{ label: 'Retry', onPress: () => {} }} />;
  if (user === undefined || (user && !profile)) {
    return <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: 'center' }}><ActivityIndicator color={C.orange} size="large" /></View>;
  }
  if (!user) screens = <Stack.Screen name="SignIn" component={SignIn} />;
  else if (profile.role === 'admin') screens = <Stack.Screen name="Admin" component={Admin} />;
  else if (!profile.detailsDone) screens = <Stack.Screen name="Details" component={Details} />;
  else if (!profile.locationAsked) screens = <Stack.Screen name="Location" component={Location} />;
  else if (!profile.photoStepDone) screens = <Stack.Screen name="Photo" component={Photo} />;
  else if (profile.role === 'rider' && !profile.riderStatus) screens = <Stack.Screen name="RiderOnboarding" component={RiderOnboarding} />;
  else if (profile.role === 'rider' && profile.riderStatus !== 'approved') screens = <Stack.Screen name="RiderPending" component={RiderPending} />;
  else screens = (<>
    <Stack.Screen name="Main" component={profile.role === 'rider' ? RiderTabs : PassengerTabs} />
    <Stack.Screen name="RideDetail" component={Ride} />
    <Stack.Screen name="Photo" component={Photo} />
    <Stack.Screen name="Settings" component={Settings} options={{ headerShown: true, title: 'Settings' }} />
    <Stack.Screen name="SOS" component={SOS} options={{ headerShown: true, title: 'Emergency' }} />
  </>);
  return <Stack.Navigator screenOptions={hdr}>{screens}</Stack.Navigator>;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer theme={theme}><Root /></NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
