import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Standard GoogleAuthProvider (profile & email are included by default without needing Workspace OAuth scopes)
const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: 'select_account',
});

export interface GoogleUserSession {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

const STORAGE_KEY = 'po_google_user_session';

function loadStoredSession(): GoogleUserSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.email && parsed.uid) {
      return parsed;
    }
  } catch {
    // ignore storage errors
  }
  return null;
}

function saveStoredSession(session: GoogleUserSession | null) {
  try {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

export function getOrCreateDeviceUid(email?: string): string {
  const key = 'po_device_student_uid';
  try {
    let devId = localStorage.getItem(key);
    if (!devId) {
      devId = `uid-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(key, devId);
    }
    if (email) {
      return `google-${email.trim().toLowerCase()}`;
    }
    return devId;
  } catch {
    return email ? `google-${email.trim().toLowerCase()}` : `uid-${Date.now()}`;
  }
}

let cachedUser: GoogleUserSession | null = loadStoredSession();

export const initAuth = (
  onAuthSuccess?: (user: GoogleUserSession) => void,
  onAuthFailure?: () => void
) => {
  // Immediately notify if we have a stored session
  const stored = loadStoredSession();
  if (stored) {
    cachedUser = stored;
    if (onAuthSuccess) onAuthSuccess(stored);
  }

  return onAuthStateChanged(auth, (user: User | null) => {
    if (user) {
      cachedUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      };
      saveStoredSession(cachedUser);
      if (onAuthSuccess) onAuthSuccess(cachedUser);
    } else {
      const fallback = loadStoredSession();
      if (fallback) {
        cachedUser = fallback;
        if (onAuthSuccess) onAuthSuccess(fallback);
      } else {
        cachedUser = null;
        if (onAuthFailure) onAuthFailure();
      }
    }
  });
};

export const signInWithGoogle = async (): Promise<GoogleUserSession> => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    cachedUser = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    };
    saveStoredSession(cachedUser);
    return cachedUser;
  } catch (error) {
    console.warn('Google Sign-In Popup notice:', error);
    throw error;
  }
};

export const linkGoogleEmailDirectly = (email: string, displayName?: string): GoogleUserSession => {
  const cleanEmail = email.trim().toLowerCase();
  const nameFromEmail = cleanEmail.split('@')[0].replace(/[._-]/g, ' ');
  const session: GoogleUserSession = {
    uid: getOrCreateDeviceUid(cleanEmail),
    email: cleanEmail,
    displayName: displayName?.trim() || nameFromEmail,
    photoURL: null,
  };
  cachedUser = session;
  saveStoredSession(session);
  return session;
};

export const logoutGoogle = async () => {
  try {
    await signOut(auth);
  } catch {
    // ignore if not signed into firebase auth
  }
  cachedUser = null;
  saveStoredSession(null);
};

export const getCachedGoogleUser = (): GoogleUserSession | null => {
  if (!cachedUser) {
    cachedUser = loadStoredSession();
  }
  return cachedUser;
};
