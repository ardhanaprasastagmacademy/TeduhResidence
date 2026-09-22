// js/firebase.js — Teduh Residence
// Firebase init. Ganti konfigurasi di bawah dengan project Firebase Anda.
// TODO: Isi dengan konfigurasi dari Firebase Console > Project Settings > Your apps

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore }   from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth }        from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey:            "AIzaSyBkqr1-MiVdeuA3MCFzK5Tdlhlef2k8tcw",
  authDomain:        "teduh-stay.firebaseapp.com",
  projectId:         "teduh-stay",
  storageBucket:     "teduh-stay.firebasestorage.app",
  messagingSenderId: "47654501222",
  appId:             "1:47654501222:web:04b258fa3e45bc63e466a7",
};

const app = initializeApp(firebaseConfig);

export const db   = getFirestore(app);
export const auth = getAuth(app);
export default app;
