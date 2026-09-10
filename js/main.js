/**
 * SAVORIA BISTRO - MAIN JAVASCRIPT FILE
 * Pure vanilla JavaScript with detailed educational comments.
 */

// Wait for the HTML document to finish parsing before running our scripts
document.addEventListener('DOMContentLoaded', () => {
  initMobileNavigation();
  initNavbarScrollEffect();
  initHeroPhotoStrip();
  initMenuFilter();
  initSmoothScrollLinks();
  highlightActiveNavLink();
});

/**
 * FEATURE 1: Mobile Hamburger Navigation
 * Toggles drawer open/close and manages accessibility attributes.
 */
function initMobileNavigation() {
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (!navToggle || !navLinks) return;

  navToggle.addEventListener('click', () => {
    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.classList.toggle('is-active');
    navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(!isExpanded));
  });

  // Close menu when a navigation link is clicked
  const links = navLinks.querySelectorAll('.nav-link');
  links.forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('is-active');
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close menu on Escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      navToggle.classList.remove('is-active');
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/**
 * FEATURE 2: Sticky Header Scroll Styling
 * Adds a compact look and drop shadow when scrolled.
 */
function initNavbarScrollEffect() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/**
 * FEATURE 3: Cursor-Driven Horizontal Photo Strip
 * 
 * Concept:
 * As the user moves their mouse left and right across the Hero section:
 * 1. We compute the cursor's horizontal percentage (0 = far left, 1 = far right).
 * 2. We calculate the difference between the total width of the 6-photo strip and the viewport width.
 * 3. We translate the track along the X-axis using transform: translateX(-amount px).
 * 4. We use requestAnimationFrame with a gentle damping (lerp) factor for smooth, fluid motion.
 */
function initHeroPhotoStrip() {
  const heroSection = document.getElementById('heroSection');
  const stripTrack = document.getElementById('heroStripTrack');

  if (!heroSection || !stripTrack) return;

  let mouseRatio = 0.5; // Starts in the middle
  let currentTranslateX = 0;
  let targetTranslateX = 0;
  let isTicking = false;

  function updateTrackPosition() {
    const heroWidth = heroSection.clientWidth;
    const trackWidth = stripTrack.scrollWidth;
    const maxScroll = Math.max(0, trackWidth - heroWidth);

    // Target translation based on mouse X percentage
    targetTranslateX = -mouseRatio * maxScroll;

    // Smooth interpolation (dampening effect for premium inertia)
    currentTranslateX += (targetTranslateX - currentTranslateX) * 0.1;
    stripTrack.style.transform = `translateX(${currentTranslateX}px)`;

    // Continue loop if moving noticeably
    if (Math.abs(targetTranslateX - currentTranslateX) > 0.5) {
      requestAnimationFrame(updateTrackPosition);
    } else {
      isTicking = false;
    }
  }

  function requestPositionUpdate() {
    if (!isTicking) {
      isTicking = true;
      requestAnimationFrame(updateTrackPosition);
    }
  }

  // Mouse move listener across the hero section
  heroSection.addEventListener('mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    // Normalize X between 0 and 1
    const x = e.clientX - rect.left;
    mouseRatio = Math.max(0, Math.min(1, x / rect.width));
    requestPositionUpdate();
  });

  // Touch support for mobile & tablet (swipe along the track)
  let touchStartX = 0;
  let touchStartRatio = 0.5;

  heroSection.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartRatio = mouseRatio;
  }, { passive: true });

  heroSection.addEventListener('touchmove', (e) => {
    const touchCurrentX = e.touches[0].clientX;
    const deltaX = touchStartX - touchCurrentX;
    const ratioDelta = deltaX / window.innerWidth;
    mouseRatio = Math.max(0, Math.min(1, touchStartRatio + ratioDelta));
    requestPositionUpdate();
  }, { passive: true });

  // Initial render calculation
  requestPositionUpdate();

  // Recalculate on window resize
  window.addEventListener('resize', requestPositionUpdate);
}

/**
 * FEATURE 4: Menu Filter Tabs
 * 
 * Filters 6 food items by category (Starters, Mains, Desserts, Drinks)
 * with instant active button switching and card show/hide.
 */
function initMenuFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const menuCards = document.querySelectorAll('.menu-card');

  if (!filterBtns.length || !menuCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // 1. Update active styling on clicked button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const selectedCategory = btn.getAttribute('data-filter');

      // 2. Filter matching menu cards
      menuCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (selectedCategory === 'all' || cardCategory === selectedCategory) {
          card.classList.remove('is-hidden');
          // Trigger a micro fade-in animation
          card.style.opacity = '0';
          card.style.transform = 'translateY(8px)';
          setTimeout(() => {
            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 30);
        } else {
          card.classList.add('is-hidden');
        }
      });
    });
  });
}

/**
 * FEATURE 5: Smooth Scrolling for Anchor Links
 */
function initSmoothScrollLinks() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerHeight = document.querySelector('.site-header')?.offsetHeight || 80;
        const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * FEATURE 6: Highlight Active Navigation Link on Scroll
 */
function highlightActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!sections.length) return;

  window.addEventListener('scroll', () => {
    let currentSectionId = '';
    const scrollPosition = window.scrollY + 120;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPosition >= top && scrollPosition < top + height) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;

      if (href === `#${currentSectionId}` || (currentSectionId === 'heroSection' && (href === '#' || href === 'index.html'))) {
        link.classList.add('active');
      } else if (href.startsWith('#')) {
        link.classList.remove('active');
      }
    });
  }, { passive: true });
}
