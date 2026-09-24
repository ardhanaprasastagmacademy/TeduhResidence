// js/firebase.js — Teduh Residence
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth }    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const firebaseConfig = {
  apiKey:            "AIzaSyBkqr1-MiVdeuA3MCFzK5Tdlhlef2k8tcw",
  authDomain:        "teduh-stay.firebaseapp.com",
  projectId:         "teduh-stay",
  storageBucket:     "teduh-stay.firebasestorage.app",
  messagingSenderId: "47654501222",
  appId:             "1:47654501222:web:04b258fa3e45bc63e466a7",
};

const app = initializeApp(firebaseConfig);

// Inisialisasi Firestore dengan IndexedDB Persistent Cache untuk akses super cepat (<10ms)
let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
} catch (e) {
  // Fallback standar jika browser membatasi persistent cache
  console.warn("Persistent cache init fallback:", e);
  firestoreDb = initializeFirestore(app, {});
}

export const db      = firestoreDb;
export const auth    = getAuth(app);
export const storage = getStorage(app);
export default app;
