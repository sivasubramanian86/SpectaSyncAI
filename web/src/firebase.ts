/**
 * SpectaSyncAI: Firebase Integration Hook
 * @09_frontend_gui_architect | @10_security_governance
 *
 * Firebase is opt-in through VITE_FIREBASE_* environment variables.
 * When configured, the app exposes real Auth/Firestore handles; otherwise
 * it falls back to a safe no-op mode for local development.
 */

import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

type FirebaseEnv = Record<string, string | undefined>;

const env = (import.meta as ImportMeta & { env: FirebaseEnv }).env;

type RuntimeFirebaseConfig = {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
  databaseURL?: string;
};

type SpectaSyncRuntimeConfig = {
  firebase?: RuntimeFirebaseConfig;
  firebaseConfigured?: boolean;
};

declare global {
  interface Window {
    __SPECTASYNC_RUNTIME__?: SpectaSyncRuntimeConfig;
  }
}

const runtimeConfig = typeof window !== 'undefined' ? window.__SPECTASYNC_RUNTIME__ : undefined;

const firebaseConfig = {
  apiKey: runtimeConfig?.firebase?.apiKey ?? env.VITE_FIREBASE_API_KEY,
  authDomain: runtimeConfig?.firebase?.authDomain ?? env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: runtimeConfig?.firebase?.projectId ?? env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: runtimeConfig?.firebase?.storageBucket ?? env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: runtimeConfig?.firebase?.messagingSenderId ?? env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: runtimeConfig?.firebase?.appId ?? env.VITE_FIREBASE_APP_ID,
  measurementId: runtimeConfig?.firebase?.measurementId ?? env.VITE_FIREBASE_MEASUREMENT_ID,
  databaseURL: runtimeConfig?.firebase?.databaseURL ?? env.VITE_FIREBASE_DATABASE_URL,
};

const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isConfigured) {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
}

export const useLiveFirebase = isConfigured;
export const isFirebaseConfigured = isConfigured;
export { auth, db, app, googleProvider };

export function subscribeToAuthState(callback: (user: User | null) => void) {
  if (!auth) {
    callback(null);
    return () => undefined;
  }

  return onAuthStateChanged(auth, callback);
}

export async function signInWithGoogle() {
  if (!auth || !googleProvider) {
    return null;
  }
  return signInWithPopup(auth, googleProvider);
}

export async function signOutUser() {
  if (!auth) {
    return;
  }
  await signOut(auth);
}
