import { describe, it, expect, vi, beforeEach } from 'vitest';

// Hoisted mocks for the Firebase SDKs to prevent Node.js environment errors
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
  getApps: vi.fn(() => []),
  getApp: vi.fn(() => ({})),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  onAuthStateChanged: vi.fn((_auth, cb) => {
      // Simulate immediate callback for coverage
      cb(null);
      return () => {};
  }),
  signInWithPopup: vi.fn().mockResolvedValue({ user: {} }),
  signOut: vi.fn().mockResolvedValue(undefined),
  GoogleAuthProvider: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
}));

describe('Firebase Module Logic', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('exercises branch logic when auth is available', async () => {
    // Import the module (dependencies are mocked)
    const firebase = await import('../firebase');
    
    const callback = vi.fn();
    firebase.subscribeToAuthState(callback);
    expect(callback).toHaveBeenCalled();

    await firebase.signInWithGoogle();
    await firebase.signOutUser();
    
    expect(firebase.isFirebaseConfigured).toBeDefined();
  });

  it('exercises branch logic when auth is null (No-op mode)', async () => {
    // To hit the "if (!auth)" branches, we need to re-import the module 
    // but this time ensure 'isConfigured' is false or 'auth' remains null.
    // Since we mocked 'getAuth' above, we can make it return null here
    const { getAuth } = await import('firebase/auth');
    vi.mocked(getAuth).mockReturnValueOnce(null as any);
    
    // Stub environment to force isConfigured to false
    vi.stubEnv('VITE_FIREBASE_API_KEY', '');
    vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', '');
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', '');
    vi.stubEnv('VITE_FIREBASE_APP_ID', '');
    
    const firebase = await import('../firebase');
    
    const callback = vi.fn();
    firebase.subscribeToAuthState(callback);
    expect(callback).toHaveBeenCalledWith(null);

    const result = await firebase.signInWithGoogle();
    expect(result).toBeNull();

    await firebase.signOutUser(); // should just return
  });

  it('uses existing app if getApps().length > 0 (Line 68)', async () => {
    vi.resetModules();
    const { getApps, getApp } = await import('firebase/app');
    
    // Inject directly into runtime config to bypass import.meta.env issues in some CI environments
    // @ts-ignore
    global.window.__SPECTASYNC_RUNTIME__ = {
      firebase: {
        apiKey: 'x',
        authDomain: 'x',
        projectId: 'x',
        appId: 'x'
      }
    };

    vi.mocked(getApps).mockReturnValue([{} as any]);
    
    await import('../firebase');
    expect(getApp).toHaveBeenCalled();
    
    // Cleanup
    // @ts-ignore
    delete global.window.__SPECTASYNC_RUNTIME__;
  });

  it('handles undefined window (Line 48)', async () => {
    const originalWindow = global.window;
    // @ts-ignore
    delete global.window;
    
    vi.resetModules();
    const fb = await import('../firebase');
    expect(fb).toBeDefined();
    
    global.window = originalWindow;
  });
});
