import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../firebase';

export const fetchCertificates = async (uid, admin = false) => {
  const base = collection(db, 'certificates');
  const q = admin
    ? query(base, orderBy('createdAt', 'desc'))
    : query(base, where('uid', '==', uid), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((item) => ({ id: item.id, ...item.data() }));
};

export const createCertificate = async (payload, file) => {
  let proofUrl = '';
  let proofPath = '';
  if (file) {
    proofPath = `certificates/${payload.uid}/${Date.now()}-${file.name}`;
    const snapshot = await uploadBytes(ref(storage, proofPath), file);
    proofUrl = await getDownloadURL(snapshot.ref);
  }

  await addDoc(collection(db, 'certificates'), {
    ...payload,
    proofUrl,
    proofPath,
    verified: false,
    createdAt: serverTimestamp(),
  });
};

export const updateCertificate = async (id, values, file) => {
  const updatePayload = { ...values };
  if (file) {
    const proofPath = `certificates/${values.uid}/${Date.now()}-${file.name}`;
    const snapshot = await uploadBytes(ref(storage, proofPath), file);
    updatePayload.proofUrl = await getDownloadURL(snapshot.ref);
    updatePayload.proofPath = proofPath;
  }
  await updateDoc(doc(db, 'certificates', id), updatePayload);
};

export const removeCertificate = async ({ id, proofPath }) => {
  await deleteDoc(doc(db, 'certificates', id));
  if (proofPath) {
    try {
      await deleteObject(ref(storage, proofPath));
    } catch {
      // ignore deletion mismatch
    }
  }
};
