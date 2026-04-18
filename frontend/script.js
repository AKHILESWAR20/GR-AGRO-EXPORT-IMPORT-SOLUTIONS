// ─────────────────────────────────────────
// script.js — GR Global Agro
// ─────────────────────────────────────────

const BASE_URL = "https://gr-agro-export-import-solutions.onrender.com/api";

// ── Nav scroll effect
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    const scrollBtn = document.getElementById('scrollTop');
    if (scrollBtn) scrollBtn.classList.toggle('visible', window.scrollY > 400);
  });
}

// ── Mobile menu open/close
function toggleMenu() {
  const menu    = document.getElementById('mobileMenu');
  const overlay = document.getElementById('menuOverlay');
  if (!menu) return;
  if (menu.classList.contains('open')) {
    closeMenu();
  } else {
    menu.classList.add('open');
    if (overlay) overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

function closeMenu() {
  const menu    = document.getElementById('mobileMenu');
  const overlay = document.getElementById('menuOverlay');
  if (menu)    menu.classList.remove('open');
  if (overlay) overlay.classList.remove('show');
  document.body.style.overflow = '';
}

// Close on ESC key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMenu();
});

// ── Scroll reveal
const reveals  = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.12 });
reveals.forEach(r => observer.observe(r));

// ── Counter animation
function animateCounter(el, target, duration = 1800) {
  let start = 0;
  const step  = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) { el.textContent = target.toLocaleString(); clearInterval(timer); return; }
    el.textContent = Math.floor(start).toLocaleString();
  }, 16);
}

const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCounter(e.target, +e.target.dataset.target);
      counterObs.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-num[data-target]').forEach(el => counterObs.observe(el));

// ── Load Products from Backend
async function loadProducts() {
  const container = document.getElementById('productContainer');
  if (!container) return;

  container.innerHTML = `<div style="text-align:center;padding:40px;grid-column:1/-1"><i class="fas fa-spinner fa-spin" style="font-size:2rem;color:#C9A84C"></i></div>`;

  try {
    const res  = await fetch(`${BASE_URL}/products`);
    const data = await res.json();

    if (data.success && data.products && data.products.length > 0) {
      container.innerHTML = data.products.slice(0, 4).map((p, i) => `
        <div class="product-card reveal" style="transition-delay:${i * 0.1}s">
          <div class="product-img">
            <span class="product-tag">${p.stock_status || 'Export'}</span>
            <i class="fas fa-box-open"></i>
          </div>
          <div class="product-info">
            <h4>${p.name}</h4>
            <p>${p.description || 'Available for international trade. MOQ applicable.'}</p>
            <p style="margin-top:6px;font-weight:700;color:#C9A84C">
              Rs.${parseFloat(p.price).toLocaleString()} / ${p.unit || 'unit'}
            </p>
            <a href="login.html">Inquire Now</a>
          </div>
        </div>`).join('');
      container.querySelectorAll('.reveal').forEach(r => observer.observe(r));
    } else {
      // Keep default placeholder cards if no products yet
      container.innerHTML = `
        <div class="product-card reveal">
          <div class="product-img"><span class="product-tag">Export</span><i class="fas fa-box-open"></i></div>
          <div class="product-info"><h4>Agricultural Products</h4><p>Premium quality agri exports. MOQ applicable.</p><a href="login.html">Inquire Now</a></div>
        </div>
        <div class="product-card reveal" style="transition-delay:0.1s">
          <div class="product-img"><span class="product-tag">Import</span><i class="fas fa-cubes"></i></div>
          <div class="product-info"><h4>Imported Commodities</h4><p>Premium imported goods sourced globally.</p><a href="login.html">Inquire Now</a></div>
        </div>
        <div class="product-card reveal" style="transition-delay:0.2s">
          <div class="product-img"><span class="product-tag">Export</span><i class="fas fa-industry"></i></div>
          <div class="product-info"><h4>Industrial Goods</h4><p>Industrial grade. Bulk orders welcome.</p><a href="login.html">Inquire Now</a></div>
        </div>
        <div class="product-card reveal" style="transition-delay:0.3s">
          <div class="product-img" style="background:linear-gradient(135deg,#1a3a2a,#2d5a3d)"><span class="product-tag">New</span><i class="fas fa-seedling"></i></div>
          <div class="product-info"><h4>Organic Products</h4><p>Newly added. Contact us for specifications.</p><a href="login.html">Inquire Now</a></div>
        </div>`;
      container.querySelectorAll('.reveal').forEach(r => observer.observe(r));
    }
  } catch(err) {
    console.error('Products error:', err);
    container.innerHTML = `<div style="text-align:center;padding:40px;grid-column:1/-1;color:#6B7280"><p>Products coming soon. <a href="login.html" style="color:#C9A84C">Login to inquire.</a></p></div>`;
  }
}

// ── Contact Form
const form = document.querySelector(".inquiry-form");
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn     = form.querySelector(".form-submit");
    const allText = form.querySelectorAll('input[type="text"]');
    const name    = allText[0]?.value?.trim() || '';
    const email   = form.querySelector('input[type="email"]')?.value?.trim() || '';
    const service = form.querySelector('select')?.value || 'General';
    const message = form.querySelector('textarea')?.value?.trim() || '';

    if (!name || !email || !message) {
      alert('Please fill in all required fields.');
      return;
    }

    btn.textContent = "Sending...";
    btn.disabled    = true;

    try {
      const res    = await fetch(`${BASE_URL}/contact`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, email, service, message })
      });
      const result = await res.json();

      if (result.success) {
        btn.textContent      = "✓ Inquiry Sent!";
        btn.style.background = "#2d8a4e";
        form.reset();
      } else {
        btn.textContent      = "❌ Failed! Try Again";
        btn.style.background = "#e74c3c";
        console.error('Error:', result.message);
      }
    } catch (err) {
      btn.textContent      = "❌ Server Error!";
      btn.style.background = "#e74c3c";
      console.error(err);
    }

    setTimeout(() => {
      btn.textContent      = "Send Inquiry";
      btn.style.background = "";
      btn.disabled         = false;
    }, 3000);
  });
}
