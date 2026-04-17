/**
 * SpectaSyncAI: Firebase Integration Hook
 * @09_frontend_gui_architect | @10_security_governance
 * 
 * Provides foundation for Real-time Signal Sync and Operator Auth.
 */
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Integration targets for Hackathon Demo
const firebaseConfig = {
  apiKey: "AIzaSy_MOCK_KEY_FOR_DEMO_PURPOSES",
  authDomain: "spectasync-ai.firebaseapp.com",
  projectId: "spectasync-ai",
  storageBucket: "spectasync-ai.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Toggle for live vs mock
const useLiveFirebase = false;

let app;
let auth;
let db;

try {
  if (useLiveFirebase) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("[Firebase] Production sync active.");
  } else {
    console.info("[Firebase] Running in Virtual Sandbox mode.");
  }
} catch (error) {
  console.warn("[Firebase] Initialization skipped in local dev.", error);
}

export { auth, db };
