
/* =========================================================
   BIANCHETI ENGENHARIA
   ANIMATIONS.JS — ANIMAÇÕES E INTERAÇÕES VISUAIS
   ========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", () => {

  initializeScrollReveal();
  initializeCounters();
  initializeInteractiveCards();
  initializeScrollProgress();
  initializeConstructionAnimation();
  initializePartnersMarquee();

});

/* ==================== CONFIGURAÇÕES ==================== */

const animationSettings = {

  revealThreshold: 0.12,

  counterDuration: 1900,

  cardMaxRotation: 3,

  parallaxStrength: 0.12,

  cursorSmoothing: 0.16

};

const reduceMotionQuery = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);

const finePointerQuery = window.matchMedia(
  "(hover: hover) and (pointer: fine)"
);

/* ==================== REVEAL ON SCROLL ==================== */

function initializeScrollReveal() {

  const elements = document.querySelectorAll(".reveal");

  if (!elements.length) return;

  if (
    reduceMotionQuery.matches ||
    !("IntersectionObserver" in window)
  ) {
    elements.forEach(element => {
      element.classList.add("visible");
    });
    return;
  }

  /*
    A classe é ativada somente depois que o
    observer está configurado, evitando deixar
    elementos invisíveis sem necessidade.
  */

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {

      entries.forEach(entry => {

        if (!entry.isIntersecting) return;

        entry.target.classList.add("visible");

        currentObserver.unobserve(entry.target);

      });

    },
    {
      threshold: animationSettings.revealThreshold,
      rootMargin: "0px 0px -35px 0px"
    }
  );

  elements.forEach(element => {
    observer.observe(element);
  });

  document.documentElement.classList.add(
    "js-animations"
  );

}

/* ==================== CONTADORES ==================== */


function initializeCounters() {
  const counters = document.querySelectorAll(".counter[data-target]");

  if (!counters.length) return;

  const duration = 2000;
  const formatter = new Intl.NumberFormat("pt-BR");
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  function animateCounter(counter) {
    if (counter.dataset.animated === "true") return;

    counter.dataset.animated = "true";

    const target = Number(counter.dataset.target);

    if (!Number.isFinite(target)) return;

    if (reducedMotion.matches) {
      counter.textContent = formatter.format(target);
      return;
    }

    counter.textContent = "0";

    let startTime = null;

    function step(timestamp) {
      if (startTime === null) startTime = timestamp;

      const progress = Math.min(
        (timestamp - startTime) / duration,
        1
      );

      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(target * eased);

      counter.textContent = formatter.format(value);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        counter.textContent = formatter.format(target);
      }
    }

    requestAnimationFrame(step);
  }

  if (!("IntersectionObserver" in window)) {
    counters.forEach(animateCounter);
    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        animateCounter(entry.target);
        currentObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.15
    }
  );

  counters.forEach(counter => {
    observer.observe(counter);
  });
}


/* ==================== CARDS INTERATIVOS ==================== */

function initializeInteractiveCards() {

  const cards = document.querySelectorAll(
    ".interactive-card"
  );

  if (!cards.length) return;

  /*
    Em celulares e tablets com interação touch,
    não aplicamos inclinação ou movimentos
    que possam prejudicar a navegação.
  */

  if (
    reduceMotionQuery.matches ||
    !finePointerQuery.matches
  ) {
    return;
  }

  cards.forEach(card => {

    let frameRequested = false;

    let pointerX = 0;
    let pointerY = 0;

    function updateCard() {

      const rect = card.getBoundingClientRect();

      if (!rect.width || !rect.height) {
        frameRequested = false;
        return;
      }

      const x = pointerX - rect.left;
      const y = pointerY - rect.top;

      const xPercent = x / rect.width;
      const yPercent = y / rect.height;

      const clampedX = Math.max(
        0,
        Math.min(xPercent, 1)
      );

      const clampedY = Math.max(
        0,
        Math.min(yPercent, 1)
      );

      // Posição do brilho.
      card.style.setProperty(
        "--mouse-x",
        `${clampedX * 100}%`
      );

      card.style.setProperty(
        "--mouse-y",
        `${clampedY * 100}%`
      );

      /*
        A inclinação é aplicada ao card de forma
        sutil. Cards com animação de revelação
        só recebem o efeito depois de aparecerem.
      */

      const canTilt =
        !card.classList.contains("reveal") ||
        card.classList.contains("visible");

      if (canTilt) {

        const rotateY =
          (clampedX - 0.5) *
          animationSettings.cardMaxRotation * 2;

        const rotateX =
          (0.5 - clampedY) *
          animationSettings.cardMaxRotation * 2;

        card.style.transform = `
          perspective(1100px)
          rotateX(${rotateX}deg)
          rotateY(${rotateY}deg)
          translateY(-3px)
        `;

      }

      frameRequested = false;

    }

    card.addEventListener("pointermove", event => {

      if (event.pointerType === "touch") return;

      pointerX = event.clientX;
      pointerY = event.clientY;

      if (!frameRequested) {

        frameRequested = true;

        requestAnimationFrame(updateCard);

      }

    });

    card.addEventListener("pointerleave", () => {

      card.style.transform = "";

      card.style.setProperty("--mouse-x", "50%");
      card.style.setProperty("--mouse-y", "50%");

    });

  });

}

/* ==================== PROGRESSO DE SCROLL ==================== */

function initializeScrollProgress() {

  const progressBar = document.querySelector(
    ".scroll-progress"
  );

  if (!progressBar) return;

  let ticking = false;

  function updateProgress() {

    const documentHeight =
      document.documentElement.scrollHeight;

    const viewportHeight = window.innerHeight;

    const maxScroll = Math.max(
      documentHeight - viewportHeight,
      0
    );

    const currentScroll = Math.max(
      window.scrollY,
      0
    );

    const progress = maxScroll > 0
      ? Math.min(currentScroll / maxScroll, 1)
      : 0;

    progressBar.style.width =
      `${progress * 100}%`;

    ticking = false;

  }

  function requestUpdate() {

    if (ticking) return;

    ticking = true;

    requestAnimationFrame(updateProgress);

  }

  window.addEventListener(
    "scroll",
    requestUpdate,
    { passive: true }
  );

  window.addEventListener(
    "resize",
    requestUpdate
  );

  updateProgress();

}

/* ==================== PARCEIROS ==================== */


function initializePartnersMarquee() {
  const marquee = document.querySelector(".partners-marquee");
  const track = document.querySelector(".partners-track");
  const originalGroup = track?.querySelector(".partners-group");

  if (!marquee || !track || !originalGroup) return;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  // Remove possíveis clones anteriores.
  track.querySelectorAll(".partners-group[data-clone]").forEach(
    clone => clone.remove()
  );

  // Cria uma cópia idêntica para continuidade.
  const clone = originalGroup.cloneNode(true);

  clone.dataset.clone = "true";
  clone.setAttribute("aria-hidden", "true");

  clone.querySelectorAll("img").forEach(img => {
    img.alt = "";
  });

  track.appendChild(clone);

  // Usa a largura exata do primeiro grupo.
  function updateMarquee() {
    const distance = originalGroup.getBoundingClientRect().width;

    if (distance <= 0) return;

    track.style.setProperty(
      "--marquee-distance",
      `${distance}px`
    );

    track.classList.toggle(
      "is-animated",
      !reducedMotion.matches
    );
  }

  updateMarquee();

  window.addEventListener("load", updateMarquee);
  window.addEventListener("resize", updateMarquee);

  reducedMotion.addEventListener("change", updateMarquee);
}

/* ==================== PARALLAX DA CAPA ==================== */

function initializeHeroParallax() {

  const hero = document.querySelector(".hero");
  const background = document.querySelector(
    ".hero-background"
  );

  if (!hero || !background) return;

  if (reduceMotionQuery.matches) return;

  let ticking = false;

  function updateParallax() {

    const heroRect = hero.getBoundingClientRect();

    // Evita atualizar uma seção fora da tela.
    if (
      heroRect.bottom <= 0 ||
      heroRect.top >= window.innerHeight
    ) {
      ticking = false;
      return;
    }

    const scrollAmount = Math.max(
      0,
      -heroRect.top
    );

    const offset =
      scrollAmount *
      animationSettings.parallaxStrength;

    background.style.transform =
      `translate3d(0, ${offset}px, 0) scale(1.06)`;

    ticking = false;

  }

  function requestParallax() {

    if (ticking) return;

    ticking = true;

    requestAnimationFrame(updateParallax);

  }

  window.addEventListener(
    "scroll",
    requestParallax,
    { passive: true }
  );

  updateParallax();

}

/* ==================== CURSOR PERSONALIZADO ==================== */

function initializeCustomCursor() {

  const cursor = document.querySelector(
    ".custom-cursor"
  );

  const cursorGlow = document.querySelector(
    ".cursor-glow"
  );

  if (!cursor || !cursorGlow) return;

  if (
    reduceMotionQuery.matches ||
    !finePointerQuery.matches
  ) {
    return;
  }

  let mouseX = -500;
  let mouseY = -500;

  let glowX = -500;
  let glowY = -500;

  let isVisible = false;
  let animationFrame = null;

  function updateCursorPosition(event) {

    mouseX = event.clientX;
    mouseY = event.clientY;

    if (!isVisible) {

      isVisible = true;

      cursor.style.opacity = "1";
      cursorGlow.style.opacity = "1";

    }

    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;

    if (animationFrame === null) {
      animationFrame = requestAnimationFrame(animateGlow);
    }

  }

  function animateGlow() {

    const smoothing =
      animationSettings.cursorSmoothing;

    glowX += (mouseX - glowX) * smoothing;
    glowY += (mouseY - glowY) * smoothing;

    cursorGlow.style.left = `${glowX}px`;
    cursorGlow.style.top = `${glowY}px`;

    const distance = Math.hypot(
      mouseX - glowX,
      mouseY - glowY
    );

    if (distance > 0.5 && isVisible) {

      animationFrame = requestAnimationFrame(
        animateGlow
      );

    } else {

      animationFrame = null;

    }

  }

  document.addEventListener(
    "pointermove",
    updateCursorPosition,
    { passive: true }
  );

  document.addEventListener("pointerout", event => {

    if (event.relatedTarget !== null) return;

    isVisible = false;

    cursor.style.opacity = "0";
    cursorGlow.style.opacity = "0";

    if (animationFrame !== null) {

      cancelAnimationFrame(animationFrame);
      animationFrame = null;

    }

  });

  /* Aumenta o cursor ao passar em elementos clicáveis */

  const interactiveElements = document.querySelectorAll(
    "a, button, .interactive-card"
  );

  interactiveElements.forEach(element => {

    element.addEventListener("pointerenter", () => {
      cursor.classList.add("cursor-hover");
    });

    element.addEventListener("pointerleave", () => {
      cursor.classList.remove("cursor-hover");
    });

  });

}


function initializePartnersMarquee() {
  const marquee = document.querySelector(".partners-marquee");
  const track = document.querySelector(".partners-track");
  const original = track?.querySelector(".partners-group");

  if (!marquee || !track || !original) return;

  let resizeTimer;

  function setupMarquee() {
    // Remove cópias anteriores
    track.querySelectorAll("[data-clone]").forEach(clone => {
      clone.remove();
    });

    // Mede a largura do conjunto original
    const groupWidth = original.getBoundingClientRect().width;
    const containerWidth = marquee.getBoundingClientRect().width;

    if (groupWidth <= 0) return;

    // Precisamos de conteúdo suficiente para
    // preencher a tela durante todo o ciclo.
    const totalGroups = Math.max(
      2,
      Math.ceil(containerWidth / groupWidth) + 1
    );

    for (let i = 1; i < totalGroups; i++) {
      const clone = original.cloneNode(true);

      clone.dataset.clone = "true";
      clone.setAttribute("aria-hidden", "true");

      clone.querySelectorAll("img").forEach(img => {
        img.alt = "";
      });

      track.appendChild(clone);
    }

    // A animação desloca exatamente um grupo.
    track.style.setProperty(
      "--marquee-distance",
      `${groupWidth}px`
    );
  }

  setupMarquee();

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setupMarquee, 150);
  });
}


/* ============================================
   ANIMAÇÃO DE CONSTRUÇÃO — RESULTADOS
   ============================================ */

function initializeConstructionAnimation() {

  const scene = document.getElementById(
    "construction-scene"
  );

  const label = document.getElementById(
    "construction-label"
  );

  const progress = document.getElementById(
    "construction-progress-bar"
  );

  if (!scene || !label || !progress) return;

  const motionPreference = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const stages = [
    {
      className: "is-planning",
      label: "PREPARANDO TERRENO",
      progress: 5,
      duration: 900
    },
    {
      className: "is-foundation",
      label: "EXECUTANDO FUNDAÇÃO",
      progress: 20,
      duration: 1100
    },
    {
      className: "is-framing",
      label: "MONTANDO ESTRUTURA",
      progress: 45,
      duration: 1200
    },
    {
      className: "is-walls",
      label: "EXECUTANDO ALVENARIA",
      progress: 65,
      duration: 1200
    },
    {
      className: "is-roof",
      label: "INSTALANDO COBERTURA",
      progress: 85,
      duration: 1300
    },
    {
      className: "is-complete",
      label: "PROJETO CONCLUÍDO",
      progress: 100,
      duration: 3000
    }
  ];

  const stageClasses = stages.map(
    stage => stage.className
  );

  let currentStep = 0;
  let timer = null;
  let isVisible = false;

  function clearTimer() {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function applyStage(index) {

    const stage = stages[index];

    scene.classList.remove(...stageClasses);
    scene.classList.add(stage.className);

    label.textContent = stage.label;
    progress.style.width = `${stage.progress}%`;

  }

  function showCompleted() {

    clearTimer();

    scene.classList.remove(...stageClasses);
    scene.classList.add("is-complete");

    label.textContent = "PROJETO CONCLUÍDO";
    progress.style.width = "100%";

  }

  function runStage() {

    if (
      !isVisible ||
      document.hidden ||
      motionPreference.matches
    ) {
      return;
    }

    applyStage(currentStep);

    const duration = stages[currentStep].duration;

    timer = setTimeout(() => {

      currentStep = (currentStep + 1) % stages.length;

      runStage();

    }, duration);

  }

  function restartAnimation() {

    clearTimer();

    if (motionPreference.matches) {
      showCompleted();
      return;
    }

    if (!isVisible || document.hidden) {
      return;
    }

    currentStep = 0;

    applyStage(0);

    runStage();
  }

  function updateVisibility() {

    clearTimer();

    if (motionPreference.matches) {
      showCompleted();
      return;
    }

    if (isVisible && !document.hidden) {
      restartAnimation();
    }
  }

  if ("IntersectionObserver" in window) {

    const observer = new IntersectionObserver(
      entries => {

        const wasVisible = isVisible;

        isVisible = entries[0]?.isIntersecting ?? false;

        if (wasVisible !== isVisible) {
          updateVisibility();
        }

      },
      {
        threshold: 0.2
      }
    );

    observer.observe(scene);

  } else {

    isVisible = true;
    updateVisibility();

  }

  document.addEventListener(
    "visibilitychange",
    updateVisibility
  );

  motionPreference.addEventListener(
    "change",
    updateVisibility
  );

  showCompleted();
}
