/* ============================================================
   FLUFFY CLOUD CAFE – Shared JavaScript Utilities
   ============================================================ */

// ── Cart Store ──────────────────────────────────────────────
const Cart = (() => {
  const STORAGE_KEY = 'fluffyCloudCart';

  function getItems() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  }
  function saveItems(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    updateCartUI();
  }
  function addItem(product) {
    const items = getItems();
    const existing = items.find(i => i.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      items.push({ ...product, qty: 1 });
    }
    saveItems(items);
    showToast(`🛒 ${product.name} added to cart!`);
  }
  function removeItem(id) {
    const items = getItems().filter(i => i.id !== id);
    saveItems(items);
  }
  function updateQty(id, delta) {
    const items = getItems();
    const item = items.find(i => i.id === id);
    if (item) {
      item.qty = Math.max(1, item.qty + delta);
      saveItems(items);
    }
  }
  function getTotal() {
    return getItems().reduce((sum, i) => sum + i.price * i.qty, 0);
  }
  function getCount() {
    return getItems().reduce((sum, i) => sum + i.qty, 0);
  }
  function clear() {
    localStorage.removeItem(STORAGE_KEY);
    updateCartUI();
  }
  return { getItems, addItem, removeItem, updateQty, getTotal, getCount, clear };
})();

// ── Update Cart UI ──────────────────────────────────────────
function updateCartUI() {
  const count = Cart.getCount();
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
  // Bottom bar
  const bar = document.getElementById('bottomCartBar');
  if (bar) {
    const total = Cart.getTotal();
    const countEl = bar.querySelector('.bc-count');
    const totalEl = bar.querySelector('.bc-total');
    if (countEl) countEl.textContent = `${count} item${count !== 1 ? 's' : ''}`;
    if (totalEl) totalEl.textContent = `₹${total.toFixed(2)}`;
    bar.style.display = count > 0 ? 'flex' : 'none';
  }
}

// ── Toast Notification ──────────────────────────────────────
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
  if (type === 'error') toast.style.background = '#d32f2f';
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 350);
  }, 2800);
}

// ── Navbar ──────────────────────────────────────────────────
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');

  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    });
  }
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open');
      document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }
  // Active link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === currentPage) link.classList.add('active');
  });
}

// ── Scroll-to-Top ───────────────────────────────────────────
function initScrollTop() {
  const btn = document.getElementById('scrollTopBtn');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 300));
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ── Animate on Scroll ───────────────────────────────────────
function initAOS() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('aos-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('[data-aos]').forEach(el => {
    el.classList.add('aos-pending');
    observer.observe(el);
  });
}

// ── Star Rating Render ──────────────────────────────────────
function renderStars(rating, max = 5) {
  let html = '';
  for (let i = 1; i <= max; i++) {
    if (i <= Math.floor(rating)) html += '<i class="fas fa-star"></i>';
    else if (i - rating < 1 && i - rating > 0) html += '<i class="fas fa-star-half-alt"></i>';
    else html += '<i class="far fa-star"></i>';
  }
  return `<span class="stars">${html}</span>`;
}

// ── Format Currency ─────────────────────────────────────────
function formatPrice(amount) {
  return `₹${parseFloat(amount).toFixed(2)}`;
}

// ── Menu Card Builder ───────────────────────────────────────
function buildMenuCard(item) {
  return `
  <div class="menu-card glass-card" data-aos="fadeUp">
    <div class="menu-card__img-wrap">
      <img src="${item.img}" alt="${item.name}" class="menu-card__img" loading="lazy">
      ${item.badge ? `<span class="menu-card__badge">${item.badge}</span>` : ''}
    </div>
    <div class="menu-card__body">
      <div class="menu-card__name">${item.name}</div>
      <div class="menu-card__desc">${item.desc}</div>
      <div class="menu-card__footer">
        <span class="menu-card__price">${formatPrice(item.price)}</span>
        <button class="menu-card__add" onclick="Cart.addItem({id:'${item.id}',name:'${item.name}',price:${item.price},img:'${item.img}'})" title="Add to cart">
          <i class="fas fa-plus"></i>
        </button>
      </div>
    </div>
  </div>`;
}

// ── AOS CSS injection ───────────────────────────────────────
(function injectAOSStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .aos-pending { opacity: 0; transform: translateY(30px); transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.4,0,0.2,1); }
    .aos-pending[data-aos="fadeLeft"] { transform: translateX(-30px); }
    .aos-pending[data-aos="fadeRight"] { transform: translateX(30px); }
    .aos-pending[data-aos="zoomIn"] { transform: scale(0.85); }
    .aos-visible { opacity: 1 !important; transform: none !important; }
  `;
  document.head.appendChild(style);
})();

// ── Modal Helpers ───────────────────────────────────────────
function openModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
}

// ── Init on DOM Ready ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollTop();
  initAOS();
  updateCartUI();
  document.body.classList.add('page-fade-in');
  // Close modal on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      const overlay = btn.closest('.modal-overlay');
      if (overlay) closeModal(overlay.id);
    });
  });
});

// ── Shared Menu Data ────────────────────────────────────────
const MENU_DATA = [
  // Coffee
  { id:'c1', cat:'coffee', name:'Signature Cloud Latte', price:299, desc:'Velvety oat milk latte with a touch of vanilla cloud foam.', img:'coffee.png', badge:'Popular' },
  { id:'c2', cat:'coffee', name:'Caramel Drift Cappuccino', price:279, desc:'Silky espresso with caramel swirl and micro foam art.', img:'coffee.png', badge:'' },
  { id:'c3', cat:'coffee', name:'Brown Sugar Cold Brew', price:319, desc:'24h cold brew with brown sugar syrup and cream pop.', img:'coffee.png', badge:'New' },
  { id:'c4', cat:'coffee', name:'Hazelnut Flat White', price:259, desc:'Double ristretto with hazelnut and silky steamed milk.', img:'coffee.png', badge:'' },
  // Tea
  { id:'t1', cat:'tea', name:'Earl Grey Sky Latte', price:219, desc:'Premium Earl Grey with steamed oat milk and lavender.', img:'pastry.png', badge:'' },
  { id:'t2', cat:'tea', name:'Matcha Cloud Dream', price:249, desc:'Ceremonial grade matcha with whipped cloud cream.', img:'pastry.png', badge:'Popular' },
  { id:'t3', cat:'tea', name:'Rose Hibiscus Bloom', price:199, desc:'Floral herbal blend with hibiscus, rose petals & honey.', img:'pastry.png', badge:'' },
  { id:'t4', cat:'tea', name:'Masala Chai Latte', price:189, desc:'Spiced chai with ginger, cardamom and steamed milk.', img:'pastry.png', badge:'' },
  // Snacks
  { id:'s1', cat:'snacks', name:'Avocado Cloud Toast', price:329, desc:'Sourdough toast with smashed avo, feta, and microgreens.', img:'pastry.png', badge:'New' },
  { id:'s2', cat:'snacks', name:'Truffle Mushroom Bruschetta', price:289, desc:'Toasted baguette with wild mushrooms and truffle oil.', img:'pastry.png', badge:'' },
  { id:'s3', cat:'snacks', name:'Cheese Cloudwich', price:259, desc:'Grilled sandwich with aged cheddar and caramelized onions.', img:'pastry.png', badge:'Popular' },
  // Desserts
  { id:'d1', cat:'desserts', name:'Fluffy Cloud Cake', price:399, desc:'Layered cotton-soft cake with vanilla cream and berries.', img:'pastry.png', badge:'Signature' },
  { id:'d2', cat:'desserts', name:'Caramel Macarons', price:249, desc:'French macarons with salted caramel & coffee ganache.', img:'pastry.png', badge:'' },
  { id:'d3', cat:'desserts', name:'Tiramisu Jar', price:349, desc:'Classic tiramisu with mascarpone and espresso soaked layers.', img:'pastry.png', badge:'Popular' },
  { id:'d4', cat:'desserts', name:'Berry Panna Cotta', price:299, desc:'Silky vanilla panna cotta with seasonal berry compote.', img:'pastry.png', badge:'' },
];
