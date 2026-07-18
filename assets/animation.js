// ============================================================
// ANIMATIONS - GSAP, Lenis, Three.js, Scroll, Mouse, etc.
// ============================================================

(() => {
  'use strict';

  // ----- Lenis Smooth Scroll -----
  if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenis.on('scroll', (e) => {
      // update scroll progress
      const progress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      document.querySelector('#scroll-progress').style.width = (progress * 100) + '%';
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // ----- Three.js Background Particle -----
  if (typeof THREE !== 'undefined') {
    const container = document.getElementById('three-bg');
    if (container) {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      // Particles
      const count = 400;
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      for (let i = 0; i < count * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 20;
        colors[i] = i % 3 === 0 ? 0.5 + Math.random() * 0.5 : 0.2 + Math.random() * 0.3;
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 0.06,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
      });
      const particles = new THREE.Points(geometry, material);
      scene.add(particles);

      camera.position.z = 5;

      let mouseX = 0, mouseY = 0;
      document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
      });

      function animateParticles() {
        requestAnimationFrame(animateParticles);
        particles.rotation.y += 0.0003;
        particles.rotation.x += 0.0001;
        particles.rotation.x += (mouseY * 0.02 - particles.rotation.x) * 0.02;
        particles.rotation.y += (mouseX * 0.02 - particles.rotation.y) * 0.02;
        renderer.render(scene, camera);
      }
      animateParticles();

      window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });
    }
  }

  // ----- Custom Cursor -----
  const cursor = document.getElementById('custom-cursor');
  if (cursor) {
    let x = 0, y = 0;
    let targetX = 0, targetY = 0;
    document.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    });
    function animateCursor() {
      x += (targetX - x) * 0.12;
      y += (targetY - y) * 0.12;
      cursor.style.left = x + 'px';
      cursor.style.top = y + 'px';
      requestAnimationFrame(animateCursor);
    }
    animateCursor();
    // Hover effect
    document.querySelectorAll('a, button, .album-item, .artikel-card, .pustaka-item, .faq-question').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
  }

  // ----- GSAP Scroll Reveal (Hero Title) -----
  if (typeof gsap !== 'undefined') {
    gsap.from('.hero-title', {
      duration: 1.5,
      y: 100,
      opacity: 0,
      ease: 'power3.out',
      delay: 0.2,
    });
    gsap.from('.hero-sub', {
      duration: 1.5,
      y: 50,
      opacity: 0,
      ease: 'power3.out',
      delay: 0.4,
    });
    gsap.from('.stat', {
      duration: 1,
      y: 30,
      opacity: 0,
      stagger: 0.1,
      ease: 'power2.out',
      delay: 0.6,
    });
    // Parallax on scroll (using GSAP ScrollTrigger)
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      gsap.to('.hero-title', {
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
        y: -200,
        opacity: 0.3,
        scale: 0.9,
      });
      gsap.to('.hero-sub', {
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
        y: -100,
        opacity: 0,
      });
    }
  }

  // ----- Ripple Click Effect -----
  document.addEventListener('click', (e) => {
    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';
    const size = 40;
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - size/2) + 'px';
    ripple.style.top = (e.clientY - size/2) + 'px';
    ripple.style.position = 'fixed';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'radial-gradient(circle, rgba(124,58,237,0.4), transparent 70%)';
    ripple.style.pointerEvents = 'none';
    ripple.style.zIndex = '9996';
    ripple.style.transform = 'scale(0)';
    ripple.style.transition = 'transform 0.6s ease, opacity 0.6s ease';
    document.body.appendChild(ripple);
    requestAnimationFrame(() => {
      ripple.style.transform = 'scale(6)';
      ripple.style.opacity = '0';
    });
    setTimeout(() => ripple.remove(), 700);
  });

  // ----- Mouse Glow (follow) -----
  const glow = document.createElement('div');
  glow.className = 'mouse-glow';
  glow.style.cssText = `
    position: fixed;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(124,58,237,0.08), transparent 70%);
    pointer-events: none;
    z-index: 1;
    transform: translate(-50%, -50%);
    transition: left 0.08s ease, top 0.08s ease;
  `;
  document.body.prepend(glow);
  document.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });

})();