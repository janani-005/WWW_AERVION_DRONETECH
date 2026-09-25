/**
 * AERVION DRONETECH SOLUTIONS PVT. LTD. - Scroll Observer & HUD Telemetry Script
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Intersection Observer for Scroll Reveals
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // Optional: unobserve after revealing if performance desired
          // observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback for legacy browsers
    revealElements.forEach(el => el.classList.add('active'));
  }

  // 2. HUD Telemetry Simulation (Coordinate & Radar Pulse Updates)
  const latElement = document.getElementById('hud-lat');
  const longElement = document.getElementById('hud-long');
  const altElement = document.getElementById('hud-alt');

  if (latElement && longElement) {
    setInterval(() => {
      // Subtle realistic coordinate fluctuations around Salem coordinates (approx 11.1271° N, 78.6569° E)
      const lat = (11.1271 + (Math.random() * 0.004 - 0.002)).toFixed(4);
      const long = (78.6569 + (Math.random() * 0.004 - 0.002)).toFixed(4);
      const alt = (120 + Math.floor(Math.random() * 10 - 5));

      latElement.textContent = `${lat}° N`;
      longElement.textContent = `${long}° E`;
      if (altElement) altElement.textContent = `${alt}m ALT`;
    }, 2500);
  }
});
