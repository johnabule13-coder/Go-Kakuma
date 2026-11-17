import { collection, addDoc, doc, updateDoc, runTransaction, serverTimestamp, arrayUnion, increment, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';

export const createRide = (p, data) => addDoc(collection(db, 'rides'), {
  passengerId: p.uid, passengerName: p.name, passengerPhoto: p.photoURL || null,
  ...data, status: 'requested', rejectedBy: [], createdAt: serverTimestamp(),
});
export const watchRide = (id, cb) => onSnapshot(doc(db, 'rides', id), s => cb(s.exists() ? { id: s.id, ...s.data() } : null));
export const watchRequests = cb => onSnapshot(query(collection(db, 'rides'), where('status', '==', 'requested')),
  s => cb(s.docs.map(d => ({ id: d.id, ...d.data() }))));
export const setStatus = (id, status) => updateDoc(doc(db, 'rides', id), { status, [`${status}At`]: serverTimestamp() });
export const raiseFare = (id, fare) => updateDoc(doc(db, 'rides', id), { fare, status: 'requested', rejectedBy: [] });
export const rejectRide = (id, uid) => updateDoc(doc(db, 'rides', id), { rejectedBy: arrayUnion(uid) });
export const acceptRide = (id, rider) => runTransaction(db, async tx => {
  const r = doc(db, 'rides', id), s = await tx.get(r);
  if (!s.exists() || s.data().status !== 'requested') throw new Error('This request is no longer available.');
  tx.update(r, { status: 'accepted', riderId: rider.uid, riderName: rider.name, riderPhoto: rider.photoURL || null,
    riderPlate: rider.plate || '', riderVehicle: rider.vehicle || '',
    riderRating: rider.ratingCount ? +(rider.ratingSum / rider.ratingCount).toFixed(1) : null, acceptedAt: serverTimestamp() });
});
// role 'passenger' rates the rider; role 'rider' rates the passenger
export async function rate(ride, role, stars) {
  const given = role === 'passenger' ? 'riderRatingGiven' : 'passengerRatingGiven';
  const target = role === 'passenger' ? ride.riderId : ride.passengerId;
  await updateDoc(doc(db, 'rides', ride.id), { [given]: stars });
  await updateDoc(doc(db, 'users', target), { ratingSum: increment(stars), ratingCount: increment(1) });
}
export const watchMyRides = (uid, field, cb) => onSnapshot(query(collection(db, 'rides'), where(field, '==', uid)),
  s => cb(s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))));

export const retryRide = id => updateDoc(doc(db, 'rides', id), { status: 'requested', rejectedBy: [], createdAt: serverTimestamp() });
export const updateRiderLocation = (id, loc) => updateDoc(doc(db, 'rides', id), { riderLocation: loc });
