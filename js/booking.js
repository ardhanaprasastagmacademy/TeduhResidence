// js/booking.js — Teduh Residence
// Form booking cepat & responsif: instant load 0ms + real-time sync Firestore & limit 3 booking

import { db } from './firebase.js';
import {
  collection, addDoc, onSnapshot, serverTimestamp, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

(function () {
  'use strict';

  const DEFAULT_MAX_BOOKINGS = 3;

  // Data kamar awal (tersedia instan dalam 0ms tanpa menunggu jaringan)
  const DEFAULT_ROOMS = [
    {
      id: 'kamar-deluxe',
      name: 'Kamar Deluxe',
      pricePerNight: 450000,
      capacity: 2,
      maxBookings: 3,
      description: 'Kamar dengan nuansa hangat, pencahayaan alami, kasur King premium, AC, Wi-Fi super cepat, dan sarapan untuk 2 orang.',
      facilities: ['AC', 'Wi-Fi Super Cepat', 'Sarapan', 'Smart TV 32"', 'K. Mandi & Air Panas'],
      images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80&auto=format&fit=crop'],
      isAvailable: true
    },
    {
      id: 'kamar-superior',
      name: 'Kamar Superior',
      pricePerNight: 350000,
      capacity: 2,
      maxBookings: 3,
      description: 'Pilihan hemat dan nyaman dengan kasur Queen, AC, Wi-Fi gratis, dan TV kabel untuk 2 tamu.',
      facilities: ['AC', 'Wi-Fi Cepat', 'TV Kabel 32"', 'K. Mandi & Air Panas'],
      images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&q=80&auto=format&fit=crop'],
      isAvailable: true
    },
    {
      id: 'suite-keluarga',
      name: 'Suite Keluarga',
      pricePerNight: 650000,
      capacity: 4,
      maxBookings: 3,
      description: 'Ruangan luas untuk keluarga hingga 4 orang dengan 2 tempat tidur Queen, 2 AC, 2 kamar mandi dalam, dan living area.',
      facilities: ['2 Unit AC', 'Wi-Fi Super Cepat', 'Sarapan 4 Orang', '2 TV Kabel 32"', '2 K. Mandi & Air Panas'],
      images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80&auto=format&fit=crop'],
      isAvailable: true
    },
    {
      id: 'kamar-standar',
      name: 'Kamar Standar',
      pricePerNight: 250000,
      capacity: 1,
      maxBookings: 3,
      description: 'Kamar bersih dan tenang untuk perjalanan solo dengan Wi-Fi gratis dan 1 tempat tidur single.',
      facilities: ['Kipas Angin Dinding', 'Wi-Fi Cepat', 'TV 24"', 'Kamar Mandi Bersama'],
      images: ['https://images.unsplash.com/photo-1455587734955-081b22074882?w=600&q=80&auto=format&fit=crop'],
      isAvailable: true
    }
  ];

  // ── Elemen DOM ──────────────────────────────────────────────
  const form           = document.getElementById('booking-form');
  const roomSelect     = document.getElementById('roomType');
  const checkInEl      = document.getElementById('checkIn');
  const checkOutEl     = document.getElementById('checkOut');
  const guestsEl       = document.getElementById('guests');
  const submitBtn      = document.getElementById('submit-btn');
  const btnText        = document.getElementById('btn-text');
  const btnLoading     = document.getElementById('btn-loading');
  const successMsg     = document.getElementById('success-message');
  const errorMsg       = document.getElementById('error-message');
  const errorMsgText   = document.getElementById('error-message-text');
  const roomFullAlert  = document.getElementById('room-full-alert');
  const roomFullText   = document.getElementById('room-full-alert-text');

  // Sidebar summary
  const summaryImg     = document.getElementById('summary-img');
  const summaryName    = document.getElementById('summary-room-name');
  const summaryPrice   = document.getElementById('summary-price');
  const summaryCapacity= document.getElementById('summary-capacity');
  const summaryNights  = document.getElementById('summary-nights-info');
  const sPPN           = document.getElementById('s-price-per-night');
  const sNights        = document.getElementById('s-nights');
  const sTotal         = document.getElementById('s-total');

  if (!form) return;

  // Coba ambil cache dari localStorage untuk kecepatan instan
  let cachedRooms = null;
  try {
    const raw = localStorage.getItem('teduh_rooms_cache');
    if (raw) cachedRooms = JSON.parse(raw);
  } catch (e) {}

  // State kamar
  let roomsList = (Array.isArray(cachedRooms) && cachedRooms.length > 0) ? cachedRooms : DEFAULT_ROOMS;
  let roomsData = {};
  let confirmedBookings = [];

  // Update mapping roomsData
  function rebuildRoomsData() {
    roomsData = {};
    roomsList.forEach(r => {
      roomsData[r.name] = r;
      if (r.id) roomsData[r.id] = r;
    });
  }
  rebuildRoomsData();

  // Set tanggal minimum (hari ini)
  const today = new Date().toISOString().split('T')[0];
  if (checkInEl) checkInEl.min = today;
  if (checkOutEl) checkOutEl.min = today;

  // ── Hitung jumlah booking terkonfirmasi untuk suatu kamar ────
  function getConfirmedCount(room) {
    return confirmedBookings.filter(b => 
      (b.roomId && b.roomId === room.id) ||
      (b.roomName && b.roomName.toLowerCase() === room.name.toLowerCase())
    ).length;
  }

  // ── Isi opsi dropdown kamar & cek kuota ──────────────────────
  function populateRoomSelect() {
    const previousVal = roomSelect.value;
    const params = new URLSearchParams(window.location.search);
    const paramId   = params.get('id');
    const paramName = params.get('name') || params.get('room');

    let optionsHtml = '<option value="" disabled selected>Pilih tipe kamar</option>';

    roomsList.forEach(r => {
      const maxLimit = parseInt(r.maxBookings) || DEFAULT_MAX_BOOKINGS;
      const confirmedCount = getConfirmedCount(r);
      const isQuotaFull = confirmedCount >= maxLimit;
      const isAvailable = r.isAvailable !== false && !isQuotaFull;

      if (isQuotaFull) {
        optionsHtml += `
          <option value="${r.name}" data-id="${r.id}" disabled style="color:#9A3B30;background:#fdf2f2;font-weight:500;">
            ${r.name} — [PENUH / ${confirmedCount}/${maxLimit} Booking Dikonfirmasi]
          </option>`;
      } else if (r.isAvailable === false) {
        optionsHtml += `
          <option value="${r.name}" data-id="${r.id}" disabled style="color:#888;">
            ${r.name} — [TIDAK TERSEDIA]
          </option>`;
      } else {
        const quotaInfo = confirmedCount > 0 ? ` (${confirmedCount}/${maxLimit} Terisi)` : '';
        optionsHtml += `
          <option value="${r.name}" data-id="${r.id}" data-price="${r.pricePerNight}" data-capacity="${r.capacity}">
            ${r.name} — Rp ${Number(r.pricePerNight || 0).toLocaleString('id-ID')}/malam${quotaInfo}
          </option>`;
      }
    });

    roomSelect.innerHTML = optionsHtml;

    // Cek kecocokan kamar dari URL atau pilihan sebelumnya
    let matchedRoom = null;
    if (paramId && roomsData[paramId]) {
      matchedRoom = roomsData[paramId];
    } else if (paramName) {
      matchedRoom = roomsList.find(r => 
        r.name.toLowerCase() === paramName.toLowerCase() ||
        r.name.toLowerCase().includes(paramName.toLowerCase()) ||
        (r.id && r.id.toLowerCase() === paramName.toLowerCase())
      );
    } else if (previousVal && roomsData[previousVal]) {
      matchedRoom = roomsData[previousVal];
    }

    if (matchedRoom) {
      const maxLimit = parseInt(matchedRoom.maxBookings) || DEFAULT_MAX_BOOKINGS;
      const confirmedCount = getConfirmedCount(matchedRoom);
      const isQuotaFull = confirmedCount >= maxLimit || matchedRoom.isAvailable === false;

      if (isQuotaFull) {
        if (roomFullAlert && roomFullText) {
          roomFullText.innerHTML = `
            Kamar <strong>"${matchedRoom.name}"</strong> saat ini <strong>sudah penuh</strong> (kuota ${confirmedCount}/${maxLimit} booking telah dikonfirmasi).<br>
            Silakan pilih tipe kamar lain yang masih tersedia di bawah ini.
          `;
          roomFullAlert.classList.remove('d-none');
        }
        roomSelect.value = '';
        if (summaryName) summaryName.textContent = 'Pilih kamar yang tersedia';
        if (summaryPrice) summaryPrice.textContent = '—';
        if (summaryCapacity) summaryCapacity.textContent = '—';
      } else {
        roomFullAlert?.classList.add('d-none');
        roomSelect.value = matchedRoom.name;
        updateGuestOptions(matchedRoom.capacity || 2);
        updateSummary(matchedRoom);
      }
    }
  }

  // ── Update opsi jumlah tamu berdasarkan kapasitas kamar ─────
  function updateGuestOptions(maxCapacity) {
    if (!guestsEl) return;
    const currentGuestVal = parseInt(guestsEl.value) || 1;

    let optionsHtml = '<option value="" disabled>Pilih jumlah tamu</option>';
    for (let i = 1; i <= maxCapacity; i++) {
      optionsHtml += `<option value="${i}">${i} tamu</option>`;
    }
    guestsEl.innerHTML = optionsHtml;

    if (currentGuestVal <= maxCapacity) {
      guestsEl.value = currentGuestVal;
    } else {
      guestsEl.value = maxCapacity;
    }
  }

  // ── Update ringkasan kamar (Sidebar) ────────────────────────
  function updateSummary(room) {
    if (!room || !summaryName) return;

    const mainImg = (Array.isArray(room.images) && room.images.length > 0)
      ? room.images[0]
      : 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80&auto=format&fit=crop';

    summaryName.textContent     = room.name;
    summaryPrice.textContent    = `Rp ${Number(room.pricePerNight || 0).toLocaleString('id-ID')}`;
    summaryPrice.innerHTML     += ' <span style="font-size:.875rem;font-weight:400;color:var(--ink-muted);">/ malam</span>';
    summaryCapacity.textContent = `Maks. ${room.capacity || 2} tamu`;
    if (summaryImg) summaryImg.src = mainImg;

    updateNightsCalc(room);
  }

  // ── Hitung estimasi malam & total harga ──────────────────────
  function updateNightsCalc(currentRoom) {
    if (!checkInEl || !checkOutEl) return;
    const ci = new Date(checkInEl.value);
    const co = new Date(checkOutEl.value);
    const room = currentRoom || roomsData[roomSelect?.value];

    if (!isNaN(ci) && !isNaN(co) && co > ci && room) {
      const nights = Math.round((co - ci) / (1000 * 60 * 60 * 24));
      const price = Number(room.pricePerNight || 0);
      const total = nights * price;

      sPPN.textContent    = `Rp ${price.toLocaleString('id-ID')}`;
      sNights.textContent = `${nights} malam`;
      sTotal.textContent  = `Rp ${total.toLocaleString('id-ID')}`;
      summaryNights?.classList.remove('d-none');
    } else {
      summaryNights?.classList.add('d-none');
    }
  }

  // ── Event Listeners ─────────────────────────────────────────
  roomSelect?.addEventListener('change', () => {
    roomFullAlert?.classList.add('d-none');
    const selectedRoom = roomsData[roomSelect.value];
    if (selectedRoom) {
      updateGuestOptions(selectedRoom.capacity || 2);
      updateSummary(selectedRoom);
    }
  });

  checkInEl?.addEventListener('change', () => {
    if (checkOutEl && checkInEl.value) {
      checkOutEl.min = checkInEl.value;
      if (checkOutEl.value && checkOutEl.value <= checkInEl.value) {
        checkOutEl.value = '';
      }
    }
    updateNightsCalc();
  });

  checkOutEl?.addEventListener('change', () => updateNightsCalc());

  // ── Normalisasi nomor WhatsApp ──────────────────────────────
  function normalizePhone(raw) {
    const digits = raw.replace(/\D/g, '');
    if (digits.startsWith('0')) return '62' + digits.slice(1);
    if (digits.startsWith('62')) return digits;
    return '62' + digits;
  }

  // ── Validasi form & Cek Kuota Penuh ─────────────────────────
  function validateForm() {
    let valid = true;

    const name  = form.elements['guestName'];
    const phone = form.elements['phone'];
    const room  = form.elements['roomType'];
    const ci    = form.elements['checkIn'];
    const co    = form.elements['checkOut'];
    const g     = form.elements['guests'];

    [name, phone, room, ci, co, g].forEach(el => {
      el?.classList.remove('is-invalid');
    });

    if (!name.value.trim()) {
      name.classList.add('is-invalid'); valid = false;
    }

    const phoneNorm = normalizePhone(phone.value);
    if (phoneNorm.length < 10 || phoneNorm.length > 15) {
      phone.classList.add('is-invalid'); valid = false;
    }

    if (!room.value) {
      room.classList.add('is-invalid'); valid = false;
    }

    const todayDate = new Date(); todayDate.setHours(0,0,0,0);
    const ciDate = new Date(ci.value);
    const coDate = new Date(co.value);

    if (!ci.value || ciDate < todayDate) {
      ci.classList.add('is-invalid'); valid = false;
    }
    if (!co.value || coDate <= ciDate) {
      co.classList.add('is-invalid'); valid = false;
    }

    const selectedRoom = roomsData[room.value];
    if (selectedRoom) {
      const maxLimit = parseInt(selectedRoom.maxBookings) || DEFAULT_MAX_BOOKINGS;
      const confirmedCount = getConfirmedCount(selectedRoom);
      
      if (confirmedCount >= maxLimit) {
        room.classList.add('is-invalid');
        if (roomFullAlert && roomFullText) {
          roomFullText.innerHTML = `
            Kamar <strong>"${selectedRoom.name}"</strong> sudah penuh (<strong>${confirmedCount}/${maxLimit} booking dikonfirmasi</strong>). Silakan pilih kamar lain.
          `;
          roomFullAlert.classList.remove('d-none');
          roomFullAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        valid = false;
      }

      const capacity = selectedRoom.capacity || 99;
      if (!g.value || parseInt(g.value) > capacity) {
        g.classList.add('is-invalid');
        if (g.nextElementSibling) {
          g.nextElementSibling.textContent = `Kamar ini menampung maksimal ${capacity} tamu.`;
        }
        valid = false;
      }
    }

    return valid;
  }

  // ── Submit Booking ke Firestore ─────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    successMsg?.classList.add('d-none');
    errorMsg?.classList.add('d-none');

    if (!validateForm()) return;

    submitBtn.disabled = true;
    btnText.classList.add('d-none');
    btnLoading.classList.remove('d-none');

    const phoneNorm    = normalizePhone(form.elements['phone'].value);
    const selectedRoom = roomsData[form.elements['roomType'].value];
    const ciDate       = new Date(form.elements['checkIn'].value);
    const coDate       = new Date(form.elements['checkOut'].value);
    const nights       = Math.max(1, Math.round((coDate - ciDate) / (1000 * 60 * 60 * 24)));
    const pricePerNight= Number(selectedRoom?.pricePerNight || 0);
    const totalPrice   = nights * pricePerNight;

    const bookingData = {
      guestName:    form.elements['guestName'].value.trim(),
      phone:        phoneNorm,
      email:        form.elements['email'].value.trim() || null,
      roomName:     selectedRoom?.name || form.elements['roomType'].value,
      roomId:       selectedRoom?.id || null,
      pricePerNight:pricePerNight,
      nights:       nights,
      totalPrice:   totalPrice,
      checkIn:      ciDate,
      checkOut:     coDate,
      guests:       parseInt(form.elements['guests'].value),
      notes:        form.elements['notes'].value.trim() || null,
      status:       'pending',
      createdAt:    serverTimestamp(),
    };

    try {
      await addDoc(collection(db, 'bookings'), bookingData);

      // Sukses
      form.reset();
      roomFullAlert?.classList.add('d-none');
      successMsg?.classList.remove('d-none');
      successMsg?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      summaryNights?.classList.add('d-none');
      if (summaryName) summaryName.textContent = 'Pilih kamar di form';
      if (summaryPrice) summaryPrice.textContent = '—';
      if (summaryCapacity) summaryCapacity.textContent = '—';

      populateRoomSelect();

    } catch (err) {
      console.error('Booking error:', err);
      if (errorMsgText) errorMsgText.textContent = 'Booking belum terkirim. Coba lagi sebentar ya.';
      errorMsg?.classList.remove('d-none');
      errorMsg?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } finally {
      submitBtn.disabled = false;
      btnText.classList.remove('d-none');
      btnLoading.classList.add('d-none');
    }
  });

  // 1. Eksekusi instan 0ms pertama kali
  populateRoomSelect();

  // 2. Sinkronisasi latar belakang dengan Firestore
  try {
    const qRooms = query(collection(db, 'rooms'), orderBy('name'));
    onSnapshot(qRooms, (snap) => {
      if (!snap.empty) {
        roomsList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        rebuildRoomsData();
        populateRoomSelect();
        try {
          localStorage.setItem('teduh_rooms_cache', JSON.stringify(roomsList));
        } catch (e) {}
      }
    }, (err) => {
      console.warn('Firestore rooms stream:', err);
    });

    const qBookings = query(collection(db, 'bookings'));
    onSnapshot(qBookings, (snap) => {
      confirmedBookings = snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(b => b.status === 'confirmed');
      populateRoomSelect();
    }, (err) => {
      console.warn('Firestore bookings stream:', err);
    });
  } catch (e) {
    console.warn('Firestore init background:', e);
  }

})();
