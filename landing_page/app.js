/**
 * Billing Studio — Landing Page App Logic
 * Handles:
 *  - Apple-style sticky scroll story
 *  - Progress indicator dots
 *  - Scroll reveals
 *  - Animated counters
 *  - Nav transparency
 */
document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. Rebuild scroll story into sticky layout ── */
  const storyEl = document.getElementById('scroll-story')
  const STEP_PANELS = document.querySelectorAll('.story-step')
  const STEPS = STEP_PANELS.length  // 6

  if (storyEl && STEPS > 0) {
    // Set story height to allow scroll space
    storyEl.style.height = `${STEPS * 100}vh`
    storyEl.style.position = 'relative'

    // Create sticky container
    const stickyWrap = document.createElement('div')
    stickyWrap.id = 'story-sticky-wrap'
    stickyWrap.style.cssText = `
      position: sticky;
      top: 0;
      height: 100vh;
      overflow: hidden;
      z-index: 10;
    `

    // Move all panels into sticky wrap
    const panelStore = []
    STEP_PANELS.forEach((panel) => {
      const stepIdx = parseInt(panel.dataset.step || '0', 10)
      const text = panel.querySelector('.story-text-block')

      // Create positioned overlay
      const overlay = document.createElement('div')
      overlay.className = 'story-panel' + (panel.querySelector('.center') ? ' center' : (panel.querySelector('.right') ? ' right' : ''))
      overlay.dataset.step = stepIdx

      if (text) {
        const wrapper = document.createElement('div')
        wrapper.className = 'wrap'
        const inner = document.createElement('div')
        inner.className = 'story-text' + (panel.querySelector('.center') ? ' center' : '')
        inner.innerHTML = text.innerHTML
        wrapper.appendChild(inner)
        overlay.appendChild(wrapper)
      }

      stickyWrap.appendChild(overlay)
      panelStore.push(overlay)
    })

    storyEl.innerHTML = ''
    storyEl.appendChild(stickyWrap)

    // Build progress dots
    const dotsWrap = document.createElement('div')
    dotsWrap.className = 'progress-dots'
    dotsWrap.setAttribute('aria-hidden', 'true')
    panelStore.forEach((_, i) => {
      const dot = document.createElement('div')
      dot.className = 'progress-dot' + (i === 0 ? ' active' : '')
      dot.addEventListener('click', () => {
        const targetScroll = storyEl.offsetTop + (i / (STEPS - 1)) * (storyEl.offsetHeight - window.innerHeight)
        window.scrollTo({ top: targetScroll, behavior: 'smooth' })
      })
      dotsWrap.appendChild(dot)
    })
    document.body.appendChild(dotsWrap)

    /* ── Scroll handler for story panels ── */
    let currentStep = -1

    function updateStory() {
      const rect = storyEl.getBoundingClientRect()
      const scrolled = -rect.top
      const totalScroll = storyEl.offsetHeight - window.innerHeight
      const rawProgress = Math.max(0, Math.min(scrolled / totalScroll, 1))

      // Which step are we on?
      const stepF = rawProgress * (STEPS - 1)
      const step = Math.round(stepF)

      if (step !== currentStep) {
        currentStep = step

        panelStore.forEach((panel, i) => {
          panel.classList.remove('active', 'exiting')
          if (i === step) {
            panel.classList.add('active')
          } else if (i < step) {
            panel.classList.add('exiting')
          }
        })

        // Update dots
        dotsWrap.querySelectorAll('.progress-dot').forEach((dot, i) => {
          dot.classList.toggle('active', i === step)
        })
      }

      // Show/hide progress dots (only while in story section)
      const inStory = scrolled > 0 && scrolled < totalScroll
      dotsWrap.style.opacity = inStory ? '1' : '0'
    }

    // Activate first panel immediately
    if (panelStore[0]) panelStore[0].classList.add('active')

    window.addEventListener('scroll', updateStory, { passive: true })
    updateStory()
  }

  /* ── 2. Nav scroll ── */
  const nav = document.querySelector('.nav')
  window.addEventListener('scroll', () => {
    nav?.classList.toggle('solid', window.scrollY > 50)
  }, { passive: true })

  /* ── 3. Reveal on scroll ── */
  const reveals = document.querySelectorAll('.reveal')
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target) }
      }),
      { threshold: 0.12 }
    )
    reveals.forEach((el) => io.observe(el))
  } else {
    reveals.forEach((el) => el.classList.add('visible'))
  }

  /* ── 4. Animated counters ── */
  function animateCounter(el) {
    const target = parseFloat(el.dataset.target || '0')
    const isDecimal = String(target).includes('.')
    const suffix = el.dataset.suffix || ''
    const duration = 1600
    const start = performance.now()

    const update = (now) => {
      const p = Math.min((now - start) / duration, 1)
      const ease = p === 1 ? 1 : 1 - Math.pow(2, -10 * p)
      const val = target * ease
      el.textContent = (isDecimal ? val.toFixed(1) : Math.floor(val).toLocaleString('en-IN')) + suffix
      if (p < 1) requestAnimationFrame(update)
    }
    requestAnimationFrame(update)
  }

  if ('IntersectionObserver' in window) {
    const cio = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { animateCounter(e.target); cio.unobserve(e.target) }
      }),
      { threshold: 0.5 }
    )
    document.querySelectorAll('[data-target]').forEach((el) => cio.observe(el))
  }

})
