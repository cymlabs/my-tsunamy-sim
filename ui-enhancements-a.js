// FILE: ui-enhancements-a.js
// Variant A: Safe Premium – Minimal motion, high performance
// Adds fade transitions between panes and subtle hover effects

const UIEnhancements = (() => {
  const config = {
    transitionDuration: 600,
    hoverScale: 1.05,
    hoverDuration: 300,
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  };

  // Detect WebGL support (for logging only in Variant A)
  const hasWebGL = (() => {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('webgl2'));
    } catch (e) {
      return false;
    }
  })();

  // === TRANSITION OVERLAY ===
  function createTransitionOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'transition-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0);
      pointer-events: none;
      z-index: 1000;
      mix-blend-mode: normal;
    `;
    document.body.appendChild(overlay);
    return overlay;
  }

  function fadeTransition() {
    if (config.prefersReducedMotion) return Promise.resolve();

    const overlay = document.getElementById('transition-overlay') || createTransitionOverlay();
    const duration = config.transitionDuration;
    const startTime = performance.now();

    return new Promise((resolve) => {
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Fade in (0 → 0.8), fade out (0.8 → 0)
        const opacity = progress < 0.5 ? progress * 1.6 : (1 - progress) * 1.6;
        overlay.style.background = `rgba(0, 0, 0, ${Math.min(opacity, 0.8)})`;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          overlay.style.background = 'rgba(0, 0, 0, 0)';
          resolve();
        }
      };
      requestAnimationFrame(animate);
    });
  }

  // === HOVER INTERACTION (CSS + JS) ===
  function initHoverEffects() {
    const buttons = document.querySelectorAll('.nav-btn, .pill, .primary, .secondary, .ghost');

    buttons.forEach((btn) => {
      btn.addEventListener('mouseenter', () => {
        if (config.prefersReducedMotion) {
          btn.style.transform = 'scale(1.02)';
        } else {
          btn.style.transition = `transform ${config.hoverDuration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;
          btn.style.transform = `scale(${config.hoverScale})`;
        }
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transition = `transform ${config.hoverDuration}ms ease-out`;
        btn.style.transform = 'scale(1)';
      });
    });
  }

  // === PANE TRANSITION HOOK ===
  function hookPaneTransitions() {
    const navTabs = document.querySelectorAll('.nav-btn');

    navTabs.forEach((tab) => {
      // Store original click handler
      const originalHandler = tab.onclick;

      tab.addEventListener('click', async (e) => {
        // Perform fade transition
        await fadeTransition();
      });
    });
  }

  // === INITIALIZATION ===
  function init() {
    // Only init if DOM is ready
    if (!document.body) {
      console.warn('[UIEnhancements-A] DOM not ready, deferring init');
      setTimeout(init, 100);
      return;
    }

    createTransitionOverlay();
    initHoverEffects();
    hookPaneTransitions();

    console.log('[UIEnhancements-A] Initialized (Safe Premium mode)');
    console.log(`  Prefers reduced motion: ${config.prefersReducedMotion}`);
    console.log(`  WebGL available: ${hasWebGL}`);
  }

  return { init, config, fadeTransition };
})();

// Auto-init when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', UIEnhancements.init);
} else {
  UIEnhancements.init();
}
