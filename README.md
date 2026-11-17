# GO KAKUMA

Boda boda ride-request app for Kakuma. One Expo (React Native) codebase for **Android, iOS and web**.
Black and orange theme, Google sign-in, passenger fare offers, rider accept/reject, safety features.

## Features
Passenger: register or continue with Google, phone + short bio, location permission, profile photo
(gallery permission asked once), request a ride with a fare offer, raise the offer if rejected,
rider info, Share My Trip, SOS (hold 3 s, texts trusted contact), report a problem, rate the rider, trip history.
Rider: onboarding (ID type, ID photo, plate, licence), pending approval, online toggle, incoming requests
(Accept/Reject, nearby filter 5 km), arrived / start / complete, rate the passenger, earnings, profile.

## Setup
1. `npm install` then `npx expo install --fix` (aligns package versions with your Expo SDK).
2. Create a Firebase project: enable **Authentication** (Google + Email/Password), **Firestore**, **Storage**.
3. Copy `.env.example` to `.env` and fill the Firebase keys and the three Google OAuth client IDs
   (Web, Android, iOS) from Google Cloud Console. Set the redirect scheme `gokakuma` for the native clients.
4. Deploy `firestore.rules` (Firebase console or `firebase deploy --only firestore:rules`).
5. Run: `npx expo start` (press `a`, `i` or `w`). Google sign-in on a device needs a dev build:
   `npx expo run:android` / `npx expo run:ios`.
6. Maps: add a Google Maps API key in `app.json` (`android.config.googleMaps.apiKey`). iOS uses Apple Maps. On the web the map is a link to Google Maps.
7. Admin: sign up normally, then set `role` to `admin` on your `users/{uid}` document in Firestore. That account opens the
   **Rider approvals** screen: it lists pending riders with their ID and licence photos and Approve / Reject buttons.

## Deploy the web app to Vercel
1. In Vercel, set the project **Root Directory** to `go-kakuma` (the folder containing this `package.json`).
2. Use `npm run build` as the build command and `dist` as the output directory. `vercel.json` contains these settings.
3. Add the six `EXPO_PUBLIC_FIREBASE_*` values from `.env` to the Vercel project's Environment Variables for Production (and Preview if needed), then redeploy. Do not commit `.env`; Expo embeds these public Firebase configuration values in the web bundle.
4. In Firebase Console, add `gokakuma.org` and `www.gokakuma.org` under Authentication → Settings → Authorized domains. Ensure Google is enabled under Authentication → Sign-in method.
5. In Google Cloud Console, make sure the OAuth web client used by Firebase has `https://gokakuma-pro.firebaseapp.com/__/auth/handler` as an authorized redirect URI. The web app uses Firebase's popup flow; add `https://www.gokakuma.org` and `https://gokakuma.org` as authorized JavaScript origins if required by the OAuth client.

## Added in this version
- Map on the request and ride screens (your pickup, and the rider moving toward you).
- Error and empty states: no connection, no riders nearby (after 60 s), offer not accepted, location off, photo access off.
- Admin rider approvals screen and tighter user rules (nobody can approve themselves or change their own role).

## Not done yet (be honest before launch)
- Real blur / face detection in `src/services/photo.js` (`checkPhoto` only checks size).
- Typed-in addresses are not geocoded, so there is no destination pin or route line; nearby riders use a simple 5 km filter (use geohash queries for scale).
- Push notifications and Cloud Functions to protect ride updates (ride rules are still permissive).
- Not tested on a device: written without running it. Expect to fix small issues on first run.
