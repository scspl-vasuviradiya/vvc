/* ===================================
   MODERN ANIMATIONS SYSTEM
   Vivah Villa Collection 2024
   ===================================*/

(function() {
  'use strict';

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Animation observer for performance
  let animationObserver;
  
  // Initialize animations when DOM is loaded
  function initAnimations() {
    if (prefersReducedMotion) {
      // Skip animations for users who prefer reduced motion
      document.querySelectorAll('[data-anim]').forEach(el => {
        el.classList.add('in');
      });
      return;
    }

    // Use Intersection Observer for better performance
    if ('IntersectionObserver' in window) {
      animationObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('in')) {
              // Add a small delay for staggered animations
              const delay = entry.target.dataset.delay || entry.target.style.getPropertyValue('--d') || '0ms';
              
              setTimeout(() => {
                entry.target.classList.add('in');
              }, parseInt(delay));
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px'
        }
      );

      // Observer all elements with data-anim attribute
      document.querySelectorAll('[data-anim]').forEach(el => {
        // Set default delay if not specified
        if (!el.style.getPropertyValue('--d') && !el.dataset.delay) {
          const siblings = Array.from(el.parentElement?.children || []);
          const index = siblings.indexOf(el);
          el.style.setProperty('--d', `${index * 100}ms`);
        }
        
        animationObserver.observe(el);
      });
    } else {
      // Fallback for older browsers
      fallbackScrollAnimation();
    }
  }

  // Fallback animation system for older browsers
  function fallbackScrollAnimation() {
    let ticking = false;
    
    function animateOnScroll() {
      const elements = document.querySelectorAll('[data-anim]:not(.in)');
      
      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        if (rect.top < windowHeight * 0.8 && rect.bottom > 0) {
          el.classList.add('in');
        }
      });
      
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(animateOnScroll);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    
    // Initial check
    animateOnScroll();
  }

  // Smooth scroll polyfill for older browsers
  function initSmoothScroll() {
    // Check if smooth scroll is supported
    if (!('scrollBehavior' in document.documentElement.style)) {
      // Load smooth scroll polyfill for older browsers
      const smoothScrollScript = document.createElement('script');
      smoothScrollScript.src = 'https://cdn.jsdelivr.net/gh/cferdinandi/smooth-scroll@15.0.0/dist/smooth-scroll.polyfills.min.js';
      document.head.appendChild(smoothScrollScript);
      
      smoothScrollScript.onload = function() {
        if (window.SmoothScroll) {
          new SmoothScroll('a[href*="#"]', {
            speed: 500,
            speedAsDuration: true,
            easing: 'easeInOutCubic',
            offset: 80
          });
        }
      };
    }
  }

  // Header scroll effect
  function initHeaderEffects() {
    const header = document.querySelector('.header');
    if (!header) return;

    let lastScroll = 0;
    let ticking = false;

    function updateHeader() {
      const currentScroll = window.pageYOffset;
      
      if (currentScroll > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      
      // Hide header on scroll down, show on scroll up
      if (currentScroll > lastScroll && currentScroll > 200) {
        header.style.transform = 'translateY(-100%)';
      } else {
        header.style.transform = 'translateY(0)';
      }
      
      lastScroll = currentScroll;
      ticking = false;
    }

    function onHeaderScroll() {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onHeaderScroll, { passive: true });
  }

  // Utility function to update footer year
  function updateFooterYear() {
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  }

  // Add loading class to body
  document.body.classList.add('loading');
  
  // Initialize everything when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      initAnimations();
      initSmoothScroll();
      initHeaderEffects();
      updateFooterYear();
      
      // Remove loading class
      document.body.classList.remove('loading');
    });
  } else {
    // DOM already loaded
    initAnimations();
    initSmoothScroll();
    initHeaderEffects();
    updateFooterYear();
    document.body.classList.remove('loading');
  }

  // Clean up observer on page unload
  window.addEventListener('beforeunload', function() {
    if (animationObserver) {
      animationObserver.disconnect();
    }
  });

})();
