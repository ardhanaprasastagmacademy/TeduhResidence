// js/galeri.js — Teduh Residence
// Galeri foto dinamis terintegrasi real-time dengan Firestore Database

import { db } from './firebase.js';
import {
  collection, query, onSnapshot, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

(function () {
  'use strict';

  const grid       = document.getElementById('gallery-grid');
  const emptyState = document.getElementById('gallery-empty');
  if (!grid) return;

  let allGalleryPhotos = [];
  let currentCategory  = 'all';

  // Render semua foto ke dalam masonry grid
  function renderGallery() {
    let filtered = allGalleryPhotos;

    if (currentCategory !== 'all') {
      filtered = filtered.filter(p => (p.category || '').toLowerCase() === currentCategory);
    }

    if (filtered.length === 0) {
      grid.innerHTML = '';
      emptyState?.classList.remove('d-none');
      return;
    }

    emptyState?.classList.add('d-none');
    grid.innerHTML = filtered.map(item => `
      <div class="masonry-item reveal revealed" data-category="${item.category || 'galeri'}">
        <img src="${item.imageUrl}" alt="${item.title || 'Foto Galeri Teduh Residence'}" loading="lazy" />
        <div class="masonry-overlay p-3 d-flex flex-column justify-content-end position-absolute inset-0"
             style="background: linear-gradient(to top, rgba(14, 59, 58, 0.75) 0%, transparent 60%); opacity: 0; transition: opacity .3s ease; inset: 0;">
          <span class="badge bg-cream-100 text-teal-900 align-self-start mb-1" style="font-size:0.68rem; font-weight:600; text-transform:capitalize;">
            ${item.category || 'Galeri'}
          </span>
          <h6 class="text-white mb-0" style="font-size: 0.95rem; font-weight: 500;">
            ${item.title || 'Teduh Residence'}
          </h6>
        </div>
      </div>
    `).join('');

    // Tambahkan hover effect untuk overlay
    document.querySelectorAll('.masonry-item').forEach(item => {
      const overlay = item.querySelector('.masonry-overlay');
      if (overlay) {
        item.addEventListener('mouseenter', () => overlay.style.opacity = '1');
        item.addEventListener('mouseleave', () => overlay.style.opacity = '0');
      }
    });
  }

  // Filter tombol kategori
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('btn-primary', 'active');
        b.classList.add('btn-outline-primary');
      });
      btn.classList.add('btn-primary', 'active');
      btn.classList.remove('btn-outline-primary');
      currentCategory = btn.dataset.category || 'all';
      renderGallery();
    });
  });

  // ── Ambil Data Galeri Real-Time dari Firestore ──
  try {
    const qGallery = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
    onSnapshot(qGallery, (snap) => {
      if (!snap.empty) {
        allGalleryPhotos = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderGallery();
      } else {
        // Jika koleksi gallery khusus masih kosong, otomatis tampilkan foto dari koleksi rooms
        fetchRoomPhotosFallback();
      }
    }, (err) => {
      console.warn('Gallery snapshot error, fetching room photos:', err);
      fetchRoomPhotosFallback();
    });
  } catch (e) {
    console.error('Gallery init error:', e);
    fetchRoomPhotosFallback();
  }

  // Fallback otomatis mengambil foto kamar jika galeri utama belum diinput oleh admin
  function fetchRoomPhotosFallback() {
    try {
      const qRooms = query(collection(db, 'rooms'), orderBy('name'));
      onSnapshot(qRooms, (snap) => {
        const roomPhotos = [];
        snap.docs.forEach(doc => {
          const data = doc.data();
          if (Array.isArray(data.images)) {
            data.images.forEach((imgUrl, idx) => {
              roomPhotos.push({
                id: `${doc.id}_${idx}`,
                title: `${data.name} ${idx > 0 ? `(Foto ${idx + 1})` : ''}`,
                category: 'kamar',
                imageUrl: imgUrl
              });
            });
          }
        });

        if (roomPhotos.length > 0) {
          allGalleryPhotos = roomPhotos;
          renderGallery();
        } else {
          allGalleryPhotos = [];
          renderGallery();
        }
      });
    } catch (e) {
      console.warn('Room photos fallback error:', e);
    }
  }

})();
