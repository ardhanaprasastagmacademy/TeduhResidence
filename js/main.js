// js/main.js — Teduh Residence
// Navbar scroll, scroll reveal, lightbox galeri, mobile menu

(function () {
  'use strict';

  /* ── 1. Navbar scroll: bayangan saat scroll ── */
  const nav = document.getElementById('mainNav');
  if (nav) {
    const update = () => {
      if (window.scrollY > 20) {
        nav.classList.add('navbar-scrolled');
      } else {
        nav.classList.remove('navbar-scrolled');
      }
    };
    window.addEventListener('scroll', update, { passive: true });
    update(); // inisialisasi
  }

  /* ── 2. Scroll Reveal ── */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => io.observe(el));
  } else {
    // Fallback: langsung tampilkan semua
    revealEls.forEach(el => el.classList.add('revealed'));
  }

  /* ── 3. Lightbox Galeri ── */
  const lightboxOverlay = document.getElementById('lightboxOverlay');
  const lightboxImg     = document.getElementById('lightboxImg');
  const lightboxClose   = document.getElementById('lightboxClose');

  if (lightboxOverlay && lightboxImg) {
    document.addEventListener('click', (e) => {
      const item = e.target.closest('.masonry-item');
      if (item) {
        const img = item.querySelector('img');
        if (img) {
          lightboxImg.src = img.src.replace(/w=\d+/, 'w=1400');
          lightboxImg.alt = img.alt;
          lightboxOverlay.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      }
    });

    const closeLightbox = () => {
      lightboxOverlay.classList.remove('active');
      document.body.style.overflow = '';
      lightboxImg.src = '';
    };

    lightboxClose?.addEventListener('click', closeLightbox);
    lightboxOverlay.addEventListener('click', (e) => {
      if (e.target === lightboxOverlay) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  /* ── 4. Reveal staggered delay untuk kartu ── */
  document.querySelectorAll('.row .reveal').forEach((el, i) => {
    el.style.transitionDelay = `${(i % 3) * 80}ms`;
  });

  /* ── 5. Active nav link berdasarkan halaman aktif (Clean URLs & Standard) ── */
  const cleanPath = (window.location.pathname.split('/').pop() || 'index').replace(/\.html$/, '');
  document.querySelectorAll('.nav-link').forEach(link => {
    const rawHref = link.getAttribute('href') || '';
    const cleanHref = (rawHref.split('/').pop() || 'index').replace(/\.html$/, '');
    
    // Cocokkan halaman (termasuk index atau '/')
    const isIndex = (cleanPath === 'index' || cleanPath === '') && (cleanHref === 'index' || cleanHref === '' || rawHref === '/' || rawHref === 'index.html');
    if (isIndex || (cleanHref === cleanPath && cleanHref !== 'index')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  /* ── 6. Floating Scroll-To-Top Button ── */
  let scrollTopBtn = document.querySelector('.scroll-top-btn');
  if (!scrollTopBtn) {
    scrollTopBtn = document.createElement('button');
    scrollTopBtn.className = 'scroll-top-btn';
    scrollTopBtn.setAttribute('aria-label', 'Kembali ke atas');
    scrollTopBtn.setAttribute('title', 'Kembali ke atas');
    scrollTopBtn.innerHTML = '<i class="bi bi-chevron-up"></i>';
    document.body.appendChild(scrollTopBtn);
  }

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  const onScrollHandler = () => {
    const scrollY = window.scrollY;
    if (scrollTopBtn) {
      if (scrollY > 250) {
        scrollTopBtn.classList.add('show');
      } else {
        scrollTopBtn.classList.remove('show');
      }
    }
  };
  window.addEventListener('scroll', onScrollHandler, { passive: true });
  onScrollHandler();

  /* ── 7. WhatsApp Floating Pop-Up Widget ── */
  let waWidget = document.querySelector('.wa-widget-container');
  if (!waWidget) {
    waWidget = document.createElement('div');
    waWidget.className = 'wa-widget-container';
    
    // Waktu realtime untuk chat bubble
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}.${String(now.getMinutes()).padStart(2, '0')}`;

    waWidget.innerHTML = `
      <div class="wa-tooltip-pill" id="waTooltip">Ada pertanyaan? Chat kami 👋</div>
      <button type="button" class="wa-trigger-btn" id="waTriggerBtn" aria-label="Buka Chat WhatsApp">
        <i class="bi bi-whatsapp"></i>
        <span class="wa-badge-dot"></span>
      </button>

      <div class="wa-popup-card" id="waPopupCard">
        <div class="wa-popup-header">
          <div class="wa-header-brand">
            <div class="wa-avatar">
              <img src="img/logo/favicon.png" alt="Teduh Residence" />
              <span class="avatar-online"></span>
            </div>
            <div class="wa-header-info">
              <h6>Teduh Residence</h6>
              <p><i class="bi bi-circle-fill text-success" style="font-size: 0.45rem;"></i> Resepsionis • Online</p>
            </div>
          </div>
          <button type="button" class="wa-close-btn" id="waCloseBtn" aria-label="Tutup Chat">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="wa-popup-body">
          <div class="wa-chat-bubble">
            Selamat datang di <strong>Teduh Residence</strong>! Ada yang bisa kami bantu seputar reservasi kamar atau fasilitas kami hari ini?
            <span class="bubble-time">${timeStr}</span>
          </div>

          <div class="wa-quick-questions">
            <button type="button" class="wa-quick-btn" data-msg="Halo Teduh Residence, saya ingin tanya ketersediaan kamar untuk tanggal mendatang.">
              <span>👋 Tanya Ketersediaan Kamar</span>
              <i class="bi bi-chevron-right text-muted"></i>
            </button>
            <button type="button" class="wa-quick-btn" data-msg="Halo Teduh Residence, boleh minta info harga terbaru dan paket menginap?">
              <span>💰 Info Harga & Promo</span>
              <i class="bi bi-chevron-right text-muted"></i>
            </button>
            <button type="button" class="wa-quick-btn" data-msg="Halo Teduh Residence, saya butuh bantuan petunjuk lokasi dan akses check-in.">
              <span>📍 Lokasi & Akses Check-in</span>
              <i class="bi bi-chevron-right text-muted"></i>
            </button>
          </div>
        </div>

        <div class="wa-popup-footer">
          <a href="https://wa.me/6281200000000?text=Halo%20Teduh%20Residence%2C%20saya%20ingin%20bertanya%20informasi%20reservasi." target="_blank" rel="noopener" class="btn-start-wa" id="waDirectBtn">
            <i class="bi bi-whatsapp"></i> Mulai Chat WhatsApp
          </a>
        </div>
      </div>
    `;
    document.body.appendChild(waWidget);
  }

  const waTriggerBtn = document.getElementById('waTriggerBtn');
  const waCloseBtn   = document.getElementById('waCloseBtn');
  const waPopupCard  = document.getElementById('waPopupCard');
  const waTooltip    = document.getElementById('waTooltip');

  if (waTriggerBtn && waPopupCard) {
    const toggleWaPopup = (e) => {
      e?.stopPropagation();
      const isShow = waPopupCard.classList.contains('show');
      if (isShow) {
        waPopupCard.classList.remove('show');
        waWidget.classList.remove('open');
      } else {
        waPopupCard.classList.add('show');
        waWidget.classList.add('open');
      }
    };

    waTriggerBtn.addEventListener('click', toggleWaPopup);
    waCloseBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      waPopupCard.classList.remove('show');
      waWidget.classList.remove('open');
    });

    // Handle Quick Action Buttons
    waPopupCard.querySelectorAll('.wa-quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const msg = encodeURIComponent(btn.getAttribute('data-msg') || 'Halo Teduh Residence');
        window.open(`https://wa.me/6281200000000?text=${msg}`, '_blank');
        waPopupCard.classList.remove('show');
        waWidget.classList.remove('open');
      });
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!waWidget.contains(e.target) && waPopupCard.classList.contains('show')) {
        waPopupCard.classList.remove('show');
        waWidget.classList.remove('open');
      }
    });

    // Auto fade tooltip after 5 seconds
    setTimeout(() => {
      if (waTooltip) waTooltip.style.opacity = '0';
    }, 5000);
  }

})();
