// js/booking.js — Teduh Residence
// Form booking: validasi, submit ke Firestore, pesan sukses/gagal

import { db } from './firebase.js';
import {
  collection, addDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

(function () {
  'use strict';

  // ── Data kamar (fallback statis, akan diganti Firestore nanti) ──
  const rooms = {
    'Kamar Deluxe': {
      price: 450000,
      capacity: 2,
      img: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80&auto=format&fit=crop',
    },
    'Kamar Superior': {
      price: 350000,
      capacity: 2,
      img: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&q=80&auto=format&fit=crop',
    },
    'Suite Keluarga': {
      price: 650000,
      capacity: 4,
      img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80&auto=format&fit=crop',
    },
    'Kamar Standar': {
      price: 250000,
      capacity: 1,
      img: 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=600&q=80&auto=format&fit=crop',
    },
  };

  // ── Elemen DOM ──────────────────────────────────────────────
  const form          = document.getElementById('booking-form');
  const roomSelect    = document.getElementById('roomType');
  const checkInEl     = document.getElementById('checkIn');
  const checkOutEl    = document.getElementById('checkOut');
  const guestsEl      = document.getElementById('guests');
  const submitBtn     = document.getElementById('submit-btn');
  const btnText       = document.getElementById('btn-text');
  const btnLoading    = document.getElementById('btn-loading');
  const successMsg    = document.getElementById('success-message');
  const errorMsg      = document.getElementById('error-message');

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

  // ── Pre-fill dari URL params (?room=Kamar+Deluxe&price=450000) ──
  const params = new URLSearchParams(window.location.search);
  const roomParam = params.get('name');
  if (roomParam && roomSelect) {
    for (const opt of roomSelect.options) {
      if (opt.value === roomParam) {
        opt.selected = true;
        updateSummary(roomParam);
        break;
      }
    }
  }

  // Set tanggal minimum (hari ini)
  const today = new Date().toISOString().split('T')[0];
  if (checkInEl) checkInEl.min = today;
  if (checkOutEl) checkOutEl.min = today;

  // ── Update ringkasan kamar ──────────────────────────────────
  function updateSummary(roomName) {
    const room = rooms[roomName];
    if (!room || !summaryName) return;
    summaryName.textContent     = roomName;
    summaryPrice.textContent    = `Rp ${room.price.toLocaleString('id-ID')}`;
    summaryPrice.innerHTML     += ' <span>/ malam</span>';
    summaryCapacity.textContent = `Maks. ${room.capacity} tamu`;
    if (summaryImg) summaryImg.src = room.img;
    updateNightsCalc();
  }

  function updateNightsCalc() {
    if (!checkInEl || !checkOutEl) return;
    const ci = new Date(checkInEl.value);
    const co = new Date(checkOutEl.value);
    const roomName = roomSelect?.value;
    const room = rooms[roomName];
    if (!isNaN(ci) && !isNaN(co) && co > ci && room) {
      const nights = Math.round((co - ci) / 86400000);
      sPPN.textContent    = `Rp ${room.price.toLocaleString('id-ID')}`;
      sNights.textContent = `${nights} malam`;
      sTotal.textContent  = `Rp ${(nights * room.price).toLocaleString('id-ID')}`;
      summaryNights.classList.remove('d-none');
    }
  }

  // Events untuk update ringkasan
  roomSelect?.addEventListener('change', () => updateSummary(roomSelect.value));
  checkInEl?.addEventListener('change', () => {
    if (checkOutEl && checkInEl.value) {
      checkOutEl.min = checkInEl.value;
      if (checkOutEl.value && checkOutEl.value <= checkInEl.value) {
        checkOutEl.value = '';
      }
    }
    updateNightsCalc();
  });
  checkOutEl?.addEventListener('change', updateNightsCalc);

  // ── Normalisasi nomor WhatsApp ──────────────────────────────
  function normalizePhone(raw) {
    const digits = raw.replace(/\D/g, '');
    if (digits.startsWith('0')) return '62' + digits.slice(1);
    if (digits.startsWith('62')) return digits;
    return '62' + digits;
  }

  // ── Validasi custom ────────────────────────────────────────
  function validateForm() {
    let valid = true;

    const name  = form.elements['guestName'];
    const phone = form.elements['phone'];
    const room  = form.elements['roomType'];
    const ci    = form.elements['checkIn'];
    const co    = form.elements['checkOut'];
    const g     = form.elements['guests'];

    // Reset
    [name, phone, room, ci, co, g].forEach(el => {
      el.classList.remove('is-invalid');
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

    // Cek kapasitas
    const capacity = rooms[room.value]?.capacity || 99;
    if (!g.value || parseInt(g.value) > capacity) {
      g.classList.add('is-invalid');
      g.nextElementSibling.textContent = `Kamar ini menampung maksimal ${capacity} tamu.`;
      valid = false;
    }

    return valid;
  }

  // ── Submit ─────────────────────────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    successMsg?.classList.add('d-none');
    errorMsg?.classList.add('d-none');

    if (!validateForm()) return;

    // Loading state
    submitBtn.disabled = true;
    btnText.classList.add('d-none');
    btnLoading.classList.remove('d-none');

    const phoneNorm = normalizePhone(form.elements['phone'].value);

    const bookingData = {
      guestName: form.elements['guestName'].value.trim(),
      phone:     phoneNorm,
      email:     form.elements['email'].value.trim() || null,
      roomName:  form.elements['roomType'].value,
      checkIn:   new Date(form.elements['checkIn'].value),
      checkOut:  new Date(form.elements['checkOut'].value),
      guests:    parseInt(form.elements['guests'].value),
      notes:     form.elements['notes'].value.trim() || null,
      status:    'pending',
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, 'bookings'), bookingData);

      // Sukses
      form.reset();
      successMsg?.classList.remove('d-none');
      successMsg?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      summaryNights?.classList.add('d-none');
      if (summaryName) summaryName.textContent = 'Pilih kamar di form';
      if (summaryPrice) summaryPrice.textContent = '—';
      if (summaryCapacity) summaryCapacity.textContent = '—';

    } catch (err) {
      console.error('Booking error:', err);
      errorMsg?.classList.remove('d-none');
      errorMsg?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } finally {
      submitBtn.disabled = false;
      btnText.classList.remove('d-none');
      btnLoading.classList.add('d-none');
    }
  });

})();
