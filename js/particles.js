
/* =========================================================
   BIANCHETI ENGENHARIA
   PARTICLES.JS — SISTEMA INTERATIVO DE PARTÍCULAS
   ========================================================= */

"use strict";

(() => {

  const canvas = document.getElementById("particles-canvas");
  const hero = document.querySelector(".hero");

  if (!canvas || !hero) return;

  const context = canvas.getContext("2d", {
    alpha: true
  });

  if (!context) return;

  /* ==================== CONFIGURAÇÕES ==================== */

  const CONFIG = {

    color: [183, 255, 60],

    // Quantidade proporcional à área da tela.
    density: 19000,

    minParticles: 18,
    maxParticles: 85,
    mobileMaxParticles: 28,

    minRadius: 0.6,
    maxRadius: 1.8,

    minSpeed: 0.12,
    maxSpeed: 0.4,

    connectionDistance: 125,
    connectionOpacity: 0.12,

    mouseRadius: 160,
    mouseForce: 1.15,

    particleOpacity: 0.65,

    maxDevicePixelRatio: 2

  };

  /* ==================== ESTADO ==================== */

  const state = {

    width: 0,
    height: 0,
    dpr: 1,

    particles: [],

    mouse: {
      x: -1000,
      y: -1000,
      active: false
    },

    animationFrame: null,
    lastTimestamp: 0,

    visible: false,
    running: false

  };

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const coarsePointer = window.matchMedia(
    "(pointer: coarse)"
  );

  /* ==================== FUNÇÕES AUXILIARES ==================== */

  function randomBetween(min, max) {

    return Math.random() * (max - min) + min;

  }

  function clamp(value, min, max) {

    return Math.min(
      Math.max(value, min),
      max
    );

  }

  function getParticleCount() {

    const area = state.width * state.height;

    const isMobile =
      coarsePointer.matches || state.width < 768;

    const maximum = isMobile
      ? CONFIG.mobileMaxParticles
      : CONFIG.maxParticles;

    return clamp(
      Math.floor(area / CONFIG.density),
      CONFIG.minParticles,
      maximum
    );

  }

  /* ==================== PARTÍCULA ==================== */

  class Particle {

    constructor() {

      this.x = Math.random() * state.width;
      this.y = Math.random() * state.height;

      this.radius = randomBetween(
        CONFIG.minRadius,
        CONFIG.maxRadius
      );

      const angle = Math.random() * Math.PI * 2;

      const speed = randomBetween(
        CONFIG.minSpeed,
        CONFIG.maxSpeed
      );

      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;

      this.opacity = randomBetween(0.2, 0.65);

      this.phase = Math.random() * Math.PI * 2;

      this.phaseSpeed = randomBetween(
        0.003,
        0.012
      );

    }

    update(delta) {

      this.x += this.vx * delta;
      this.y += this.vy * delta;

      this.phase += this.phaseSpeed * delta;

      // Movimento contínuo nas bordas.
      const margin = 10;

      if (this.x < -margin) {
        this.x = state.width + margin;
      }

      if (this.x > state.width + margin) {
        this.x = -margin;
      }

      if (this.y < -margin) {
        this.y = state.height + margin;
      }

      if (this.y > state.height + margin) {
        this.y = -margin;
      }

      // Interação com o cursor.
      if (state.mouse.active && !coarsePointer.matches) {

        const dx = this.x - state.mouse.x;
        const dy = this.y - state.mouse.y;

        const distanceSquared =
          dx * dx + dy * dy;

        const radiusSquared =
          CONFIG.mouseRadius * CONFIG.mouseRadius;

        if (
          distanceSquared > 0.001 &&
          distanceSquared < radiusSquared
        ) {

          const distance = Math.sqrt(
            distanceSquared
          );

          const influence =
            1 - distance / CONFIG.mouseRadius;

          const force =
            influence * influence *
            CONFIG.mouseForce *
            delta;

          // Repulsão suave.
          this.x += (dx / distance) * force;
          this.y += (dy / distance) * force;

        }

      }

    }

    draw() {

      const pulse =
        0.75 + Math.sin(this.phase) * 0.25;

      const alpha =
        this.opacity *
        pulse *
        CONFIG.particleOpacity;

      const [r, g, b] = CONFIG.color;

      context.beginPath();

      context.arc(
        this.x,
        this.y,
        this.radius,
        0,
        Math.PI * 2
      );

      context.fillStyle =
        `rgba(${r}, ${g}, ${b}, ${alpha})`;

      context.fill();

    }

  }

  /* ==================== CRIAR PARTÍCULAS ==================== */

  function createParticles() {

    const count = getParticleCount();

    state.particles = Array.from(
      { length: count },
      () => new Particle()
    );

  }

  /* ==================== CONEXÕES ==================== */

  function drawConnections() {

    const particles = state.particles;

    const maxDistance =
      CONFIG.connectionDistance;

    const maxDistanceSquared =
      maxDistance * maxDistance;

    const [r, g, b] = CONFIG.color;

    for (let i = 0; i < particles.length; i++) {

      const a = particles[i];

      for (let j = i + 1; j < particles.length; j++) {

        const b = particles[j];

        const dx = a.x - b.x;
        const dy = a.y - b.y;

        const distanceSquared =
          dx * dx + dy * dy;

        if (distanceSquared > maxDistanceSquared) {
          continue;
        }

        const distance = Math.sqrt(
          distanceSquared
        );

        const opacity =
          (1 - distance / maxDistance) *
          CONFIG.connectionOpacity;

        context.beginPath();

        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);

        context.strokeStyle =
          `rgba(${r}, ${g}, ${b}, ${opacity})`;

        context.lineWidth = 0.65;

        context.stroke();

      }

    }

  }

  /* ==================== INTERAÇÃO COM O MOUSE ==================== */

  function handlePointerMove(event) {

    if (coarsePointer.matches) return;

    const rect = canvas.getBoundingClientRect();

    state.mouse.x = event.clientX - rect.left;
    state.mouse.y = event.clientY - rect.top;

    state.mouse.active =
      state.mouse.x >= 0 &&
      state.mouse.x <= rect.width &&
      state.mouse.y >= 0 &&
      state.mouse.y <= rect.height;

  }

  function handlePointerLeave() {

    state.mouse.active = false;

    state.mouse.x = -1000;
    state.mouse.y = -1000;

  }

  hero.addEventListener(
    "pointermove",
    handlePointerMove,
    { passive: true }
  );

  hero.addEventListener(
    "pointerleave",
    handlePointerLeave
  );

  /* ==================== RENDERIZAÇÃO ==================== */

  function renderFrame(delta = 1) {

    context.clearRect(
      0,
      0,
      state.width,
      state.height
    );

    state.particles.forEach(particle => {
      particle.update(delta);
      particle.draw();
    });

    drawConnections();

  }

  /* ==================== LOOP DE ANIMAÇÃO ==================== */

  function animate(timestamp) {

    if (!state.running) return;

    const elapsed = state.lastTimestamp
      ? timestamp - state.lastTimestamp
      : 16.67;

    state.lastTimestamp = timestamp;

    // Limita saltos grandes após trocar de aba.
    const delta = clamp(
      elapsed / 16.67,
      0,
      2
    );

    renderFrame(delta);

    state.animationFrame =
      requestAnimationFrame(animate);

  }

  function startAnimation() {

    if (state.running) return;

    if (
      reducedMotion.matches ||
      document.hidden ||
      !state.visible
    ) {
      return;
    }

    state.running = true;

    state.lastTimestamp = 0;

    state.animationFrame =
      requestAnimationFrame(animate);

  }

  function stopAnimation() {

    state.running = false;

    if (state.animationFrame !== null) {

      cancelAnimationFrame(
        state.animationFrame
      );

      state.animationFrame = null;

    }

  }

  function updateAnimationState() {

    if (
      state.visible &&
      !document.hidden &&
      !reducedMotion.matches
    ) {

      startAnimation();

    } else {

      stopAnimation();

    }

  }

  /* ==================== REDIMENSIONAMENTO ==================== */

  function resizeCanvas() {

    const rect = hero.getBoundingClientRect();

    const newWidth = Math.max(
      1,
      Math.round(rect.width)
    );

    const newHeight = Math.max(
      1,
      Math.round(rect.height)
    );

    const dpr = Math.min(
      window.devicePixelRatio || 1,
      CONFIG.maxDevicePixelRatio
    );

    state.width = newWidth;
    state.height = newHeight;
    state.dpr = dpr;

    canvas.width = Math.round(
      newWidth * dpr
    );

    canvas.height = Math.round(
      newHeight * dpr
    );

    canvas.style.width = `${newWidth}px`;
    canvas.style.height = `${newHeight}px`;

    context.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );

    createParticles();

    if (reducedMotion.matches) {

      context.clearRect(
        0,
        0,
        state.width,
        state.height
      );

    } else if (!state.running) {

      renderFrame(0);

    }

  }

  let resizeFrame = null;

  function requestResize() {

    if (resizeFrame !== null) return;

    resizeFrame = requestAnimationFrame(() => {

      resizeFrame = null;

      resizeCanvas();

    });

  }

  /* ==================== VISIBILIDADE ==================== */

  if ("IntersectionObserver" in window) {

    const visibilityObserver =
      new IntersectionObserver(
        entries => {

          state.visible =
            entries[0]?.isIntersecting || false;

          updateAnimationState();

        },
        {
          threshold: 0
        }
      );

    visibilityObserver.observe(hero);

  } else {

    state.visible = true;

  }

  document.addEventListener(
    "visibilitychange",
    updateAnimationState
  );

  reducedMotion.addEventListener(
    "change",
    () => {

      updateAnimationState();
      requestResize();

    }
  );

  window.addEventListener(
    "resize",
    requestResize,
    { passive: true }
  );

  /* ==================== INICIALIZAÇÃO ==================== */

  resizeCanvas();

  updateAnimationState();

})();
