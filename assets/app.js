// ============================================================
// SIX ANIMAL ARCHIVE - Main Application (SPA)
// ============================================================

(() => {
  'use strict';

  // ----- State -----
  let data = null;
  let currentPage = 'home';
  let albumData = [];
  let artikelData = [];
  let pustakaData = [];
  let anggotaData = [];
  let faqData = [];
  let lightboxIndex = 0;
  let lightboxItems = [];

  // ----- DOM refs -----
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const pages = {
    home: $('#page-home'),
    album: $('#page-album'),
    artikel: $('#page-artikel'),
    pustaka: $('#page-pustaka'),
    bantuan: $('#page-bantuan'),
  };
  const navLinks = $$('.nav-links a');
  const hamburger = $('#hamburger');
  const navList = $('#nav-links');
  const loadingScreen = $('#loading-screen');

  // ----- Load Data -----
  async function loadData() {
    try {
      const res = await fetch('assets/data.json');
      data = await res.json();
      albumData = data.album || [];
      artikelData = data.artikel || [];
      pustakaData = data.pustaka || [];
      anggotaData = data.anggota || [];
      faqData = data.faq || [];
      return data;
    } catch (e) {
      console.error('Failed to load data.json', e);
      return null;
    }
  }

  // ----- Navigation (SPA) -----
  function navigateTo(pageId) {
    if (pageId === currentPage) return;
    // hide all pages
    Object.keys(pages).forEach((key) => {
      pages[key].classList.remove('active');
    });
    const target = pages[pageId];
    if (target) target.classList.add('active');
    // update nav
    navLinks.forEach((a) => {
      a.classList.toggle('active', a.dataset.page === pageId);
    });
    currentPage = pageId;
    // close mobile menu
    navList.classList.remove('open');
    // scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // re-trigger AOS
    if (window.AOS) AOS.refresh();
  }

  // ----- Render Functions -----

  // Render Dashboard Stats
  function renderStats() {
    if (!data) return;
    const stats = {
      'stat-quote': data.quotes?.[0] || 'Belajar, berkarya, berbagi.',
      'stat-anggota': data.settings?.totalAnggota || anggotaData.length,
      'stat-album': albumData.length,
      'stat-foto': albumData.reduce((acc, a) => acc + (a.items?.length || 0), 0),
      'stat-artikel': artikelData.length,
      'stat-arsip': pustakaData.filter(p => p.type === 'arsip').length,
    };
    Object.keys(stats).forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = stats[id];
    });
  }

  // Render Anggota Slider
  function renderAnggota() {
    const wrapper = document.getElementById('anggota-slider');
    if (!wrapper) return;
    wrapper.innerHTML = anggotaData.map((a) => `
      <div class="swiper-slide">
        <div class="anggota-card" data-aos="fade-up" data-aos-delay="100">
          <img src="${a.foto || 'https://i.pravatar.cc/150?img='+Math.random()}" alt="${a.nama}" loading="lazy" />
          <h4>${a.nama}</h4>
          <p>${a.motto || ''}</p>
          <p style="font-size:0.7rem;color:var(--neon-cyan);">${a.status || ''} ${a.kota ? '• '+a.kota : ''}</p>
        </div>
      </div>
    `).join('');
    // Init Swiper after DOM update
    if (typeof Swiper !== 'undefined') {
      new Swiper('.anggota-swiper', {
        slidesPerView: 1,
        spaceBetween: 20,
        loop: true,
        autoplay: { delay: 4000, disableOnInteraction: true },
        pagination: { el: '.swiper-pagination', clickable: true },
        breakpoints: {
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        },
        effect: 'slide',
      });
    }
  }

  // Render Album Masonry
  function renderAlbum(filter = 'all') {
    const grid = document.getElementById('album-grid');
    if (!grid) return;
    const filtered = filter === 'all' ? albumData : albumData.filter(a => a.kategori === filter);
    grid.innerHTML = filtered.map((album, idx) => {
      const cover = album.cover || 'https://picsum.photos/seed/'+idx+'/400/300';
      return `
        <div class="album-item" data-index="${idx}" data-aos="fade-up" data-aos-delay="${idx*30}">
          <img src="${cover}" alt="${album.judul}" loading="lazy" />
          <div class="overlay">
            <h4>${album.judul}</h4>
            <p>${album.kategori || ''} • ${album.items?.length || 0} foto</p>
          </div>
        </div>
      `;
    }).join('');
    // Lightbox triggers
    grid.querySelectorAll('.album-item').forEach((el, i) => {
      el.addEventListener('click', () => openLightbox(i, filtered));
    });
  }

  // Render Album Categories
  function renderAlbumCategories() {
    const container = document.getElementById('album-categories');
    if (!container) return;
    const cats = ['all', ...new Set(albumData.map(a => a.kategori).filter(Boolean))];
    container.innerHTML = cats.map(c => `
      <button class="${c === 'all' ? 'active' : ''}" data-cat="${c}">${c === 'all' ? 'Semua' : c}</button>
    `).join('');
    container.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderAlbum(btn.dataset.cat);
      });
    });
  }

  // Lightbox
  function openLightbox(index, items) {
    lightboxItems = items;
    lightboxIndex = index;
    const lb = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    const title = document.getElementById('lb-title');
    const sub = document.getElementById('lb-sub');
    const item = items[index];
    if (!item) return;
    img.src = item.cover || 'https://picsum.photos/seed/'+index+'/800/600';
    img.alt = item.judul;
    title.textContent = item.judul;
    sub.textContent = item.kategori || '';
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    document.getElementById('lightbox').classList.remove('open');
    document.body.style.overflow = '';
  }

  function navigateLightbox(dir) {
    const newIndex = (lightboxIndex + dir + lightboxItems.length) % lightboxItems.length;
    openLightbox(newIndex, lightboxItems);
  }

  // Render Artikel
  function renderArtikel(filter = 'all', search = '') {
    const grid = document.getElementById('artikel-grid');
    if (!grid) return;
    let filtered = artikelData;
    if (filter !== 'all') filtered = filtered.filter(a => a.tag && a.tag.includes(filter));
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(a => a.judul.toLowerCase().includes(s) || (a.penulis && a.penulis.toLowerCase().includes(s)));
    }
    grid.innerHTML = filtered.map((a, i) => `
      <div class="artikel-card" data-aos="fade-up" data-aos-delay="${i*50}">
        <img src="${a.cover || 'https://picsum.photos/seed/'+i+'/400/200'}" alt="${a.judul}" loading="lazy" />
        <div class="body">
          <h4>${a.judul}</h4>
          <div class="meta">
            <span>${a.tanggal || ''}</span>
            <span>${a.penulis || ''}</span>
            <span>${a.readingTime || ''}</span>
          </div>
          <div class="tags">
            ${(a.tag || []).map(t => `<span>#${t}</span>`).join('')}
          </div>
          <button class="share-btn" data-title="${a.judul}" style="margin-top:8px;background:rgba(124,58,237,0.2);border:none;color:#fff;padding:4px 12px;border-radius:12px;cursor:pointer;">Share</button>
        </div>
      </div>
    `).join('');
    // Share
    grid.querySelectorAll('.share-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const title = btn.dataset.title;
        if (navigator.share) {
          navigator.share({ title, url: window.location.href });
        } else {
          navigator.clipboard.writeText(window.location.href).then(() => alert('Link copied!'));
        }
      });
    });
  }

  // Render Pustaka
  function renderPustaka(filter = 'all', search = '') {
    const grid = document.getElementById('pustaka-grid');
    if (!grid) return;
    let filtered = pustakaData;
    if (filter !== 'all') filtered = filtered.filter(p => p.type === filter);
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(p => p.judul.toLowerCase().includes(s) || (p.penulis && p.penulis.toLowerCase().includes(s)));
    }
    grid.innerHTML = filtered.map((p, i) => `
      <div class="pustaka-item" data-aos="fade-up" data-aos-delay="${i*50}">
        <div class="icon">${p.icon || '📄'}</div>
        <h4>${p.judul}</h4>
        <div class="meta">${p.penulis || ''} • ${p.tahun || ''}</div>
        <div class="actions">
          <button class="preview-btn" data-url="${p.url || '#'}">Preview</button>
          <button class="download-btn" data-url="${p.url || '#'}">Download</button>
        </div>
      </div>
    `).join('');
    grid.querySelectorAll('.preview-btn').forEach(btn => {
      btn.addEventListener('click', () => window.open(btn.dataset.url, '_blank'));
    });
    grid.querySelectorAll('.download-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const a = document.createElement('a');
        a.href = btn.dataset.url;
        a.download = '';
        a.click();
      });
    });
  }

  // Render FAQ (Accordion)
  function renderFAQ() {
    const container = document.getElementById('faq-accordion');
    if (!container) return;
    container.innerHTML = faqData.map((f, i) => `
      <div class="faq-item" data-aos="fade-up" data-aos-delay="${i*50}">
        <div class="faq-question">
          <span>${f.pertanyaan}</span>
          <span class="arrow">▾</span>
        </div>
        <div class="faq-answer">${f.jawaban}</div>
      </div>
    `).join('');
    container.querySelectorAll('.faq-question').forEach((q, i) => {
      q.addEventListener('click', () => {
        const item = q.closest('.faq-item');
        item.classList.toggle('open');
      });
    });
  }

  // ----- Init SPA -----
  async function init() {
    // load data
    await loadData();
    if (!data) {
      loadingScreen.classList.add('hidden');
      return;
    }

    // Render all sections
    renderStats();
    renderAnggota();
    renderAlbumCategories();
    renderAlbum();
    renderArtikel();
    renderPustaka();
    renderFAQ();

    // Set version & changelog
    const ver = document.getElementById('version');
    if (ver) ver.textContent = data.settings?.version || '1.0.0';
    const cl = document.getElementById('changelog');
    if (cl) cl.textContent = data.settings?.changelog || 'Initial release';

    // Hide loading
    setTimeout(() => loadingScreen.classList.add('hidden'), 600);

    // Event: navigation
    navLinks.forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const page = a.dataset.page;
        if (page) navigateTo(page);
      });
    });

    // Hamburger
    hamburger.addEventListener('click', () => {
      navList.classList.toggle('open');
    });

    // Lightbox controls
    document.querySelector('#lightbox .close')?.addEventListener('click', closeLightbox);
    document.querySelector('#lightbox .prev')?.addEventListener('click', () => navigateLightbox(-1));
    document.querySelector('#lightbox .next')?.addEventListener('click', () => navigateLightbox(1));
    document.addEventListener('keydown', (e) => {
      if (document.getElementById('lightbox').classList.contains('open')) {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
      }
    });

    // Artikel search/filter
    const artikelSearch = document.getElementById('artikel-search');
    const artikelFilter = document.getElementById('artikel-filter');
    if (artikelSearch) {
      artikelSearch.addEventListener('input', () => {
        renderArtikel(artikelFilter?.value || 'all', artikelSearch.value);
      });
    }
    if (artikelFilter) {
      // populate tags
      const tags = new Set();
      artikelData.forEach(a => (a.tag || []).forEach(t => tags.add(t)));
      artikelFilter.innerHTML = '<option value="all">Semua</option>' +
        [...tags].map(t => `<option value="${t}">${t}</option>`).join('');
      artikelFilter.addEventListener('change', () => {
        renderArtikel(artikelFilter.value, artikelSearch?.value || '');
      });
    }

    // Pustaka search/filter
    const pustakaSearch = document.getElementById('pustaka-search');
    const pustakaFilter = document.getElementById('pustaka-filter');
    if (pustakaSearch) {
      pustakaSearch.addEventListener('input', () => {
        renderPustaka(pustakaFilter?.value || 'all', pustakaSearch.value);
      });
    }
    if (pustakaFilter) {
      const types = new Set(pustakaData.map(p => p.type).filter(Boolean));
      pustakaFilter.innerHTML = '<option value="all">Semua</option>' +
        [...types].map(t => `<option value="${t}">${t}</option>`).join('');
      pustakaFilter.addEventListener('change', () => {
        renderPustaka(pustakaFilter.value, pustakaSearch?.value || '');
      });
    }

    // Active page based on hash
    const hash = window.location.hash.replace('#', '') || 'home';
    if (pages[hash]) navigateTo(hash);
    window.addEventListener('hashchange', () => {
      const h = window.location.hash.replace('#', '') || 'home';
      if (pages[h]) navigateTo(h);
    });

    // AOS
    if (window.AOS) AOS.init({ once: true, offset: 80, duration: 800 });
  }

  // ----- Start -----
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();