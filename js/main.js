
/* =========================================================
   BIANCHETI ENGENHARIA
   MAIN.JS — FUNCIONALIDADES PRINCIPAIS
   ========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", () => {

  initializeHeader();
  initializeMobileMenu();
  initializeNavigation();
  initializeSolutionTabs();
  initializeContactForm();
  initializeFooter();
  initializeProjectCards();
  initializeFloatingWhatsApp();
  initializePreloader();
  initializeSolutionsScrollHint();

});

/* ==================== HEADER ==================== */

function initializeHeader() {

  const header = document.querySelector(".site-header");

  if (!header) return;

  const updateHeader = () => {

    header.classList.toggle(
      "scrolled",
      window.scrollY > 40
    );

  };

  updateHeader();

  window.addEventListener("scroll", updateHeader, {
    passive: true
  });

}

/* ==================== MENU MOBILE ==================== */

function initializeMobileMenu() {

  const menuToggle = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector(".nav-menu");

  if (!menuToggle || !navMenu) return;

  const menuLinks = navMenu.querySelectorAll("a");

  let previousFocus = null;

  function openMenu() {

    previousFocus = document.activeElement;

    menuToggle.classList.add("active");
    navMenu.classList.add("active");

    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Fechar menu");

    document.body.classList.add("menu-open");

    menuLinks[0]?.focus();

  }

  function closeMenu(restoreFocus = true) {

    menuToggle.classList.remove("active");
    navMenu.classList.remove("active");

    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menu");

    document.body.classList.remove("menu-open");

    if (restoreFocus && previousFocus) {
      previousFocus.focus();
    }

  }

  menuToggle.addEventListener("click", () => {

    const isOpen = navMenu.classList.contains("active");

    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }

  });

  menuLinks.forEach(link => {

    link.addEventListener("click", () => {

      closeMenu(false);

    });

  });

  document.addEventListener("keydown", event => {

    if (!navMenu.classList.contains("active")) return;

    if (event.key === "Escape") {
      closeMenu();
      return;
    }

    // Mantém o foco no menu quando aberto.
    if (event.key === "Tab") {

      const focusable = [
        menuToggle,
        ...menuLinks
      ];

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }

      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }

    }

  });

  document.addEventListener("pointerdown", event => {

    if (!navMenu.classList.contains("active")) return;

    const clickedInsideMenu = navMenu.contains(event.target);
    const clickedToggle = menuToggle.contains(event.target);

    if (!clickedInsideMenu && !clickedToggle) {
      closeMenu(false);
    }

  });

  // Fecha o menu ao voltar para o layout desktop.
  const desktopQuery = window.matchMedia("(min-width: 992px)");

  desktopQuery.addEventListener("change", event => {

    if (event.matches) {
      closeMenu(false);
    }

  });

}

/* ==================== NAVEGAÇÃO ==================== */

function initializeNavigation() {

  const navLinks = document.querySelectorAll(
    ".nav-link[href^='#']"
  );

  const sections = document.querySelectorAll(
    "main section[id]"
  );

  if (!navLinks.length || !sections.length) return;

  const sectionMap = new Map();

  navLinks.forEach(link => {

    const sectionId = link.getAttribute("href")?.slice(1);

    if (sectionId) {
      sectionMap.set(sectionId, link);
    }

  });

  function updateActiveNavigation() {

    const scrollPosition = window.scrollY + 160;

    let currentSection = "inicio";

    sections.forEach(section => {

      if (section.offsetTop <= scrollPosition) {
        currentSection = section.id;
      }

    });

    navLinks.forEach(link => {

      const isActive =
        link.getAttribute("href") === `#${currentSection}`;

      link.classList.toggle("active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }

    });

    // Seções intermediárias sem link no menu
    // mantêm o item principal mais recente ativo.
    if (!sectionMap.has(currentSection)) {

      const visibleSections = [...sections].filter(
        section => section.offsetTop <= scrollPosition
      );

      const matchingSection = visibleSections
        .reverse()
        .find(section => sectionMap.has(section.id));

      if (matchingSection) {

        navLinks.forEach(link => {

          const active =
            link.getAttribute("href") ===
            `#${matchingSection.id}`;

          link.classList.toggle("active", active);

          if (active) {
            link.setAttribute("aria-current", "location");
          } else {
            link.removeAttribute("aria-current");
          }

        });

      }

    }

  }

  let ticking = false;

  window.addEventListener("scroll", () => {

    if (ticking) return;

    ticking = true;

    requestAnimationFrame(() => {

      updateActiveNavigation();
      ticking = false;

    });

  }, { passive: true });

  window.addEventListener("resize", updateActiveNavigation);

  updateActiveNavigation();

}

/* ==================== ABAS DE SOLUÇÕES ==================== */

function initializeSolutionTabs() {

  const tabList = document.querySelector(
    ".solutions-tabs[role='tablist']"
  );

  if (!tabList) return;

  const tabs = [...tabList.querySelectorAll(
    "[role='tab']"
  )];

  const panels = [...document.querySelectorAll(
    ".solutions-content [role='tabpanel']"
  )];

  if (!tabs.length || !panels.length) return;

  function activateTab(selectedTab, moveFocus = false) {

    const targetPanelId = selectedTab.getAttribute(
      "aria-controls"
    );

    tabs.forEach(tab => {

      const isSelected = tab === selectedTab;

      tab.classList.toggle("active", isSelected);

      tab.setAttribute(
        "aria-selected",
        String(isSelected)
      );

      tab.tabIndex = isSelected ? 0 : -1;

    });

    panels.forEach(panel => {

      const isActive = panel.id === targetPanelId;

      panel.hidden = !isActive;
      panel.classList.toggle("active", isActive);

    });

    if (moveFocus) {
      selectedTab.focus();
    }

  }

  tabs.forEach((tab, index) => {

    tab.addEventListener("click", () => {

      activateTab(tab);

    });

    tab.addEventListener("keydown", event => {

      let nextIndex = index;

      switch (event.key) {

        case "ArrowRight":
          nextIndex = (index + 1) % tabs.length;
          break;

        case "ArrowLeft":
          nextIndex = (index - 1 + tabs.length) % tabs.length;
          break;

        case "Home":
          nextIndex = 0;
          break;

        case "End":
          nextIndex = tabs.length - 1;
          break;

        default:
          return;

      }

      event.preventDefault();

      activateTab(tabs[nextIndex], true);

    });

  });

  const initialTab = tabs.find(
    tab => tab.getAttribute("aria-selected") === "true"
  ) || tabs[0];

  activateTab(initialTab);

}

/* ==================== FORMULÁRIO ==================== */

/*
  Como ainda não existe um backend definido,
  o formulário encaminhará a mensagem pelo
  WhatsApp oficial da Biancheti.

  Isso evita simular um envio por e-mail que
  na realidade não foi realizado.

  Posteriormente podemos integrar um serviço
  de formulários ou uma API própria.
*/

function initializeContactForm() {

  const form = document.getElementById("contact-form");
  const feedback = document.getElementById("form-feedback");

  if (!form) return;

  const whatsappNumber = "5531998376994";

  form.addEventListener("submit", event => {

    event.preventDefault();

    if (!form.reportValidity()) return;

    const formData = new FormData(form);

    const nome = String(
      formData.get("nome") || ""
    ).trim();

    const email = String(
      formData.get("email") || ""
    ).trim();

    const telefone = String(
      formData.get("telefone") || ""
    ).trim();

    const assunto = String(
      formData.get("assunto") || ""
    ).trim();

    const mensagem = String(
      formData.get("mensagem") || ""
    ).trim();

    if (
      !nome ||
      !email ||
      !telefone ||
      !assunto ||
      !mensagem
    ) {

      showFormFeedback(
        "Preencha todos os campos antes de continuar.",
        "error"
      );

      return;

    }

    const whatsappMessage = [
      "Olá, Biancheti Engenharia!",
      "",
      "Gostaria de entrar em contato pelo site.",
      "",
      `*Nome:* ${nome}`,
      `*E-mail:* ${email}`,
      `*Telefone:* ${telefone}`,
      `*Assunto:* ${assunto}`,
      "",
      "*Mensagem:*",
      mensagem
    ].join("\n");

    const whatsappURL =
      `https://wa.me/${whatsappNumber}?text=` +
      encodeURIComponent(whatsappMessage);

    const newWindow = window.open(
      whatsappURL,
      "_blank",
      "noopener,noreferrer"
    );

    if (!newWindow) {

      // Fallback caso o navegador bloqueie
      // a abertura de uma nova guia.
      window.location.href = whatsappURL;

    }

    showFormFeedback(
      "Sua mensagem foi preparada. Confirme o envio no WhatsApp.",
      "success"
    );

    // Não limpamos os campos, pois o usuário
    // ainda precisa confirmar o envio.

  });

  function showFormFeedback(message, type) {

    if (!feedback) return;

    feedback.textContent = message;

    feedback.classList.remove(
      "success",
      "error"
    );

    feedback.classList.add(type);

  }

}

/* ==================== FOOTER ==================== */

function initializeFooter() {

  const yearElement = document.getElementById(
    "current-year"
  );

  if (yearElement) {

    yearElement.textContent =
      new Date().getFullYear();

  }

}

/* ==================== FUNÇÕES AUXILIARES ==================== */

function prefersReducedMotion() {

  return window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

}


/* ============================================
   RESULTADOS — CARDS INTERATIVOS
   ============================================ */

function initializeProjectCards() {

  const grid = document.querySelector(".results-grid");

  if (!grid) return;

  const cards = [
    ...grid.querySelectorAll(".project-card")
  ];

  const desktopHover = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  );

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  let activeCard = null;

  /* ==================== ABRIR CARD ==================== */

  function openCard(card) {

    if (activeCard && activeCard !== card) {
      closeCard(activeCard);
    }

    card.classList.add("is-active");

    const button = card.querySelector(
      ".project-card-trigger"
    );

    button?.setAttribute("aria-expanded", "true");

    activeCard = card;

  }

  /* ==================== FECHAR CARD ==================== */

  function closeCard(card) {

    if (!card) return;

    card.classList.remove("is-active");

    const button = card.querySelector(
      ".project-card-trigger"
    );

    button?.setAttribute("aria-expanded", "false");

    if (activeCard === card) {
      activeCard = null;
    }

  }

  /* ==================== ALTERNAR CARD ==================== */

  function toggleCard(card) {

    if (activeCard === card) {
      closeCard(card);
    } else {
      openCard(card);
    }

  }

  /* ==================== CONFIGURAR CARDS ==================== */

  cards.forEach((card, index) => {

    const button = card.querySelector(
      ".project-card-trigger"
    );

    const details = card.querySelector(
      ".project-card-details"
    );

    if (!button || !details) return;

    // Conecta o botão à área de serviços.
    const detailsId = `project-details-${index + 1}`;

    details.id = detailsId;
    button.setAttribute("aria-controls", detailsId);
    button.setAttribute("aria-expanded", "false");

    // Permite selecionar por clique ou toque.
    button.addEventListener("click", event => {

      event.stopPropagation();

      toggleCard(card);

    });

    // No desktop, o CSS continua responsável
    // pelo efeito de hover.
    card.addEventListener("pointerenter", () => {

      if (!desktopHover.matches) return;

      // Não alteramos aria-expanded apenas
      // por hover, pois o card não foi ativado
      // pelo botão.
    });

    // Fecha um card selecionado ao sair com mouse.
    card.addEventListener("pointerleave", () => {

      if (!desktopHover.matches) return;

      if (activeCard === card) {
        closeCard(card);
      }

    });

  });

  /* ==================== CLIQUE FORA ==================== */

  document.addEventListener("pointerdown", event => {

    if (!activeCard) return;

    if (!activeCard.contains(event.target)) {
      closeCard(activeCard);
    }

  });

  /* ==================== TECLA ESC ==================== */

  document.addEventListener("keydown", event => {

    if (event.key !== "Escape") return;

    if (!activeCard) return;

    const button = activeCard.querySelector(
      ".project-card-trigger"
    );

    closeCard(activeCard);

    button?.focus();

  });

  /* ==================== MUDANÇA DE LAYOUT ==================== */

  desktopHover.addEventListener("change", () => {

    if (activeCard) {
      closeCard(activeCard);
    }

  });

}


/* ============================================
   WHATSAPP FLUTUANTE — VISIBILIDADE
   ============================================ */

function initializeFloatingWhatsApp() {

  const button = document.getElementById(
    "floating-whatsapp"
  );

  const businessSection = document.getElementById(
    "negocios"
  );

  const contactSection = document.getElementById(
    "contato"
  );

  if (!button || !businessSection || !contactSection) {
    return;
  }

  let ticking = false;

  function updateVisibility() {

    const businessRect =
      businessSection.getBoundingClientRect();

    const contactRect =
      contactSection.getBoundingClientRect();

    /*
      Exibir quando o início de Negócios
      chegar à área visível da tela.
    */

    const reachedBusiness =
      businessRect.top <= window.innerHeight * 0.75;

    /*
      Esconder quando Contato começar
      a entrar na tela.
    */

    const reachedContact =
      contactRect.top <= window.innerHeight * 0.85;

    const shouldShow =
      reachedBusiness && !reachedContact;

    button.classList.toggle(
      "is-visible",
      shouldShow
    );

    button.setAttribute(
      "aria-hidden",
      String(!shouldShow)
    );

    button.tabIndex = shouldShow ? 0 : -1;

    ticking = false;
  }

  function requestVisibilityUpdate() {

    if (ticking) return;

    ticking = true;

    window.requestAnimationFrame(updateVisibility);
  }

  window.addEventListener(
    "scroll",
    requestVisibilityUpdate,
    { passive: true }
  );

  window.addEventListener(
    "resize",
    requestVisibilityUpdate
  );

  // Verifica a posição também ao carregar.
  updateVisibility();
}

/* ============================================
   PRELOADER — CONTROLE DE EXIBIÇÃO
   ============================================ */

function initializePreloader() {

  const preloader = document.getElementById(
    "site-preloader"
  );

  if (!preloader) return;

  const duration = 1500;
    preloader.style.setProperty(
    "--preloader-duration",
    `${duration}ms`
  );

  // Impede interação com o conteúdo durante a abertura
  document.body.style.overflow = "hidden";

  window.setTimeout(() => {

    preloader.classList.add("is-hidden");

    // Restaura a rolagem
    document.body.style.overflow = "";

    // Remove o elemento após a transição
    window.setTimeout(() => {
      preloader.remove();
    }, 700);

  }, duration);

}

/* ============================================
   SOLUÇÕES — INDICADOR DE ROLAGEM
   ============================================ */

function initializeSolutionsScrollHint() {

  const tabs = document.querySelector(".solutions-tabs");
  const hint = document.querySelector(".solutions-scroll-hint");

  if (!tabs || !hint) return;

  function updateHint() {

    const remainingScroll =
      tabs.scrollWidth - tabs.clientWidth - tabs.scrollLeft;

    const hasMoreTabs = remainingScroll > 8;

    hint.classList.toggle("is-hidden", !hasMoreTabs);

  }

  tabs.addEventListener("scroll", updateHint, {
    passive: true
  });

  window.addEventListener("resize", updateHint);

  updateHint();
}
