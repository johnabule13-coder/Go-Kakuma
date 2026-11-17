import { Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

const ASKED = 'galleryPermissionAsked';

// Asks for gallery permission ONCE. Later calls go straight to the gallery.
export async function pickPhoto() {
  const current = await ImagePicker.getMediaLibraryPermissionsAsync();
  if (!current.granted) {
    if (await AsyncStorage.getItem(ASKED)) {
      return { denied: true };
    }
    await AsyncStorage.setItem(ASKED, '1');
    const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!res.granted) return { denied: true };
  }
  const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.7 });
  return r.canceled ? null : r.assets[0];
}
export async function takePhoto() {
  const p = await ImagePicker.requestCameraPermissionsAsync();
  if (!p.granted) return null;
  const r = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7, cameraType: ImagePicker.CameraType.front });
  return r.canceled ? null : r.assets[0];
}
// TODO: replace with real blur + face detection (e.g. ML Kit through a native module). This only checks size.
export async function checkPhoto(asset) {
  const issues = [];
  if (asset.width < 300 || asset.height < 300) issues.push('Photo is too small or blurry');
  return { ok: issues.length === 0, issues };
}
export async function uploadPhoto(uid, asset, name = 'profile.jpg') {
  const blob = await (await fetch(asset.uri)).blob();
  const r = ref(storage, `users/${uid}/${name}`);
  await uploadBytes(r, blob);
  return getDownloadURL(r);
}
