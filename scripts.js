import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';

// ===== CONFIGURAÇÃO N8N (chat de IA e formulário de contato) =====
// Ambos os webhooks só aceitam requisições de https://jssolucoes.tech e
// https://www.jssolucoes.tech — em localhost dão erro de CORS (esperado).
const N8N_CHAT_URL = 'https://js-solucoes-n8n-editor.w49ep4.easypanel.host/webhook/5554e566-8d29-4e0d-b33d-e0219d4bd1a6/chat';
const N8N_FORM_URL = 'https://js-solucoes-n8n-editor.w49ep4.easypanel.host/webhook/form-site';

// ===== PRELOADER =====
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    setTimeout(() => preloader.classList.add('loaded'), 400);
  }
});

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

// ===== FAQ (acordeão) =====
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
  const question = item.querySelector('.faq-question');
  if (!question) return;

  question.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');

    faqItems.forEach(other => {
      other.classList.remove('open');
      other.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
    });

    if (!isOpen) {
      item.classList.add('open');
      question.setAttribute('aria-expanded', 'true');
    }
  });
});

// ===== POP-UP DE CAPTURA DE LEAD =====
const leadPopup = document.getElementById('lead-popup');
const leadPopupClose = document.getElementById('lead-popup-close');
const leadPopupForm = document.getElementById('lead-popup-form');

if (leadPopup && leadPopupClose && leadPopupForm) {
  const LEAD_POPUP_KEY = 'jsSolucoesLeadPopupShown';

  function showLeadPopup() {
    if (sessionStorage.getItem(LEAD_POPUP_KEY)) return;
    leadPopup.hidden = false;
    sessionStorage.setItem(LEAD_POPUP_KEY, '1');
  }

  function hideLeadPopup() {
    leadPopup.hidden = true;
  }

  const popupTimer = setTimeout(showLeadPopup, 30000);

  // Exit-intent: mouse saindo pela borda superior da janela (desktop)
  document.addEventListener('mouseleave', (e) => {
    if (e.clientY <= 0) {
      clearTimeout(popupTimer);
      showLeadPopup();
    }
  });

  leadPopupClose.addEventListener('click', hideLeadPopup);
  leadPopup.addEventListener('click', (e) => {
    if (e.target === leadPopup) hideLeadPopup();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !leadPopup.hidden) hideLeadPopup();
  });

  leadPopupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('lp-name').value.trim();
    const phone = document.getElementById('lp-phone').value.trim();
    const text = encodeURIComponent(
      `Olá! Me chamo ${name} (WhatsApp: ${phone}) e quero receber o diagnóstico gratuito de automação da JS Soluções.`
    );
    window.open(`https://wa.me/5527997948088?text=${text}`, '_blank', 'noopener');
    hideLeadPopup();
    leadPopupForm.reset();
  });
}

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

// ===== WIDGET DE CHAT COM O AGENTE DE IA (n8n) =====
const n8nChatContainer = document.getElementById('n8n-chat');

if (n8nChatContainer) {
  createChat({
    webhookUrl: N8N_CHAT_URL,
    mode: 'window',
    showWelcomeScreen: false,
    enableStreaming: true,
    defaultLanguage: 'en',
    initialMessages: [
      'Olá! 👋 Sou a Ana, assistente virtual da JS Soluções.',
      'Me conta: qual o ramo da sua empresa e o que você gostaria de automatizar?'
    ],
    i18n: {
      en: {
        title: 'Ana • JS Soluções',
        subtitle: 'Respondo na hora, 24h por dia',
        inputPlaceholder: 'Digite sua mensagem...',
        getStarted: 'Nova conversa',
        footer: '',
        closeButtonTooltip: 'Fechar'
      }
    }
  });
}

// Abre o widget programaticamente. O @n8n/chat (v1.39) não expõe uma API
// pública de abrir/fechar — clicamos no botão flutuante que ele mesmo
// renderiza. Se uma versão futura do pacote mudar essas classes, isso
// para de funcionar e precisa ser revisto.
function openN8nChat() {
  const toggle = document.querySelector('#n8n-chat .chat-window-toggle');
  if (!toggle) return;
  const panel = document.querySelector('#n8n-chat .chat-window');
  const isOpen = panel && getComputedStyle(panel).display !== 'none';
  if (!isOpen) toggle.click();
}

const openChatCta = document.getElementById('open-chat-cta');
if (openChatCta) {
  openChatCta.addEventListener('click', openN8nChat);
}

// ===== BIBLIOTECAS EXTERNAS (guardas para caso o CDN falhe) =====
if (typeof AOS !== 'undefined') {
  AOS.init({ duration: 700, once: true, offset: 60 });
}

if (typeof VanillaTilt !== 'undefined') {
  VanillaTilt.init(document.querySelectorAll('[data-tilt]'));
}

// ===== PARTICLES.JS — carregado sob demanda, só em desktop e sem prefers-reduced-motion =====
const particlesContainer = document.getElementById('particles-js');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobileViewport = window.matchMedia('(max-width: 767px)').matches;

if (particlesContainer && !prefersReducedMotion && !isMobileViewport) {
  const particlesScript = document.createElement('script');
  particlesScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/particles.js/2.0.0/particles.min.js';
  particlesScript.onload = () => {
    if (typeof particlesJS === 'undefined') return;
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
  };
  document.body.appendChild(particlesScript);
}
