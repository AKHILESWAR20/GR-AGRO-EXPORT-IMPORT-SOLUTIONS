// ── Nav scroll effect

  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    document.getElementById('scrollTop').classList.toggle('visible', window.scrollY > 400);
  });

  // ── Mobile menu
  function toggleMenu() {
    document.getElementById('mobileMenu').classList.toggle('open');
  }

  // ── Scroll reveal
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); }
    });
  }, { threshold: 0.12 });
  reveals.forEach(r => observer.observe(r));

  // ── Counter animation
  function animateCounter(el, target, duration = 1800) {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { el.textContent = target.toLocaleString(); clearInterval(timer); return; }
      el.textContent = Math.floor(start).toLocaleString();
    }, 16);
  }

  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const target = +e.target.dataset.target;
        animateCounter(e.target, target);
        counterObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat-num[data-target]').forEach(el => counterObs.observe(el));

  // ── Inquiry form
  // ── Inquiry form (REAL BACKEND, SAME UI FEEL)
const form = document.querySelector(".inquiry-form");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = form.querySelector(".form-submit");

    const data = {
      name: form.querySelector('input[type="text"]').value,
      email: form.querySelector('input[type="email"]').value,
      service: form.querySelector("select")?.value || "",
      message: form.querySelector("textarea").value
    };

    btn.textContent = "Sending...";
    btn.disabled = true;

    try {
      const res = await fetch("https://gr-agro-export-import-solutions.onrender.com/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      await res.json();

      // ✅ SAME PREMIUM SUCCESS FEEL
      btn.textContent = "✓ Inquiry Sent!";
      btn.style.background = "#2d8a4e";

    } catch (err) {
      console.error(err);

      btn.textContent = "Failed!";
      btn.style.background = "#c0392b";
    }

    setTimeout(() => {
      btn.textContent = "Send Inquiry";
      btn.style.background = "";
      btn.disabled = false;
    }, 3000);
  });
<<<<<<< HEAD
}
=======
}
>>>>>>> 75ee7dc8fe97ee908cca227c253795cfe5530868
