/**
 * BILLING STUDIO — ADVANCED KINETIC ANIME.JS & INTERACTION ENGINE
 * Kinetic cursor, scramble text decoder, click particle bursts, magnetic buttons & HUD telemetry
 */

document.addEventListener('DOMContentLoaded', () => {

  const storyTrack = document.getElementById('product-story');
  const panels = document.querySelectorAll('.story-panel');
  const stepDots = document.querySelectorAll('.step-dot');
  const stepCounter = document.getElementById('step-counter');
  const hudModeText = document.getElementById('hud-mode-text');
  const studioNav = document.getElementById('studioNav');

  const HUD_TITLES = [
    '01 // 3D EXPLODED INVOICE ENGINE',
    '02 // DECONSTRUCTED ITEM CATALOG',
    '03 // AUTONOMOUS TAX SPLIT INTELLIGENCE',
    '04 // 1-TAP OMNICHANNEL DISPATCH',
    '05 // LIVE REVENUE RADAR & LEDGER'
  ];

  let currentActiveStep = 0;

  /* ── 1. Click Particle Fireworks Burst (Anime.js) — polished physics ── */
  window.addEventListener('click', (e) => {
    if (typeof anime === 'undefined') return;

    const burstContainer = document.createElement('div');
    burstContainer.style.cssText = `
      position: fixed;
      left: ${e.clientX}px;
      top: ${e.clientY}px;
      pointer-events: none;
      z-index: 10000;
    `;
    document.body.appendChild(burstContainer);

    const PARTICLE_COUNT = 18;
    const particles = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = document.createElement('div');
      const size = 3 + Math.random() * 6;
      const isSquare = Math.random() > 0.65;
      p.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        border-radius: ${isSquare ? '2px' : '50%'};
        background: ${['#2563EB', '#60A5FA', '#93C5FD', '#1D4ED8', '#3B82F6'][Math.floor(Math.random() * 5)]};
        box-shadow: 0 0 6px rgba(37, 99, 235, 0.5);
      `;
      burstContainer.appendChild(p);
      particles.push(p);
    }

    anime({
      targets: particles,
      translateX: () => (Math.random() - 0.5) * 140,
      translateY: () => (Math.random() - 0.5) * 140,
      scale: [{ value: 1.4, duration: 60 }, { value: 0, duration: 680 }],
      rotate: () => (Math.random() - 0.5) * 720,
      opacity: [{ value: 1, duration: 40 }, { value: 0, duration: 680 }],
      easing: 'easeOutExpo',
      duration: 750,
      delay: anime.stagger(20, { from: 'center' }),
      complete: () => burstContainer.remove()
    });
  });

  /* ── 2. Kinetic Chapter Transition with Word-Split Reveal (Anime.js) ── */
  function wrapWordsInSpans(el) {
    if (!el || el.dataset.split) return;
    el.dataset.split = '1';
    el.innerHTML = el.textContent
      .split(' ')
      .map(w => `<span style="display:inline-block;will-change:transform;overflow:hidden;"><span class="word-inner" style="display:inline-block;">${w}\u00A0</span></span>`)
      .join('');
  }

  function animatePanelEntry(panel) {
    if (typeof anime === 'undefined') return;

    const headline = panel.querySelector('.headline-hero, .headline-section');
    const badge    = panel.querySelector('.eyebrow-tag, .step-badge');
    const desc     = panel.querySelector('.desc-lead');
    const cards    = panel.querySelectorAll('.metric-card, .pill-item');
    const actions  = panel.querySelector('.hero-actions');

    // Word-split headline reveal
    if (headline) {
      wrapWordsInSpans(headline);
      anime({
        targets: headline.querySelectorAll('.word-inner'),
        translateY: ['105%', '0%'],
        opacity: [0, 1],
        duration: 700,
        delay: anime.stagger(55),
        easing: 'easeOutCubic'
      });
    }

    // Badge pop + slide
    anime({
      targets: badge,
      opacity: [0, 1],
      translateY: [12, 0],
      scale: [0.9, 1.0],
      duration: 450,
      easing: 'easeOutBack(1.5)'
    });

    // Description fade-up
    anime({
      targets: desc,
      opacity: [0, 1],
      translateY: [14, 0],
      duration: 560,
      delay: 200,
      easing: 'easeOutQuad'
    });

    // Feature cards — cascade
    if (cards.length) {
      anime({
        targets: cards,
        opacity: [0, 1],
        translateY: [18, 0],
        scale: [0.96, 1.0],
        delay: anime.stagger(70, { start: 280 }),
        duration: 480,
        easing: 'easeOutExpo'
      });
    }

    // CTA buttons — spring bounce
    if (actions) {
      anime({
        targets: actions.querySelectorAll('.btn, a'),
        opacity: [0, 1],
        translateY: [14, 0],
        scale: [0.94, 1.0],
        delay: anime.stagger(60, { start: 360 }),
        duration: 520,
        easing: 'easeOutBack(1.2)'
      });
    }
  }

  /* ── 3. Cyberpunk / High-Tech Scramble Text Decoder ── */
  const SCRAMBLE_CHARS = 'ABCDEF0123456789%#$@*+';

  function scrambleTextEffect(element, originalText) {
    let iteration = 0;
    const maxIterations = originalText.length;
    const interval = setInterval(() => {
      element.innerText = originalText
        .split('')
        .map((char, index) => {
          if (char === ' ' || char === '\n') return char;
          if (index < iteration) return originalText[index];
          return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        })
        .join('');

      if (iteration >= maxIterations) {
        clearInterval(interval);
        element.innerText = originalText;
      }
      iteration += 1 / 2;
    }, 25);
  }


  /* ── 5. Scroll Chapter Controller ── */
  function updateScrollState() {
    if (!storyTrack) return;

    if (window.scrollY > 40) {
      studioNav?.classList.add('scrolled');
    } else {
      studioNav?.classList.remove('scrolled');
    }

    const rect = storyTrack.getBoundingClientRect();
    const totalDist = storyTrack.offsetHeight - window.innerHeight;
    const currentScroll = Math.max(0, -rect.top);
    const progress = Math.min(Math.max(currentScroll / totalDist, 0), 1);

    const totalSteps = panels.length;
    const stepIdx = Math.min(Math.floor(progress * totalSteps), totalSteps - 1);

    if (stepIdx !== currentActiveStep) {
      currentActiveStep = stepIdx;

      panels.forEach((panel, idx) => {
        if (idx === stepIdx) {
          panel.classList.add('active');
          panel.classList.remove('exiting-up');
          animatePanelEntry(panel);
        } else if (idx < stepIdx) {
          panel.classList.remove('active');
          panel.classList.add('exiting-up');
        } else {
          panel.classList.remove('active', 'exiting-up');
        }
      });

      // Stepper Dots — kinetic spring pulse
      stepDots.forEach((dot, idx) => {
        const isActive = idx === stepIdx;
        dot.classList.toggle('active', isActive);
        if (typeof anime !== 'undefined') {
          anime({
            targets: dot,
            scale: isActive ? [0.5, 1.35, 1.0] : [1.0, 0.85, 1.0],
            duration: isActive ? 600 : 350,
            easing: isActive ? 'easeOutElastic(1.2, 0.5)' : 'easeOutQuad'
          });
        }
      });

      // Telemetry HUD — flip-style counter
      if (stepCounter) {
        if (typeof anime !== 'undefined') {
          anime({
            targets: stepCounter,
            rotateX: ['90deg', '0deg'],
            opacity: [0, 1],
            scale: [1.2, 1.0],
            duration: 420,
            easing: 'easeOutBack(1.4)',
            begin: () => { stepCounter.textContent = `0${stepIdx + 1} / 05`; }
          });
        } else {
          stepCounter.textContent = `0${stepIdx + 1} / 05`;
        }
      }

      if (hudModeText && HUD_TITLES[stepIdx]) {
        hudModeText.textContent = HUD_TITLES[stepIdx];
      }
    }
  }

  window.addEventListener('scroll', updateScrollState, { passive: true });
  updateScrollState();
  if (panels[0]) animatePanelEntry(panels[0]);

  // Stepper Dot Clicks
  stepDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.getAttribute('data-index') || '0', 10);
      if (!storyTrack) return;
      const totalDist = storyTrack.offsetHeight - window.innerHeight;
      const targetScroll = storyTrack.offsetTop + (idx / (panels.length - 1)) * totalDist;
      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    });
  });

  /* ── 6. Anime.js Magnetic Interactive Buttons — tighter spring ── */
  const magneticButtons = document.querySelectorAll('.btn-primary-action, .btn-primary-nav, .btn-cta-main');
  magneticButtons.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      if (typeof anime !== 'undefined') {
        anime({
          targets: btn,
          translateX: x * 0.32,
          translateY: y * 0.32,
          scale: 1.04,
          duration: 120,
          easing: 'easeOutQuad'
        });
      }
    });

    btn.addEventListener('mouseleave', () => {
      if (typeof anime !== 'undefined') {
        anime({
          targets: btn,
          translateX: 0,
          translateY: 0,
          scale: 1.0,
          duration: 700,
          easing: 'easeOutElastic(1.1, 0.42)'
        });
      }
    });

    // Extra: subtle shimmer scale on mouseenter
    btn.addEventListener('mouseenter', () => {
      if (typeof anime !== 'undefined') {
        anime({
          targets: btn,
          scale: [1.0, 1.055, 1.04],
          duration: 300,
          easing: 'easeOutBack(1.5)'
        });
      }
    });
  });

  /* ── 7. Bento Spotlight Coordinates ── */
  const bentoCards = document.querySelectorAll('.bento-card, .pricing-tier');
  bentoCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  /* ── 8. Metric Values — staggered spring-pop reveal ── */
  const countElements = document.querySelectorAll('.metric-val');
  if ('IntersectionObserver' in window) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && typeof anime !== 'undefined') {
          const el = entry.target;
          anime({
            targets: el,
            scale: [0.6, 1.1, 1.0],
            opacity: [0, 1],
            rotateZ: ['-4deg', '2deg', '0deg'],
            duration: 700,
            easing: 'easeOutElastic(1.1, 0.5)'
          });
          countObserver.unobserve(el);
        }
      });
    }, { threshold: 0.25 });

    countElements.forEach((el) => countObserver.observe(el));
  }

});
