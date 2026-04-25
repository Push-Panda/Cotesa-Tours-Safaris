'use strict';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mdapjlpl';
const isFileProtocol = window.location.protocol === 'file:';

function debounce(fn, wait = 40) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
}

function normalizeImageURL(url) {
  if (!url || typeof url !== 'string') return url;
  // Keep absolute URLs intact (http, https, data, about, etc.)
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url)) return url;

  const parts = url.split('/').map(segment => {
    try {
      return encodeURIComponent(decodeURIComponent(segment));
    } catch {
      return encodeURIComponent(segment);
    }
  });
  return parts.join('/');
}

function applyImageURLNormalization() {
  const isSmallScreen = window.innerWidth < 768;
  document.querySelectorAll('img').forEach(image => {
    const src = image.getAttribute('src');
    if (!src) return;
    const normalized = normalizeImageURL(src);
    if (normalized && normalized !== src) {
      image.setAttribute('src', normalized);
    }
    // Set loading attribute based on screen size
    if (isSmallScreen) {
      image.setAttribute('loading', 'eager');
    } else if (!image.hasAttribute('loading')) {
      image.setAttribute('loading', 'lazy');
    }
  });
}

/* ─── CURSOR ─── */
(function initCursor() {
  const cursor = document.getElementById('cursor');
  if (prefersReducedMotion || window.matchMedia('(pointer: coarse)').matches) {
    cursor.style.display = 'none';
    document.body.style.cursor = 'auto';
    return;
  }
  let mouseX = -100, mouseY = -100;
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
  });
  const hoverTargets = document.querySelectorAll('a, button, .tour-card, .dest-card, .gallery-item, .filter-tab');
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('expanded'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('expanded'));
  });
})();

/* ─── HERO BACKGROUND ─── */
(function initHero() {
  const heroBg = document.getElementById('heroBg');
  const hero   = document.getElementById('hero');
  hero.classList.add('loaded');

  // Set hero background image only on desktop for performance
  if (window.innerWidth > 768) {
    heroBg.style.backgroundImage = `url('${normalizeImageURL('images/Masai Mara.jpg')}')`;
  }
  if (prefersReducedMotion) {
    heroBg.style.transition = 'none';
    hero.style.transition = 'none';
    hero.classList.add('loaded');
  }

  // fallback handler for any image load failures site-wide
  function setGlobalImageFallbacks() {
    document.querySelectorAll('img').forEach(image => {
      image.addEventListener('error', () => {
        if (!image.dataset.fallback) {
          image.dataset.fallback = 'true';
          const src = image.getAttribute('src');
          const normalized = normalizeImageURL(src);
          if (normalized && normalized !== src) {
            image.setAttribute('src', normalized);
            return;
          }
          // Instead of removing, show a placeholder
          image.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
        } else {
          image.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
        }
      });
    });
  }
  setGlobalImageFallbacks();
})();

/* ─── NAVIGATION ─── */
(function initNav() {
  const nav = document.getElementById('mainNav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 50);
  const debouncedOnScroll = debounce(onScroll, 40);
  window.addEventListener('scroll', debouncedOnScroll, { passive: true });
  onScroll();
})();

/* ─── MOBILE MENU ─── */
const hamburger = document.getElementById('hamburger');
const mobMenu   = document.getElementById('mobMenu');
let menuOpen = false;

function toggleMobileMenu() {
  menuOpen = !menuOpen;
  mobMenu.classList.toggle('open', menuOpen);
  hamburger.setAttribute('aria-expanded', menuOpen);
  hamburger.setAttribute('aria-label', menuOpen ? 'Close menu' : 'Open menu');
  document.body.style.overflow = menuOpen ? 'hidden' : '';
}
function closeMobileMenu() {
  if (!menuOpen) return;
  menuOpen = false;
  mobMenu.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('aria-label', 'Open menu');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuOpen) closeMobileMenu(); });

/* ─── SCROLL REVEAL ─── */
function initReveal() {
  if (prefersReducedMotion) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ─── TOUR DATA + RENDER ─── */
const toursData = [
  {
    name: 'Nairobi National Park Half Day Tour',
    category: 'day',
    priceUSD: 200,
    duration: 'Half Day',
    people: 'Max 8',
    badge: 'Best Value',
    image: 'images/Nairobi National Park Half Day Tour.jpg',
    desc: 'Morning (6:30-12:30) or afternoon (14:00-18:30) game drives including hotel pickup/drop-off, park entry, safari van, water and qualified guide.',
    includes: ['Park entrance fees', 'Transport by safari van', 'Hotel pick-up & drop-off', 'Bottled water', 'Game drives', 'Qualified driver guide'],
    excludes: ['Tips', 'Personal items', 'Drinks and souvenirs']
  },
  {
    name: 'Lake Naivasha + Hell’s Gate Day Trip',
    category: 'day',
    priceUSD: 220,
    duration: 'Full Day',
    people: 'Max 10',
    image: 'images/Lake Naivasha + Hell’s Gate Day Trip.jpg',
    desc: '7:30 pickup, Rift Valley photo stop, Hell’s Gate game drive or cycling, Devil’s Gorge trek, late lunch and return by 18:00. Includes park fees, meals, water and guide.',
    includes: ['Park entrance fees', 'Transport by safari van', '3 meals', 'Bottled water', 'Game drives', 'Qualified driver guide'],
    excludes: ['Tips', 'Personal items', 'Additional drinks and souvenirs']
  },
  {
    name: 'Amboseli National Park Day Trip',
    category: 'day',
    priceUSD: 270,
    duration: 'Full Day',
    people: 'Max 10',
    image: 'images/Amboseli National Park Day Trip.jpg',
    desc: '5:00 pickup and return by 19:00, game drives in Amboseli, picnic lunch, park fees, meals, water and guide included',
    includes: ['Park entrance fees', 'Transport by safari van', '3 meals', 'Bottled water', 'Game drives', 'Qualified driver guide'],
    excludes: ['Tips', 'Personal expenses', 'Drinks and souvenirs']
  },
  {
    name: 'Lake Naivasha + Crescent Island Trek',
    category: 'day',
    priceUSD: 260,
    duration: 'Full Day',
    people: 'Max 10',
    image: 'images/Lake Naivasha + Crescent Island Trek.jpg',
    desc: '7:30 pickup, Rift Valley stop, boat ride to Crescent Island, guided walk, lunch and return by 18:30. Includes park fees, meals, water and guide.',
    includes: ['Park entrance fees', 'Transport by safari van', '3 meals', 'Bottled water', 'Guided walk', 'Qualified driver guide'],
    excludes: ['Tips', 'Personal items', 'Drinks and souvenirs']
  },
  {
    name: '3 Days Masai Mara Safari',
    category: 'group',
    priceUSD: 450,
    duration: '3 Days',
    people: 'Max 12',
    image: 'images/3 Days Masai Mara Safari.jpg',
    desc: 'Nairobi to Masai Mara, picnic lunches, full day Big Five game drive, optional Maasai village, return late afternoon.',
    includes: ['Park entrance fees', 'Transport by safari van', 'Accommodation', '3 meals', 'Bottled water', 'Game drives', 'Qualified driver guide'],
    excludes: ['Tips', 'Personal items', 'Drinks and souvenirs']
  },
  {
    name: '4 Days 3 Nights Masai Mara Budget Safari',
    category: 'group',
    priceUSD: 590,
    duration: '4 Days',
    people: 'Max 10',
    image: 'images/4 Days 3 Nights Masai Mara Budget Safari.jpg',
    desc: '4-day tour with multiple full-day game drives in Masai Mara, breakfast/lunch/dinner and camp accommodation included.',
    includes: ['Park entrance fees', 'Transport by safari van', 'Accommodation', '3 meals', 'Bottled water', 'Game drives', 'Qualified driver guide'],
    excludes: ['Tips', 'Personal items', 'Optional activities', 'Drinks and souvenirs']
  },
  {
    name: '5 Days Masai Mara + Lake Nakuru + Naivasha Budget Safari',
    category: 'luxury',
    priceUSD: 690,
    duration: '5 Days',
    people: 'Max 8',
    image: 'images/5 Days Masai Mara + Lake Nakuru + Naivasha Budget Safari.jpg',
    desc: 'Masai Mara, Lake Nakuru and Hell’s Gate itinerary with full board accommodation, boat rides and daily game drives.',
    includes: ['Park entrance fees', 'Transport by safari van', 'Accommodation', '3 meals', 'Bottled water', 'Game drives', 'Qualified driver guide'],
    excludes: ['Tips', 'Personal items', 'Drinks and souvenirs']
  },
  {
    name: 'Diani Beach & Mombasa Old Town',
    category: 'luxury',
    priceUSD: 318,
    duration: '5 Days',
    people: 'Max 10',
    image: 'images/Diani Beach & Mombasa Old Town.jpg',
    desc: '5 days of beach luxury, snorkel and kayak through coral gardens, plus a dhow sunset cruise with seafood. Explore Fort Jesus, the Spice Market, and narrow alleys of Old Town Mombasa with a local guide, concluding with sunset cocktails over Diani\'s powder-white shore.',
    includes: ['Seafood platter dhow cruise + beach dinner', 'Guided Old Town heritage walk and spice tour', 'Snorkelling and shore leisure time', 'Accommodation in beachfront hotel', '3 meals daily', 'Water sports equipment'],
    excludes: ['Tips for guides', 'Personal items', 'Drinks and souvenirs']
  },
  {
    name: 'Diani Beach Escape',
    category: 'luxury',
    priceUSD: 220,
    duration: '3 Days',
    people: 'Max 12',
    image: 'images/Diani Beach Escape.jpg',
    desc: 'Perfect beach getaway combining Diani\'s pristine waters with Mombasa\'s cultural treasures. Relax on powder-white sands, enjoy water sports, and explore historic Old Town architecture and Fort Jesus.',
    includes: ['Accommodation in 4-star beachfront resort', '3 meals daily', 'Beach access and loungers', 'Guided Mombasa Old Town tour', 'Snorkelling gear provided', 'Bottled water'],
    excludes: ['Tips', 'Personal items', 'Optional activities']
  },
  {
    name: 'Taita Salt Lick Safari',
    category: 'luxury',
    priceUSD: 380,
    duration: '4 Days',
    people: 'Max 8',
    image: 'images/Taita Salt lick.jpg',
    desc: 'Explore the magnificent Taita Salt Lick sanctuary with exclusive game drives to spot elephants, buffalo, and rare wildlife at this iconic salt lick. Includes luxury accommodation, gourmet meals, and expert naturalist guides for an unforgettable experience.',
    includes: ['Park entrance fees', 'Transport by safari van', 'Accommodation in luxury lodge', '3 meals daily', 'Bottled water', 'Game drives', 'Expert naturalist guide', 'Salt Lick viewpoint access'],
    excludes: ['Tips for guides', 'Personal items', 'Drinks and souvenirs']
  },
  {
    name: 'Mount Kenya Trek',
    category: 'adventure',
    priceUSD: 416,
    duration: '6 Days',
    people: 'Max 6',
    badge: 'Adventure',
    image: 'images/harshil-gudka-QYuRIa7NXfQ-unsplash.jpg',
    desc: '6-day guided ascent via the Naro Moru or Sirimon route, with night camps at Shipton\'s and Point Lenana. Includes acclimatisation hikes in the bamboo and heather zones, flora viewing (lobelias, heath, giant senecios), and summit sunrise experience over the Great Rift Valley.',
    includes: ['Guided pro crew and park fees included', 'All meals and campsite transfers', 'Summit attempt early morning for sunrise', 'Acclimatisation hikes', 'Professional mountain guide'],
    excludes: ['Tips for guides', 'Personal items', 'Optional activities']
  },
  {
    name: 'Samburu & Shaba Reserve',
    category: 'adventure',
    priceUSD: 470,
    duration: '5 Days',
    people: 'Max 6',
    image: 'images/Samburu & Shaba Reserve.jpg',
    desc: '5-day northern safari focusing on rare species: Grevy\'s zebra, reticulated giraffe, Somali ostrich, and desert-adapted elephant. Includes guided walks, river-side game drives on the Ewaso Ng\'iro, Samburu community village visit, and optional birding session at Buffalo Springs.',
    includes: ['Park entrance fees', 'Accommodation in safari lodges', 'All meals and bottled water', 'Guided walks and game drives', 'Samburu village visit and professional guide'],
    excludes: ['Tips for guides', 'Optional birding session', 'Personal items and souvenirs']  }
];

const currencyRates = {
  USD: { rate: 1, symbol: '$' },
  EUR: { rate: 0.92, symbol: '€' },
  GBP: { rate: 0.80, symbol: '£' },
  KES: { rate: 132, symbol: 'KES ' }
};

let selectedCurrency = 'USD';

function getPriceText(priceUSD) {
  const currency = currencyRates[selectedCurrency] || currencyRates.USD;
  const value = priceUSD * currency.rate;
  return `${currency.symbol}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function renderTours() {
  const grid = document.getElementById('toursGrid');
  if (!grid) return;
  grid.innerHTML = '';

  toursData.forEach((tour, index) => {
    const delayClass = `delay-${(index % 3) + 1}`;
    const card = document.createElement('article');
    card.className = `tour-card reveal ${delayClass}`;
    card.dataset.category = tour.category;

    const includeText = tour.includes ? tour.includes.map(item => `<li>${item}</li>`).join('') : '';
    const excludeText = tour.excludes ? tour.excludes.map(item => `<li>${item}</li>`).join('') : '';
    const detailsId = `tour-details-${index}`;
    const imageSrc = normalizeImageURL(tour.image);
    const loadingAttr = window.innerWidth < 768 ? 'eager' : 'lazy';

    card.innerHTML = `
      <div class="tour-card-img">
        <img src="${imageSrc}" alt="${tour.name}" loading="${loadingAttr}">
        ${tour.badge ? `<span class="tour-badge">${tour.badge}</span>` : ''}
      </div>
      <div class="tour-body">
        <p class="tour-category">${tour.category.replace(/\b\w/g, l => l.toUpperCase())}</p>
        <h3 class="tour-name">${tour.name}</h3>
        <p class="tour-desc">${tour.desc}</p>
        <div class="tour-more" id="${detailsId}">
          <h4>Includes</h4>
          <ul>${includeText}</ul>
          <h4>Excludes</h4>
          <ul>${excludeText}</ul>
        </div>
        <button type="button" class="tour-read-more" data-target="${detailsId}">Read more</button>
      </div>
      <div class="tour-footer">
        <div>
          <div class="tour-meta">
            <span class="tour-meta-item">🕐 ${tour.duration}</span>
            <span class="tour-meta-item">👥 ${tour.people}</span>
          </div>
          <p class="tour-price">${getPriceText(tour.priceUSD)} <small>/ person</small></p>
        </div>
        <button class="tour-book-btn" onclick="scrollToContact('${tour.name}')">Book Now</button>
      </div>
    `;

    const tourImage = card.querySelector('.tour-card-img img');
    if (tourImage) {
      tourImage.addEventListener('load', () => tourImage.classList.add('loaded'));
      tourImage.addEventListener('error', () => tourImage.classList.remove('loaded'));
    }

    grid.appendChild(card);
  });

  initReveal();
  initTourFilter();
  setImageFallbacks();
  attachTourReadMore();
  populateTourDropdown();
}

function setImageFallbacks() {
  document.querySelectorAll('img').forEach(image => {
    if (!image.dataset.fallback) {
      image.dataset.fallback = 'true';
      image.addEventListener('error', () => {
        const src = image.getAttribute('src');
        const normalized = normalizeImageURL(src);
        if (normalized && normalized !== src) {
          image.setAttribute('src', normalized);
          return;
        }
        // Show placeholder
        image.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
      });
    }
  });
}

function attachTourReadMore() {
  document.querySelectorAll('.tour-read-more').forEach(button => {
    button.addEventListener('click', () => {
      const target = document.getElementById(button.dataset.target);
      if (!target) return;

      const isOpen = target.classList.toggle('open');
      button.textContent = isOpen ? 'Show less' : 'Read more';
      target.style.maxHeight = isOpen ? `${target.scrollHeight}px` : '0px';
    });
  });
}

function populateTourDropdown() {
  const select = document.getElementById('tourSelect');
  if (!select) return;

  const currentOptions = Array.from(select.querySelectorAll('option'));
  const firstOption = currentOptions.find(opt => opt.value === '');
  select.innerHTML = '';
  if (firstOption) select.appendChild(firstOption);
  toursData.forEach(tour => {
    const option = document.createElement('option');
    option.value = tour.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    option.textContent = tour.name;
    select.appendChild(option);
  });
  const customOption = document.createElement('option');
  customOption.value = 'custom';
  customOption.textContent = 'Custom Itinerary';
  select.appendChild(customOption);
}

function initTourFilter() {
  const tabs = document.querySelectorAll('.filter-tab');
  const cards = document.querySelectorAll('.tour-card');

  function closeAllTourDetails() {
    document.querySelectorAll('.tour-more.open').forEach(details => {
      details.classList.remove('open');
      details.style.maxHeight = '0px';
    });
    document.querySelectorAll('.tour-read-more').forEach(btn => {
      btn.textContent = 'Read more';
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const filter = tab.dataset.filter;

      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-pressed', 'false');
      });

      tab.classList.add('active');
      tab.setAttribute('aria-pressed', 'true');

      cards.forEach(card => {
        const show = filter === 'all' || card.dataset.category === filter;
        card.style.display = show ? 'flex' : 'none';
      });

      closeAllTourDetails();
    });

    tab.setAttribute('aria-pressed', tab.classList.contains('active') ? 'true' : 'false');
  });
}

function initCurrencySelector() {
  const select = document.getElementById('currencySelect');
  if (!select) return;

  select.value = selectedCurrency;
  select.addEventListener('change', (event) => {
    selectedCurrency = event.target.value;
    renderTours();
  });
}

applyImageURLNormalization();
renderTours();
initCurrencySelector();
initBookingHistory();

const bookingHistoryStorageKey = 'cotesaBookingHistory';

function getBookingHistory() {
  try {
    return JSON.parse(localStorage.getItem(bookingHistoryStorageKey)) || [];
  } catch {
    return [];
  }
}

function saveBookingHistory(entries) {
  localStorage.setItem(bookingHistoryStorageKey, JSON.stringify(entries));
}

function formatHistoryDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function renderBookingHistory(entries) {
  const list = document.getElementById('bookingHistoryList');
  if (!list) return;
  list.innerHTML = '';

  if (!entries.length) {
    list.innerHTML = '<li class="history-empty">No previous booking attempts yet.</li>';
    return;
  }

  entries.slice(-10).reverse().forEach(entry => {
    const item = document.createElement('li');
    item.className = 'history-item';
    item.innerHTML = `
      <strong>${entry.tour || 'No tour selected'}</strong>
      <div class="history-meta">
        <span>${formatHistoryDate(entry.timestamp)}</span>
        <span>${entry.name || 'Anonymous'}</span>
        <span>${entry.email || 'No email'}</span>
        <span class="history-status ${entry.status === 'Sent' ? 'sent' : 'failed'}">${entry.status}</span>
      </div>
    `;
    list.appendChild(item);
  });
}

function mergeServerAndLocalHistory(serverEntries) {
  const localEntries = getBookingHistory();
  const entriesMap = new Map();

  [...localEntries, ...serverEntries].forEach(entry => {
    const key = `${entry.timestamp}-${entry.email}-${entry.tour}-${entry.status}`;
    if (!entriesMap.has(key)) {
      entriesMap.set(key, entry);
    }
  });

  const merged = Array.from(entriesMap.values()).slice(-20);
  saveBookingHistory(merged);
  return merged;
}

function fetchBookingHistoryFromServer() {
  if (isFileProtocol) return Promise.resolve([]);
  return fetch('/history')
    .then(response => {
      if (!response.ok) throw new Error('History endpoint unavailable');
      return response.json();
    })
    .then(result => Array.isArray(result.entries) ? result.entries : [])
    .catch(() => []);
}

function saveBookingHistoryToServer(entry) {
  if (isFileProtocol) return Promise.resolve(null);
  return fetch('/history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry)
  })
  .then(response => {
    if (!response.ok) throw new Error('History endpoint unavailable');
    return response.json();
  })
  .then(result => result.success ? result.entry : null)
  .catch(() => null);
}

function addBookingHistoryEntry(entry) {
  const entries = getBookingHistory();
  entries.push(entry);
  saveBookingHistory(entries.slice(-20));
  renderBookingHistory(entries);
  saveBookingHistoryToServer(entry).then(serverEntry => {
    if (serverEntry) {
      const merged = mergeServerAndLocalHistory([serverEntry]);
      renderBookingHistory(merged);
    }
  });
}

function clearBookingHistory() {
  localStorage.removeItem(bookingHistoryStorageKey);
  renderBookingHistory([]);
}

function initBookingHistory() {
  const clearBtn = document.getElementById('clearHistoryBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearBookingHistory);
  }
  fetchBookingHistoryFromServer().then(serverEntries => {
    const merged = mergeServerAndLocalHistory(serverEntries);
    renderBookingHistory(merged);
  });
}

/* ─── COUNTER ANIMATION ─── */
(function initCounters() {
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const formatNumber = (n, target) => {
    if (target >= 1000) return (n / 1000).toFixed(1) + 'k+';
    return n + '+';
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const duration = 1400;
      const start    = performance.now();
      const animate  = (now) => {
        const elapsed  = Math.min(now - start, duration);
        const progress = easeOut(elapsed / duration);
        el.textContent = formatNumber(Math.round(target * progress), target);
        if (elapsed < duration) requestAnimationFrame(animate);
        else el.textContent = formatNumber(target, target);
      };
      requestAnimationFrame(animate);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-target]').forEach(el => observer.observe(el));
})();

/* ─── TOUR FILTERING ─── */
// No-op here because initTourFilter() is handled in renderTours() after the card DOM is generated.
// The old IIFE was removed to avoid duplication with the function definition.

/* ─── BOOK NOW → PRE-SELECT TOUR IN FORM ─── */
function scrollToContact(tourName) {
  const select = document.getElementById('tourSelect');
  if (select && tourName) {
    Array.from(select.options).forEach(opt => {
      if (opt.text.toLowerCase().includes(tourName.toLowerCase().split(' ').slice(0,3).join(' '))) {
        select.value = opt.value;
      }
    });
  }
  document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
}

/* ─── CONTACT FORM ─── */
(function initForm() {
  const form       = document.getElementById('enquiryForm');
  const submitBtn  = document.getElementById('submitBtn');
  const statusMsg  = document.getElementById('formStatus');

  if (!form) return;
  console.log('initForm: enquiry form found', form);

  function getTourName(tourValue) {
    const tourSelect = document.getElementById('tourSelect');
    const selectedOption = tourSelect.querySelector(`option[value="${tourValue}"]`);
    return selectedOption ? selectedOption.textContent : tourValue;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Basic validation
    const firstName = form.firstName.value.trim();
    const email     = form.email.value.trim();
    const emailRe   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!firstName) { showStatus('Please enter your first name.', 'error'); form.firstName.focus(); return; }
    if (!email || !emailRe.test(email)) { showStatus('Please enter a valid email address.', 'error'); form.email.focus(); return; }

    // Submit form to Formspree
    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = 'Sending…';

    const formData = {
      firstName: form.firstName.value.trim(),
      lastName: form.lastName.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      tour: form.tour.value,
      travelDate: form.travelDate.value,
      groupSize: form.groupSize.value,
      message: form.message.value.trim(),
      submittedAt: new Date().toISOString()
    };

    console.log('📤 Submitting form data to Formspree:', formData);
    console.log('🔗 Endpoint:', FORMSPREE_ENDPOINT);

    let attempts = 0;
    const maxAttempts = 3;
    let success = false;

    async function attemptSubmit() {
      attempts++;
      console.log(`🔄 Attempt ${attempts}/${maxAttempts} to submit form`);

      try {
        const payload = {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          tour: getTourName(formData.tour),
          travelDate: formData.travelDate,
          groupSize: formData.groupSize,
          message: formData.message,
          submittedAt: formData.submittedAt,
          _subject: `New Booking Enquiry - ${formData.firstName} ${formData.lastName}`,
          _replyto: formData.email
        };
        
        console.log('📬 Payload:', payload);

        const response = await fetch(FORMSPREE_ENDPOINT, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        console.log('✉️ Response status:', response.status, response.statusText);

        // Formspree returns 200 on success (some forms return 302 redirect)
        // Accept any 2xx or 3xx status as success
        if (response.ok || (response.status >= 300 && response.status < 400)) {
          console.log('✅ Success! Response indicates successful submission');
          success = true;
          submitBtn.querySelector('span').textContent = '✓ Enquiry Sent!';
          showStatus('Thank you! We will contact you shortly.', 'success');
          addBookingHistoryEntry({
            timestamp: new Date().toISOString(),
            tour: getTourName(formData.tour),
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            email: formData.email,
            status: 'Sent'
          });
          form.reset();
          return true;
        } else {
          // Log response body for debugging
          const text = await response.text();
          console.log('✉️ Response body:', text);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error(`❌ Attempt ${attempts} failed:`, error.message);
        if (attempts < maxAttempts) {
          const delay = attempts * 1500;
          console.log(`⏳ Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return attemptSubmit();
        } else {
          throw error;
        }
      }
    }

    // Start submission
    attemptSubmit().catch(error => {
      console.error('❌ All attempts failed. Final error:', error);
      const message = 'Sorry, there was an error. Please try again or contact us directly at cotesasafaris@gmail.com or WhatsApp +254 106 642 182';
      showStatus(message, 'error');
      addBookingHistoryEntry({
        timestamp: new Date().toISOString(),
        tour: getTourName(formData.tour),
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        status: 'Failed'
      });
    }).finally(() => {
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.querySelector('span').textContent = 'Send Enquiry';
        hideStatus();
      }, 3000);
    });
  });

  function showStatus(msg, type) {
    statusMsg.textContent = msg;
    statusMsg.style.display = 'block';
    statusMsg.style.color = type === 'error' ? '#c0392b' : 'var(--sage)';
  }
  function hideStatus() {
    statusMsg.style.display = 'none';
  }
})();