// js/booking.js — Teduh Residence
// Form booking 100% dinamis terintegrasi real-time langsung ke database Firestore (tanpa dummy/statis)

import { db } from './firebase.js';
import {
  collection, addDoc, onSnapshot, serverTimestamp, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

(function () {
  'use strict';

  const DEFAULT_MAX_BOOKINGS = 3;

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

  // State kamar murni dari Database Firestore
  let roomsList = [];
  let roomsData = {};

  // Set tanggal minimum (hari ini)
  const today = new Date().toISOString().split('T')[0];
  if (checkInEl) checkInEl.min = today;
  if (checkOutEl) checkOutEl.min = today;

  // ── Update mapping roomsData ────────────────────────────────
  function rebuildRoomsData() {
    roomsData = {};
    roomsList.forEach(r => {
      roomsData[r.name] = r;
      if (r.id) roomsData[r.id] = r;
    });
  }

  // ── Isi opsi dropdown kamar dari database Firestore ─────────
  function populateRoomSelect() {
    if (!roomSelect) return;

    if (roomsList.length === 0) {
      roomSelect.innerHTML = '<option value="" disabled selected>Belum ada kamar di database</option>';
      return;
    }

    const previousVal = roomSelect.value;
    const params = new URLSearchParams(window.location.search);
    const paramId   = params.get('id');
    const paramName = params.get('name') || params.get('room');

    let optionsHtml = '<option value="" disabled selected>Pilih tipe kamar</option>';

    roomsList.forEach(r => {
      const isAvailable = r.isAvailable !== false;

      if (!isAvailable) {
        optionsHtml += `
          <option value="${r.name}" data-id="${r.id}" disabled style="color:#888;">
            ${r.name} — [TIDAK TERSEDIA]
          </option>`;
      } else {
        optionsHtml += `
          <option value="${r.name}" data-id="${r.id}" data-price="${r.pricePerNight}" data-capacity="${r.capacity}">
            ${r.name} — Rp ${Number(r.pricePerNight || 0).toLocaleString('id-ID')}/malam
          </option>`;
      }
    });

    roomSelect.innerHTML = optionsHtml;

    // Cocokkan kamar dari URL query parameter atau pilihan sebelumnya
    let matchedRoom = null;
    if (paramId && roomsData[paramId]) {
      matchedRoom = roomsData[paramId];
    } else if (paramName) {
      const searchKey = paramName.toLowerCase();
      matchedRoom = roomsList.find(r => 
        r.name.toLowerCase() === searchKey ||
        r.name.toLowerCase().includes(searchKey) ||
        (r.id && r.id.toLowerCase() === searchKey)
      );
    } else if (previousVal && roomsData[previousVal]) {
      matchedRoom = roomsData[previousVal];
    }

    if (matchedRoom) {
      if (matchedRoom.isAvailable === false) {
        if (roomFullAlert && roomFullText) {
          roomFullText.innerHTML = `
            Kamar <strong>"${matchedRoom.name}"</strong> saat ini <strong>tidak tersedia</strong>.<br>
            Silakan pilih tipe kamar lain yang masih tersedia.
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

      if (sPPN) sPPN.textContent    = `Rp ${price.toLocaleString('id-ID')}`;
      if (sNights) sNights.textContent = `${nights} malam`;
      if (sTotal) sTotal.textContent  = `Rp ${total.toLocaleString('id-ID')}`;
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
    const digits = (raw || '').replace(/\D/g, '');
    if (digits.startsWith('0')) return '62' + digits.slice(1);
    if (digits.startsWith('62')) return digits;
    return '62' + digits;
  }

  // ── Validasi form ───────────────────────────────────────────
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
      if (selectedRoom.isAvailable === false) {
        room.classList.add('is-invalid');
        if (roomFullAlert && roomFullText) {
          roomFullText.innerHTML = `Kamar <strong>"${selectedRoom.name}"</strong> sedang tidak tersedia. Silakan pilih kamar lain.`;
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

  // ── Ambil Data Kamar Langsung dari Firestore (Cepat & Real-Time) ──
  try {
    const qRooms = query(collection(db, 'rooms'), orderBy('name'));
    onSnapshot(qRooms, (snap) => {
      roomsList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      rebuildRoomsData();
      populateRoomSelect();
    }, (err) => {
      console.error('Firestore rooms error:', err);
      if (roomSelect && roomsList.length === 0) {
        roomSelect.innerHTML = '<option value="" disabled selected>Gagal memuat kamar dari database</option>';
      }
    });
  } catch (e) {
    console.error('Firestore init error:', e);
  }

})();
