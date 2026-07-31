// ===== PRELOADER =====
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    setTimeout(() => preloader.classList.add('loaded'), 400);
  }
});

// ===== TYPING EFFECT NO HERO =====
const phrases = [
  'Desenvolvedor Front-End',
  'Fundador da JS Soluções',
  'Especialista em IA'
];

let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typingEl = document.getElementById('typing-text');

function type() {
  if (!typingEl) return;
  const current = phrases[phraseIndex];

  if (isDeleting) {
    typingEl.textContent = current.substring(0, charIndex - 1);
    charIndex--;
  } else {
    typingEl.textContent = current.substring(0, charIndex + 1);
    charIndex++;
  }

  if (!isDeleting && charIndex === current.length) {
    setTimeout(() => { isDeleting = true; }, 2000);
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
  }

  setTimeout(type, isDeleting ? 55 : 95);
}

type();

// ===== ANIMAÇÃO DOS CARDS DE PROJETO AO ENTRAR NA TELA =====
const cards = document.querySelectorAll('.card');

const cardObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, i * 150);
      cardObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

cards.forEach(card => cardObserver.observe(card));

// ===== MENU MOBILE (hambúrguer -> X) =====
const menuToggle = document.getElementById('menu-toggle');
const nav = document.getElementById('nav-menu');

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuToggle.classList.toggle('active', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
      nav.classList.remove('open');
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// ===== NAVBAR: estado "scrolled" + barra de progresso + botão voltar ao topo =====
const header = document.getElementById('site-header');
const scrollProgress = document.getElementById('scroll-progress');
const backToTop = document.getElementById('back-to-top');

function onScroll() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

  if (header) header.classList.toggle('scrolled', scrollTop > 10);
  if (scrollProgress) scrollProgress.style.width = progress + '%';
  if (backToTop) backToTop.classList.toggle('show', scrollTop > 400);
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ===== SCROLL SPY (destaca o link ativo do menu) =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('#nav-menu a');

const spyObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });

sections.forEach(sec => spyObserver.observe(sec));

// ===== CURSOR CUSTOMIZADO (apenas desktop com mouse) =====
if (window.matchMedia('(pointer: fine)').matches) {
  document.body.classList.add('custom-cursor-active');
  const cursorDot = document.getElementById('cursor-dot');
  const cursorOutline = document.getElementById('cursor-outline');
  let outlineX = 0, outlineY = 0, targetX = 0, targetY = 0;

  document.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    if (cursorDot) {
      cursorDot.style.left = targetX + 'px';
      cursorDot.style.top = targetY + 'px';
    }
  });

  // O contorno segue com um leve atraso (lerp) para efeito suave
  function animateOutline() {
    outlineX += (targetX - outlineX) * 0.18;
    outlineY += (targetY - outlineY) * 0.18;
    if (cursorOutline) {
      cursorOutline.style.left = outlineX + 'px';
      cursorOutline.style.top = outlineY + 'px';
    }
    requestAnimationFrame(animateOutline);
  }
  animateOutline();

  document.querySelectorAll('a, button, .skill-badge, .filter-btn').forEach(el => {
    el.addEventListener('mouseenter', () => cursorOutline && cursorOutline.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => cursorOutline && cursorOutline.classList.remove('cursor-hover'));
  });
}

// ===== CONTADOR ANIMADO DE ESTATÍSTICAS =====
const statNumbers = document.querySelectorAll('.stat-number');

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.getAttribute('data-target'), 10) || 0;
    const duration = 1500;
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
    statsObserver.unobserve(el);
  });
}, { threshold: 0.5 });

statNumbers.forEach(el => statsObserver.observe(el));

// ===== FILTRO DE PROJETOS =====
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.projects .card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.getAttribute('data-filter');

    projectCards.forEach(card => {
      const matches = filter === 'all' || card.getAttribute('data-category') === filter;
      card.classList.toggle('card-hidden', !matches);
    });
  });
});

// ===== FORMULÁRIO DE CONTATO =====
const contactForm = document.getElementById('contact-form');
const formFeedback = document.getElementById('form-feedback');

function validateField(input) {
  const group = input.closest('.form-group');
  let valid = input.value.trim() !== '';

  if (input.type === 'email' && valid) {
    valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
  }

  group.classList.toggle('valid', valid);
  group.classList.toggle('invalid', !valid);
  return valid;
}

if (contactForm) {
  const fields = contactForm.querySelectorAll('input, textarea');
  fields.forEach(field => {
    field.addEventListener('blur', () => validateField(field));
  });

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('cf-name');
    const email = document.getElementById('cf-email');
    const message = document.getElementById('cf-message');
    const allValid = [name, email, message].map(validateField).every(Boolean);

    if (!allValid) {
      formFeedback.textContent = 'Verifique os campos destacados antes de enviar.';
      formFeedback.className = 'form-feedback error';
      return;
    }

    // Sem backend próprio: abre o cliente de e-mail com os dados preenchidos
    const subject = encodeURIComponent(`Contato via site — ${name.value.trim()}`);
    const body = encodeURIComponent(
      `Nome: ${name.value.trim()}\nE-mail: ${email.value.trim()}\n\nMensagem:\n${message.value.trim()}`
    );
    window.location.href = `mailto:jeannsouza27@gmail.com?subject=${subject}&body=${body}`;

    formFeedback.textContent = 'Abrindo seu cliente de e-mail para enviar a mensagem...';
    formFeedback.className = 'form-feedback success';
    contactForm.reset();
    fields.forEach(f => f.closest('.form-group').classList.remove('valid', 'invalid'));
  });

  // Efeito ripple no botão de enviar
  const submitBtn = contactForm.querySelector('.btn-submit');
  if (submitBtn) {
    submitBtn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  }
}

// ===== BIBLIOTECAS EXTERNAS (guardas para caso o CDN falhe) =====
if (typeof AOS !== 'undefined') {
  AOS.init({ duration: 700, once: true, offset: 60 });
}

if (typeof VanillaTilt !== 'undefined') {
  VanillaTilt.init(document.querySelectorAll('[data-tilt]'));
}

if (typeof particlesJS !== 'undefined' && document.getElementById('particles-js')) {
  particlesJS('particles-js', {
    particles: {
      number: { value: 55, density: { enable: true, value_area: 900 } },
      color: { value: '#38bdf8' },
      shape: { type: 'circle' },
      opacity: { value: 0.5, random: true },
      size: { value: 3, random: true },
      line_linked: { enable: true, distance: 140, color: '#38bdf8', opacity: 0.25, width: 1 },
      move: { enable: true, speed: 1.1, direction: 'none', random: true, out_mode: 'out' }
    },
    interactivity: {
      detect_on: 'canvas',
      events: { onhover: { enable: true, mode: 'grab' }, onclick: { enable: false }, resize: true },
      modes: { grab: { distance: 160, line_linked: { opacity: 0.5 } } }
    },
    retina_detect: true
  });
}
