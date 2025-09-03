// -----------------------------
// Footer year
document.getElementById('yy').textContent = new Date().getFullYear();

// -----------------------------

// Scroll-based animations (stay visible after animation)
(function(){
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const els = document.querySelectorAll('[data-anim]');

  els.forEach((el, index) => {
    if (prefersReduced) {
      el.classList.add('in');
      return;
    }

    // Random offsets if not defined
    if (!el.style.getPropertyValue('--tx')) {
      const tx = Math.floor(Math.random() * 40 - 20);
      el.style.setProperty('--tx', `${tx}px`);
    }
    if (!el.style.getPropertyValue('--ty')) {
      const ty = Math.floor(Math.random() * 40 - 20);
      el.style.setProperty('--ty', `${ty}px`);
    }
    if (!el.style.getPropertyValue('--d')) {
      const i = parseInt(el.style.getPropertyValue('--i')) || index;
      el.style.setProperty('--d', `${80 * i + 80}ms`);
    }
  });

  let scrolling = false;

  function animateOnScroll() {
    els.forEach(el => {
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const visible = rect.top < windowHeight && rect.bottom > 0;

      // Only add animation if visible and not already animated
      if (visible && scrolling && !el.classList.contains('in')) {
        el.classList.add('in');
      }
    });
  }

  window.addEventListener('scroll', () => {
    scrolling = true;
    animateOnScroll();

    // Stop "new animations" check after scrolling stops
    clearTimeout(window._scrollTimeout);
    window._scrollTimeout = setTimeout(() => {
      scrolling = false;
      // Do NOT remove 'in', keep displayed
    }, 150);
  });

  // Initial check
  scrolling = true;
  animateOnScroll();
  scrolling = false;
})();
