// js/ruangan.js — Teduh Residence
// Load kamar secara instan (0ms) + sinkronisasi real-time Firestore & limit 3 booking

import { db } from './firebase.js';
import {
  collection, query, onSnapshot, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

(function () {
  'use strict';

  const grid       = document.getElementById('rooms-grid');
  const emptyState = document.getElementById('rooms-empty');
  if (!grid) return;

  const DEFAULT_MAX_BOOKINGS = 3;

  // State Kamar & Booking (Semua murni dari Database Firestore)
  let loadedRooms = [];
  let confirmedBookings = [];
  let isRoomsLoaded = false;

  // Helper untuk menentukan icon fasilitas
  function getFacilityIcon(facilityName) {
    const f = facilityName.toLowerCase();
    if (f.includes('ac') || f.includes('dingin')) return 'bi-snow';
    if (f.includes('wifi') || f.includes('wi-fi') || f.includes('internet')) return 'bi-wifi';
    if (f.includes('sarapan') || f.includes('makan') || f.includes('breakfast')) return 'bi-cup-hot';
    if (f.includes('tv') || f.includes('televisi')) return 'bi-tv';
    if (f.includes('mandi') || f.includes('shower') || f.includes('air panas')) return 'bi-droplet';
    if (f.includes('kipas') || f.includes('fan')) return 'bi-fan';
    if (f.includes('meja') || f.includes('kerja')) return 'bi-laptop';
    if (f.includes('lemari') || f.includes('wardrobe')) return 'bi-archive';
    if (f.includes('kopi') || f.includes('teh') || f.includes('tea')) return 'bi-cup-straw';
    if (f.includes('taman') || f.includes('pemandangan')) return 'bi-tree';
    if (f.includes('duduk') || f.includes('living')) return 'bi-house-door';
    return 'bi-check2-circle';
  }

  // Hitung jumlah booking dikonfirmasi untuk suatu kamar
  function getConfirmedCount(room) {
    return confirmedBookings.filter(b => 
      (b.roomId && b.roomId === room.id) ||
      (b.roomName && b.roomName.toLowerCase() === room.name.toLowerCase())
    ).length;
  }

  // Render grid seluruh kamar langsung dari database
  function renderAllRooms() {
    if (loadedRooms.length === 0) {
      grid.innerHTML = '';
      emptyState?.classList.remove('d-none');
      return;
    }

    emptyState?.classList.add('d-none');
    grid.innerHTML = loadedRooms.map(room => renderRoomCard(room)).join('');
  }

  // Render satu card kamar di grid
  function renderRoomCard(room) {
    const images = Array.isArray(room.images) && room.images.length > 0 ? room.images : [];
    const mainImg = images[0] || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=700&q=80&auto=format&fit=crop';
    const photoCount = images.length;

    const maxLimit = parseInt(room.maxBookings) || DEFAULT_MAX_BOOKINGS;
    const confirmedCount = getConfirmedCount(room);
    const isQuotaFull = confirmedCount >= maxLimit;
    const isAvailable = room.isAvailable !== false && !isQuotaFull;

    const facilitiesHtml = (Array.isArray(room.facilities) && room.facilities.length > 0)
      ? room.facilities.slice(0, 4).map(f => `<span>${f}</span>`).join('')
      : '<span>AC</span><span>Wi-Fi</span><span>K. Mandi Dalam</span>';

    const bookingUrl = `booking.html?id=${encodeURIComponent(room.id)}&name=${encodeURIComponent(room.name)}&price=${room.pricePerNight}`;

    let statusBadge = '';
    let bookingBtn = '';

    if (isQuotaFull) {
      statusBadge = `
        <span class="badge bg-danger position-absolute top-0 end-0 m-2 px-2 py-1 shadow-sm" style="font-size:0.75rem;border-radius:var(--radius-sm);">
          <i class="bi bi-x-circle me-1"></i>Penuh (${confirmedCount}/${maxLimit} Booking)
        </span>`;
      bookingBtn = `
        <button class="btn btn-outline-primary btn-sm flex-grow-1" disabled style="opacity:0.65;cursor:not-allowed;" title="Kamar sudah mencapai kuota maksimal">
          Kamar Penuh
        </button>`;
    } else if (room.isAvailable === false) {
      statusBadge = `
        <span class="badge bg-secondary position-absolute top-0 end-0 m-2 px-2 py-1 shadow-sm" style="font-size:0.75rem;border-radius:var(--radius-sm);">
          Tidak Tersedia
        </span>`;
      bookingBtn = `
        <button class="btn btn-outline-primary btn-sm flex-grow-1" disabled style="opacity:0.65;cursor:not-allowed;">
          Tidak Tersedia
        </button>`;
    } else {
      if (confirmedCount > 0) {
        statusBadge = `
          <span class="badge bg-warning text-dark position-absolute top-0 end-0 m-2 px-2 py-1 shadow-sm" style="font-size:0.72rem;border-radius:var(--radius-sm);">
            ${confirmedCount}/${maxLimit} Terisi
          </span>`;
      }
      bookingBtn = `<a href="${bookingUrl}" class="btn btn-primary btn-sm flex-grow-1 text-center">Booking</a>`;
    }

    return `
      <div class="col-md-6 col-lg-4">
        <div class="card h-100 shadow-sm" style="transition:transform .25s ease, box-shadow .25s ease;">
          <div class="card-img-wrapper ratio-4x3 position-relative overflow-hidden">
            <img src="${mainImg}" alt="${room.name} Teduh Residence" loading="lazy" style="width:100%;height:100%;object-fit:cover;" />
            <span class="price-badge">Rp ${Number(room.pricePerNight || 0).toLocaleString('id-ID')} / malam</span>
            ${photoCount > 1 ? `
              <span class="badge bg-dark bg-opacity-75 position-absolute bottom-0 start-0 m-2 px-2 py-1" style="font-size:0.75rem;backdrop-filter:blur(4px);border-radius:var(--radius-sm);">
                <i class="bi bi-camera me-1"></i>${photoCount} Foto
              </span>` : ''}
            ${statusBadge}
          </div>
          <div class="card-body d-flex flex-column p-4">
            <div class="d-flex justify-content-between align-items-start mb-1">
              <h4 class="mb-0" style="font-size:1.15rem;font-weight:600;">${room.name}</h4>
            </div>
            <p class="facilities-list my-2">${facilitiesHtml}</p>
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="text-ink-muted" style="font-size:.85rem;">
                <i class="bi bi-people me-1 text-primary"></i>Maks. ${room.capacity || 2} tamu
              </span>
              <span class="badge ${isQuotaFull ? 'bg-danger-subtle text-danger border border-danger-subtle' : 'bg-success-subtle text-success border border-success-subtle'}" style="font-size:0.72rem;">
                ${isQuotaFull ? `Penuh (${confirmedCount}/${maxLimit})` : `Tersedia (${confirmedCount}/${maxLimit} terisi)`}
              </span>
            </div>
            <p class="text-ink-muted mb-4" style="font-size:.875rem;flex-grow:1;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">
              ${room.description || 'Kamar nyaman dan bersih dengan fasilitas lengkap di Teduh Residence.'}
            </p>
            <div class="d-flex gap-2 mt-auto pt-2" style="border-top:1px solid var(--cream-200);">
              ${bookingBtn}
              <button type="button" class="btn btn-outline-primary btn-sm btn-room-detail" data-room-id="${room.id}" onclick="window.showRoomDetail('${room.id}')">
                Detail Fasilitas
              </button>
            </div>
          </div>
        </div>
      </div>`;
  }

  // Buka modal detail dinamis untuk kamar tertentu
  window.showRoomDetail = function (roomId) {
    if (!roomId) return;
    const room = loadedRooms.find(r => r.id === roomId || (r.name && r.name.toLowerCase() === roomId.toLowerCase()));
    if (!room) return;

    const modalContent = document.getElementById('roomDetailModalContent');
    const modalEl = document.getElementById('roomDetailModal');
    if (!modalContent || !modalEl) return;

    const images = Array.isArray(room.images) && room.images.length > 0
      ? room.images
      : ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=900&q=80&auto=format&fit=crop'];

    const maxLimit = parseInt(room.maxBookings) || DEFAULT_MAX_BOOKINGS;
    const confirmedCount = getConfirmedCount(room);
    const isQuotaFull = confirmedCount >= maxLimit;
    const isAvailable = room.isAvailable !== false && !isQuotaFull;
    const bookingUrl = `booking.html?id=${encodeURIComponent(room.id)}&name=${encodeURIComponent(room.name)}&price=${room.pricePerNight}`;

    // Gallery / Carousel HTML
    let galleryHtml = '';
    if (images.length === 1) {
      galleryHtml = `<img src="${images[0]}" alt="${room.name}" class="room-modal-img w-100 rounded-3 mb-4" style="aspect-ratio:16/9;object-fit:cover;" />`;
    } else {
      const carouselItems = images.map((img, idx) => `
        <div class="carousel-item ${idx === 0 ? 'active' : ''}">
          <img src="${img}" class="d-block w-100 rounded-3" alt="${room.name} Foto ${idx + 1}" style="aspect-ratio:16/9;object-fit:cover;" />
        </div>
      `).join('');

      const indicators = images.map((_, idx) => `
        <button type="button" data-bs-target="#carouselRoomModal" data-bs-slide-to="${idx}" class="${idx === 0 ? 'active' : ''}" aria-label="Slide ${idx + 1}"></button>
      `).join('');

      galleryHtml = `
        <div id="carouselRoomModal" class="carousel slide mb-4 rounded-3 overflow-hidden" data-bs-ride="carousel">
          <div class="carousel-indicators">${indicators}</div>
          <div class="carousel-inner">${carouselItems}</div>
          <button class="carousel-control-prev" type="button" data-bs-target="#carouselRoomModal" data-bs-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Sebelumnya</span>
          </button>
          <button class="carousel-control-next" type="button" data-bs-target="#carouselRoomModal" data-bs-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Selanjutnya</span>
          </button>
        </div>
      `;
    }

    // Facilities grid
    const facilitiesList = Array.isArray(room.facilities) && room.facilities.length > 0
      ? room.facilities
      : ['AC', 'Wi-Fi Cepat', 'Kamar Mandi Dalam', 'Air Panas', 'Perlengkapan Mandi'];

    const facilitiesGridHtml = facilitiesList.map(f => `
      <div class="amenity-item">
        <i class="bi ${getFacilityIcon(f)}"></i>
        <span>${f}</span>
      </div>
    `).join('');

    modalContent.innerHTML = `
      <div class="modal-header">
        <div>
          <span class="eyebrow mb-1">Teduh Residence</span>
          <h4 class="modal-title mb-0" id="roomDetailModalLabel">${room.name}</h4>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Tutup"></button>
      </div>
      <div class="modal-body p-4">
        ${galleryHtml}

        ${isQuotaFull ? `
          <div class="alert mb-4 p-3 d-flex align-items-center gap-3" style="background:#fdf2f2;border:1px solid #f8d7da;border-radius:var(--radius-md);color:#842029;">
            <i class="bi bi-exclamation-triangle-fill fs-4 text-danger flex-shrink-0"></i>
            <div>
              <strong class="d-block mb-1">Kamar Sudah Penuh</strong>
              <div style="font-size:0.875rem;">Kamar ini sudah mencapai batas kuota maksimal (<strong>${confirmedCount}/${maxLimit} booking dikonfirmasi</strong>). Silakan pilih tipe kamar lain yang masih tersedia.</div>
            </div>
          </div>
        ` : ''}

        <h5 class="modal-section-title">Deskripsi Kamar</h5>
        <p class="modal-desc-text">
          ${room.description || 'Kamar dirancang untuk memberikan kenyamanan optimal dengan suasana tenang, bersih, dan fasilitas lengkap untuk istirahat Anda di Kota Malang.'}
        </p>

        <h5 class="modal-section-title">Spesifikasi & Status Kuota</h5>
        <div class="room-spec-grid mb-4">
          <div class="room-spec-box">
            <i class="bi bi-people"></i>
            <span class="spec-label">Kapasitas</span>
            <span class="spec-val">${room.capacity || 2} Tamu</span>
          </div>
          <div class="room-spec-box">
            <i class="bi bi-tag"></i>
            <span class="spec-label">Harga/Malam</span>
            <span class="spec-val">Rp ${Number(room.pricePerNight || 0).toLocaleString('id-ID')}</span>
          </div>
          <div class="room-spec-box">
            <i class="bi bi-door-open"></i>
            <span class="spec-label">Status Kamar</span>
            <span class="spec-val ${isQuotaFull ? 'text-danger fw-bold' : 'text-success'}">${isQuotaFull ? 'Penuh' : (room.isAvailable !== false ? 'Tersedia' : 'Nonaktif')}</span>
          </div>
          <div class="room-spec-box">
            <i class="bi bi-calendar-check"></i>
            <span class="spec-label">Kuota Terisi</span>
            <span class="spec-val ${isQuotaFull ? 'text-danger fw-bold' : ''}">${confirmedCount} / ${maxLimit} Booking</span>
          </div>
        </div>

        <h5 class="modal-section-title">Fasilitas Kamar</h5>
        <div class="amenity-list-grid mb-4">
          ${facilitiesGridHtml}
        </div>

        <div class="modal-policy-card">
          <div class="d-flex align-items-center gap-2 mb-1">
            <i class="bi bi-info-circle-fill text-primary"></i>
            <strong>Informasi Menginap:</strong>
          </div>
          <div>Check-in: Mulai 14.00 WIB &middot; Check-out: Maks. 12.00 WIB &middot; Bebas Asap Rokok &middot; Maksimal 3 booking per tipe kamar</div>
        </div>
      </div>
      <div class="modal-footer d-flex justify-content-between align-items-center">
        <div>
          <span class="text-ink-muted" style="font-size:.75rem;display:block;">Harga per malam</span>
          <span style="font-size:1.15rem;font-weight:700;color:var(--teal-900);">
            Rp ${Number(room.pricePerNight || 0).toLocaleString('id-ID')}
          </span>
        </div>
        <div class="d-flex gap-2">
          <button type="button" class="btn btn-outline-primary btn-sm" data-bs-dismiss="modal">Tutup</button>
          ${isAvailable
            ? `<a href="${bookingUrl}" class="btn btn-primary btn-sm">Booking Kamar Ini</a>`
            : `<button class="btn btn-primary btn-sm" disabled style="opacity:0.65;">Kamar Penuh</button>`}
        </div>
      </div>
    `;

    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      const detailModal = bootstrap.Modal.getOrCreateInstance(modalEl);
      detailModal.show();
    } else {
      // Fallback jika bootstrap tertunda
      setTimeout(() => {
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
          const detailModal = bootstrap.Modal.getOrCreateInstance(modalEl);
          detailModal.show();
        }
      }, 150);
    }
  };

  // Event delegation untuk tombol detail fasilitas
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-room-detail');
    if (btn) {
      const id = btn.getAttribute('data-room-id');
      if (id) {
        e.preventDefault();
        window.showRoomDetail(id);
      }
    }
  });

  // Periksa parameter URL (misal: /ruangan?detail=kamar-id) untuk langsung buka modal
  function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const targetId = urlParams.get('detail') || urlParams.get('id') || urlParams.get('room');
    if (targetId && loadedRooms.length > 0) {
      const found = loadedRooms.find(r => 
        r.id === targetId || 
        (r.name && r.name.toLowerCase().includes(targetId.toLowerCase()))
      );
      if (found) {
        window.showRoomDetail(found.id);
      }
    }
  }

  // ── Hidrasi Instan dari Cache Lokal (0ms Render) ──
  try {
    const cachedRooms = localStorage.getItem('teduh_rooms_cache');
    if (cachedRooms) {
      loadedRooms = JSON.parse(cachedRooms);
      isRoomsLoaded = true;
      renderAllRooms();
      checkUrlParams();
    }
  } catch(e) {}

  // Muat data real-time dari Firestore Database
  try {
    const qRooms = query(collection(db, 'rooms'), orderBy('name'));
    onSnapshot(qRooms, (snapRooms) => {
      isRoomsLoaded = true;
      loadedRooms = snapRooms.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      try {
        localStorage.setItem('teduh_rooms_cache', JSON.stringify(loadedRooms));
      } catch(e) {}
      renderAllRooms();
      checkUrlParams();
    }, (err) => {
      console.error('Firestore rooms stream error:', err);
      isRoomsLoaded = true;
      renderAllRooms();
    });

    const qBookings = query(collection(db, 'bookings'));
    onSnapshot(qBookings, (snapBookings) => {
      confirmedBookings = snapBookings.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(b => b.status === 'confirmed');
      if (isRoomsLoaded) {
        renderAllRooms();
      }
    }, (err) => {
      console.warn('Firestore bookings stream notice:', err?.message || err);
    });

  } catch (err) {
    console.error('Firestore init error:', err);
    isRoomsLoaded = true;
    renderAllRooms();
  }

})();
