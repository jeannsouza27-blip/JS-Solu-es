// ===== CONFIGURAÇÃO N8N (chat de IA e formulário de contato) =====
// Ambos os webhooks só aceitam requisições de https://jssolucoes.tech e
// https://www.jssolucoes.tech — em localhost dão erro de CORS (esperado).
const N8N_CHAT_URL = 'https://js-solucoes-n8n-webhook.w49ep4.easypanel.host/webhook/5554e566-8d29-4e0d-b33d-e0219d4bd1a6/chat';
const N8N_FORM_URL = 'https://js-solucoes-n8n-webhook.w49ep4.easypanel.host/webhook/form-site';

// ===== RASTREAMENTO DE EVENTOS (GA4 + Meta Pixel) =====
const GA4_MEASUREMENT_ID = 'G-SEUID';
const META_PIXEL_ID = 'SEUPIXELID';
const COOKIE_CONSENT_KEY = 'jsSolucoesCookieConsent';

function trackEvent(name, params = {}) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, params);
  }
  if (typeof window.fbq === 'function') {
    window.fbq('trackCustom', name, params);
  }
}

function loadGoogleAnalytics() {
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA4_MEASUREMENT_ID);
}

function loadMetaPixel() {
  (function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n; n.loaded = true; n.version = '2.0';
    n.queue = []; t = b.createElement(e); t.async = true;
    t.src = v; s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  window.fbq('init', META_PIXEL_ID);
  window.fbq('track', 'PageView');
}

function loadAnalytics() {
  loadGoogleAnalytics();
  loadMetaPixel();
}

// ===== BANNER DE CONSENTIMENTO DE COOKIES (LGPD) =====
const cookieConsentBanner = document.getElementById('cookie-consent');
const cookieAcceptBtn = document.getElementById('cookie-accept');
const cookieDeclineBtn = document.getElementById('cookie-decline');
const storedCookieConsent = localStorage.getItem(COOKIE_CONSENT_KEY);

if (storedCookieConsent === 'accepted') {
  loadAnalytics();
} else if (!storedCookieConsent && cookieConsentBanner) {
  cookieConsentBanner.hidden = false;
}

if (cookieAcceptBtn) {
  cookieAcceptBtn.addEventListener('click', () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    cookieConsentBanner.hidden = true;
    loadAnalytics();
    openN8nChat();
  });
}

if (cookieDeclineBtn) {
  cookieDeclineBtn.addEventListener('click', () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
    cookieConsentBanner.hidden = true;
  });
}

// ===== EVENTOS DE CONVERSÃO: cliques em links do WhatsApp =====
document.querySelectorAll('a[href^="https://wa.me/"]').forEach(link => {
  link.addEventListener('click', () => {
    const origem = link.dataset.origin || 'outro';
    trackEvent('whatsapp_click', { origem });
    if (link.dataset.cta === 'consultoria') {
      trackEvent('cta_consultoria', { origem });
    }
  });
});

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
    menuToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Abrir menu');
    });
  });

  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
      nav.classList.remove('open');
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Abrir menu');
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

  // Campos opcionais (ex: WhatsApp) não ficam marcados como inválidos vazios
  if (!input.required) {
    group.classList.remove('invalid');
    return true;
  }

  let valid = input.value.trim() !== '';

  if (input.type === 'email' && valid) {
    valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
  }

  group.classList.toggle('valid', valid);
  group.classList.toggle('invalid', !valid);
  return valid;
}

if (contactForm) {
  // O honeypot fica fora da validação/interação normal do formulário
  const fields = contactForm.querySelectorAll('input:not([name="website"]), textarea');
  fields.forEach(field => {
    field.addEventListener('blur', () => validateField(field));
  });

  const submitBtn = contactForm.querySelector('.btn-submit');
  const submitBtnLabel = submitBtn ? submitBtn.querySelector('span') : null;
  const FORM_TIMEOUT_MS = 10000;

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('cf-name');
    const email = document.getElementById('cf-email');
    const whatsapp = document.getElementById('cf-whatsapp');
    const message = document.getElementById('cf-message');
    const website = document.getElementById('cf-website');
    const allValid = [name, email, message].map(validateField).every(Boolean);

    if (!allValid) {
      formFeedback.textContent = 'Verifique os campos destacados antes de enviar.';
      formFeedback.className = 'form-feedback error';
      return;
    }

    if (website && website.value.trim() !== '') {
      // Honeypot preenchido: provável bot. Finge sucesso sem enviar nada ao n8n.
      formFeedback.textContent = 'Recebemos! Respondemos em até 24h úteis.';
      formFeedback.className = 'form-feedback success';
      contactForm.reset();
      return;
    }

    if (submitBtn) submitBtn.disabled = true;
    if (submitBtnLabel) submitBtnLabel.textContent = 'Enviando...';
    formFeedback.textContent = '';
    formFeedback.className = 'form-feedback';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FORM_TIMEOUT_MS);

    try {
      const response = await fetch(N8N_FORM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: name.value.trim(),
          email: email.value.trim(),
          whatsapp: whatsapp ? whatsapp.value.trim() : '',
          mensagem: message.value.trim(),
          origem: 'form-site',
          website: website ? website.value : ''
        }),
        signal: controller.signal
      });

      const data = await response.json().catch(() => null);

      if (data && data.ok) {
        formFeedback.textContent = data.mensagem || 'Recebemos! Respondemos em até 24h úteis.';
        formFeedback.className = 'form-feedback success';
        contactForm.reset();
        fields.forEach(f => f.closest('.form-group').classList.remove('valid', 'invalid'));
        trackEvent('form_submit', { origem: 'form-site' });
      } else {
        formFeedback.textContent = (data && data.mensagem) || 'Não foi possível enviar sua mensagem. Tente novamente.';
        formFeedback.className = 'form-feedback error';
      }
    } catch (error) {
      formFeedback.textContent = 'Não foi possível enviar. Chame no WhatsApp (27) 99794-8088.';
      formFeedback.className = 'form-feedback error';
    } finally {
      clearTimeout(timeoutId);
      if (submitBtn) submitBtn.disabled = false;
      if (submitBtnLabel) submitBtnLabel.textContent = 'Enviar Mensagem';
    }
  });

  // Efeito ripple no botão de enviar
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

// Import dinâmico (em vez de "import" estático no topo do arquivo): se o
// CDN do widget falhar, estiver lento ou for bloqueado por um ad-blocker
// (comum em widgets de chat), isso não pode travar o resto do site —
// menu, formulário, banner de cookies etc. precisam continuar funcionando.
if (n8nChatContainer) {
  import('https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js')
    .then(({ createChat }) => {
      createChat({
        webhookUrl: N8N_CHAT_URL,
        mode: 'window',
        showWelcomeScreen: false,
        enableStreaming: false,
        defaultLanguage: 'en',
        initialMessages: [
          'Olá! 👋 Sou a Ana, da JS Soluções.',
          'Posso fazer um diagnóstico gratuito de como a IA pode reduzir custos na sua empresa. Qual o ramo do seu negócio?'
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
    })
    .catch((err) => {
      console.warn('Não foi possível carregar o widget de chat (rede ou bloqueador de anúncios).', err);
    });
}

// Abre o widget programaticamente. O @n8n/chat (v1.39) não expõe uma API
// pública de abrir/fechar — clicamos no botão flutuante que ele mesmo
// renderiza. Se uma versão futura do pacote mudar essas classes, isso
// para de funcionar e precisa ser revisto.
// Como o widget carrega via import dinâmico, o botão pode ainda não
// existir no instante do clique — tenta de novo por até ~5s antes de
// desistir (ex: CDN bloqueada por um ad-blocker).
function openN8nChat(retriesLeft = 25) {
  const toggle = document.querySelector('#n8n-chat .chat-window-toggle');
  if (!toggle) {
    if (retriesLeft > 0) setTimeout(() => openN8nChat(retriesLeft - 1), 200);
    return;
  }
  const panel = document.querySelector('#n8n-chat .chat-window');
  const isOpen = panel && getComputedStyle(panel).display !== 'none';
  if (!isOpen) toggle.click();
}

const openChatCta = document.getElementById('open-chat-cta');
if (openChatCta) {
  openChatCta.addEventListener('click', openN8nChat);
}

// Dispara chat_open tanto no clique direto no toggle quanto no clique
// programático disparado por openN8nChat() (ambos emitem um evento real).
// Usa a fase de captura para ler o estado ANTES do widget alternar (a
// atualização do Vue é assíncrona, então checar depois do clique pegaria
// sempre o estado antigo).
document.addEventListener('click', (e) => {
  const toggle = e.target.closest('#n8n-chat .chat-window-toggle');
  if (!toggle) return;
  const panel = document.querySelector('#n8n-chat .chat-window');
  const wasOpen = panel && getComputedStyle(panel).display !== 'none';
  if (!wasOpen) trackEvent('chat_open');
}, true);

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

// ===== CONVITE PROATIVO DA ANA (substitui o popup) =====
(function () {
  const KEY = 'jsAnaTeaserShown';
  const DELAY_MS = 8000;
  try { if (sessionStorage.getItem(KEY)) return; } catch (e) {}
  function chatIsOpen() {
    const panel = document.querySelector('#n8n-chat .chat-window');
    return panel && getComputedStyle(panel).display !== 'none';
  }
  const timer = setTimeout(showTeaser, DELAY_MS);
  document.addEventListener('click', (e) => {
    if (e.target.closest('#n8n-chat .chat-window-toggle')) clearTimeout(timer);
  }, true);
  function showTeaser() {
    const toggle = document.querySelector('#n8n-chat .chat-window-toggle');
    if (!toggle || chatIsOpen()) return;
    // O banner de cookies ocupa quase a largura toda no mobile: espera ele
    // ser fechado (aceitar/recusar) antes de mostrar o balão, pra não
    // sobrepor os botões do banner. Sem polling: reage ao clique em
    // Aceitar/Recusar (ou ao usuário abrir o chat antes disso, cancelando
    // a espera). Não marca KEY aqui — se o visitante sair sem fechar o
    // banner, o balão ainda deve poder aparecer numa próxima página da
    // mesma visita.
    const cookieBanner = document.getElementById('cookie-consent');
    if (cookieBanner && !cookieBanner.hidden) {
      const onWaitClick = (e) => {
        if (e.target.closest('#cookie-accept, #cookie-decline')) {
          document.removeEventListener('click', onWaitClick, true);
          setTimeout(showTeaser, 2000); // respiro pra não surgir junto do clique
        } else if (e.target.closest('#n8n-chat .chat-window-toggle')) {
          document.removeEventListener('click', onWaitClick, true);
        }
      };
      document.addEventListener('click', onWaitClick, true);
      return;
    }
    try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
    const teaser = document.createElement('div');
    teaser.className = 'ana-teaser';
    teaser.setAttribute('role', 'button');
    teaser.tabIndex = 0;
    teaser.innerHTML =
      '<button type="button" class="ana-teaser-close" aria-label="Fechar">×</button>' +
      '<strong>Ana • JS Soluções</strong>' +
      '<p>Quer um diagnóstico gratuito de como a IA pode reduzir custos na sua empresa? Posso te ajudar agora 👋</p>';
    document.body.appendChild(teaser);
    if (typeof trackEvent === 'function') trackEvent('ana_teaser_view');
    const close = () => teaser.remove();
    const openChat = () => {
      close();
      if (!chatIsOpen()) toggle.click();
      if (typeof trackEvent === 'function') trackEvent('ana_teaser_click');
    };
    teaser.querySelector('.ana-teaser-close').addEventListener('click', (e) => { e.stopPropagation(); close(); });
    teaser.addEventListener('click', openChat);
    teaser.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openChat(); }
    });
    toggle.addEventListener('click', close, { once: true });
  }
})();
