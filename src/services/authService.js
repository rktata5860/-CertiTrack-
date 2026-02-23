import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider, ADMIN_EMAILS } from '../firebase';

const deriveRole = (email, existingRole = 'user') => {
  if (ADMIN_EMAILS.includes((email || '').toLowerCase())) return 'admin';
  return existingRole;
};

export const ensureUserProfile = async (firebaseUser) => {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    const role = deriveRole(firebaseUser.email, 'user');
    const payload = {
      email: firebaseUser.email || '',
      name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
      role,
      createdAt: serverTimestamp(),
    };
    await setDoc(userRef, payload);
    return payload;
  }

  const data = snap.data();
  const role = deriveRole(firebaseUser.email, data.role);
  if (role !== data.role) await updateDoc(userRef, { role });
  return { ...data, role };
};

export const signupEmail = async ({ name, email, password }) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (name) await updateProfile(cred.user, { displayName: name });
  const profile = await ensureUserProfile({ ...cred.user, displayName: name || cred.user.displayName });
  return { user: cred.user, profile };
};

export const loginEmail = async ({ email, password }) => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const profile = await ensureUserProfile(cred.user);
  return { user: cred.user, profile };
};

export const loginGoogle = async () => {
  const cred = await signInWithPopup(auth, googleProvider);
  const profile = await ensureUserProfile(cred.user);
  return { user: cred.user, profile };
};

export const logoutUser = () => signOut(auth);
