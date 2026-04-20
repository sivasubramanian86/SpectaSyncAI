/**
 * @file HeaderFull.test.tsx
 * @description Comprehensive unit tests for the Header component including Firebase auth flows.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Header } from '../components/Header';
import * as firebase from '../firebase';

// Mock variables must start with 'mock'
const { mockFirebase } = vi.hoisted(() => ({
  mockFirebase: {
    isFirebaseConfigured: true,
  }
}));

// Mock firebase
vi.mock('../firebase', () => ({
  get isFirebaseConfigured() { return mockFirebase.isFirebaseConfigured; },
  signInWithGoogle: vi.fn(),
  signOutUser: vi.fn(),
  subscribeToAuthState: vi.fn((cb) => {
    // Start with null user
    cb(null);
    return () => {};
  }),
}));

describe('Header Component Coverage', () => {
  const lastUpdated = new Date();
  const onTabChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockFirebase.isFirebaseConfigured = true;
  });

  it('handles sign-in flow', async () => {
    const signInMock = vi.mocked(firebase.signInWithGoogle);
    signInMock.mockResolvedValueOnce({ user: { email: 'test@example.com' } } as any);

    render(<Header lastUpdated={lastUpdated} isLive={true} activeTab="dashboard" onTabChange={onTabChange} />);
    
    const signInBtn = screen.getByText('Continue with Google');
    fireEvent.click(signInBtn);
    
    expect(screen.getByText('Connecting...')).toBeInTheDocument();
    expect(signInMock).toHaveBeenCalled();
    
    await waitFor(() => expect(screen.queryByText('Connecting...')).not.toBeInTheDocument());
  });

  it('handles sign-out flow', async () => {
    const signOutMock = vi.mocked(firebase.signOutUser);
    signOutMock.mockResolvedValueOnce();

    // Mock an active user
    vi.mocked(firebase.subscribeToAuthState).mockImplementationOnce((cb: any) => {
      cb({ email: 'active@user.com' });
      return () => {};
    });

    render(<Header lastUpdated={lastUpdated} isLive={true} activeTab="dashboard" onTabChange={onTabChange} />);
    
    const signOutBtn = screen.getByText('Sign out');
    fireEvent.click(signOutBtn);
    expect(signOutMock).toHaveBeenCalled();
  });

  it('handles sign-in error', async () => {
    const signInMock = vi.mocked(firebase.signInWithGoogle);
    signInMock.mockRejectedValueOnce(new Error('Auth error'));
    
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<Header lastUpdated={lastUpdated} isLive={true} activeTab="dashboard" onTabChange={onTabChange} />);
    
    fireEvent.click(screen.getByText('Continue with Google'));
    await waitFor(() => expect(spy).toHaveBeenCalledWith('Google sign-in failed:', expect.anything()));
    spy.mockRestore();
  });

  it('handles sign-out error', async () => {
    const signOutMock = vi.mocked(firebase.signOutUser);
    signOutMock.mockRejectedValueOnce(new Error('Sign out error'));
    
    // Mock an active user
    vi.mocked(firebase.subscribeToAuthState).mockImplementationOnce((cb: any) => {
      cb({ displayName: 'Dev User' });
      return () => {};
    });

    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<Header lastUpdated={lastUpdated} isLive={true} activeTab="dashboard" onTabChange={onTabChange} />);
    
    fireEvent.click(screen.getByText('Sign out'));
    await waitFor(() => expect(spy).toHaveBeenCalledWith('Firebase sign-out failed:', expect.anything()));
    spy.mockRestore();
  });

  it('handles sign-in when firebase is disabled (Line 43)', async () => {
     mockFirebase.isFirebaseConfigured = false;
     render(<Header lastUpdated={lastUpdated} isLive={true} activeTab="dashboard" onTabChange={onTabChange} />);
     
     const signInBtn = screen.getByText('Firebase disabled');
     await fireEvent.click(signInBtn); // This triggers handleGoogleSignIn
     expect(firebase.signInWithGoogle).not.toHaveBeenCalled();
  });
});
