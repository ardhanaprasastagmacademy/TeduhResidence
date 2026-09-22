// js/ruangan.js — Teduh Residence
// Load kamar dari Firestore dan render ke halaman Ruangan.
// Jika Firestore belum dikonfigurasi, halaman statis tetap berfungsi.

import { db } from './firebase.js';
import {
  collection, query, where, onSnapshot, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

(function () {
  'use strict';

  const grid    = document.getElementById('rooms-grid');
  const loading = document.getElementById('rooms-loading');
  if (!grid) return;

  // Foto fallback per kamar (jika tidak ada di Firestore)
  const fallbackImages = {
    'Kamar Deluxe':   'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=700&q=80&auto=format&fit=crop',
    'Kamar Superior': 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=700&q=80&auto=format&fit=crop',
    'Suite Keluarga': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=700&q=80&auto=format&fit=crop',
    'Kamar Standar':  'https://images.unsplash.com/photo-1455587734955-081b22074882?w=700&q=80&auto=format&fit=crop',
  };

  const modalMap = {
    'Kamar Deluxe': '#modalDeluxe',
    'Kamar Superior': '#modalSuperior',
    'Suite Keluarga': '#modalSuite',
    'Kamar Standar': '#modalStandar',
  };

  function renderRoom(room) {
    const img = (room.images && room.images[0])
      ? room.images[0]
      : (fallbackImages[room.name] || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=700&q=80');

    const facilities = Array.isArray(room.facilities)
      ? room.facilities.slice(0, 4).map(f => `<span>${f}</span>`).join('')
      : '<span>AC</span><span>Wi-Fi</span>';

    const modalTarget = modalMap[room.name] || '#modalDeluxe';
    const available = room.isAvailable !== false;
    const bookingBtn = available
      ? `<a href="booking.html?name=${encodeURIComponent(room.name)}&price=${room.pricePerNight}" class="btn btn-primary btn-sm flex-grow-1 text-center">Booking</a>`
      : `<button class="btn btn-outline-primary btn-sm flex-grow-1" disabled>Tidak Tersedia</button>`;

    return `
      <div class="col-md-6 col-lg-4 reveal">
        <div class="card h-100">
          <div class="card-img-wrapper ratio-4x3">
            <img src="${img}" alt="${room.name}" loading="lazy" />
            <span class="price-badge">Rp ${Number(room.pricePerNight).toLocaleString('id-ID')} / malam</span>
          </div>
          <div class="card-body d-flex flex-column">
            <h4 class="mb-1">${room.name}</h4>
            <p class="facilities-list mb-2">${facilities}</p>
            <p class="text-ink-muted mb-3" style="font-size:.875rem;">${room.capacity} tamu</p>
            <p class="text-ink-muted mb-4" style="font-size:.875rem;flex-grow:1;">${room.description || ''}</p>
            <div class="d-flex gap-2 mt-auto">
              ${bookingBtn}
              <button type="button" class="btn btn-outline-primary btn-sm" data-bs-toggle="modal" data-bs-target="${modalTarget}">Detail Fasilitas</button>
            </div>
          </div>
        </div>
      </div>`;
  }

  // Coba load dari Firestore
  try {
    const q = query(collection(db, 'rooms'), orderBy('name'));
    loading?.style.setProperty('display', 'flex');

    onSnapshot(q, (snap) => {
      loading?.style.setProperty('display', 'none');
      if (snap.empty) return; // biarkan konten statis tampil

      // Jika Firestore punya data, timpa grid
      grid.innerHTML = '';
      snap.forEach(doc => {
        grid.innerHTML += renderRoom({ id: doc.id, ...doc.data() });
      });

      // Aktifkan reveal untuk elemen baru
      document.querySelectorAll('.reveal:not(.revealed)').forEach((el, i) => {
        el.style.transitionDelay = `${(i % 3) * 80}ms`;
        setTimeout(() => el.classList.add('revealed'), 50);
      });
    }, (err) => {
      // Firebase belum dikonfigurasi — biarkan konten statis tampil
      console.info('Firestore tidak tersedia, menggunakan konten statis.', err.code);
      loading?.style.setProperty('display', 'none');
    });
  } catch (e) {
    loading?.style.setProperty('display', 'none');
  }

})();
