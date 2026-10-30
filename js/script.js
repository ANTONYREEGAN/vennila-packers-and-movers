/* ==========================================================================
   Vennila Packers and Movers — Site Script
   Handles: mobile menu, sticky header, WhatsApp links, quote & enquiry forms,
   service preselection from the URL, and the gallery lightbox.
   ========================================================================== */

/* --------------------------------------------------------------------------
   BUSINESS SETTINGS — EDIT HERE
   --------------------------------------------------------------------------
   WHATSAPP_NUMBER: the business WhatsApp number in international format,
   digits only — country code + number, NO "+", spaces or hyphens.
   Example for India: "91" + "8190908066"  ->  "918190908066"
   Every WhatsApp button and both forms on the site use this one value.
   -------------------------------------------------------------------------- */
const SITE_CONFIG = {
  WHATSAPP_NUMBER: "918190908066",
  BUSINESS_NAME: "Vennila Packers and Movers",
  // Pre-filled text for plain "Chat on WhatsApp" buttons
  DEFAULT_WHATSAPP_TEXT: "Hello Vennila Packers and Movers, I would like to know more about your services."
};

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initHeaderShadow();
  initWhatsAppLinks();
  initFooterYear();
  initDateInputs();
  initQuoteForm();
  initContactForm();
  preselectServiceFromUrl();
  initLightbox();
});

/* ---------------------------------------------------------------- Helpers */

/** Build a WhatsApp click-to-chat URL (works with the app and WhatsApp Web). */
function buildWhatsAppUrl(message) {
  const base = `https://wa.me/${SITE_CONFIG.WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/**
 * Open WhatsApp in a new tab. Called only from a click/submit handler,
 * so browsers treat it as a user action. Falls back to same-tab navigation
 * if a popup blocker stops the new tab.
 */
function openWhatsApp(message) {
  const url = buildWhatsAppUrl(message);
  const win = window.open(url, "_blank");
  if (win) {
    win.opener = null;
  } else {
    window.location.href = url;
  }
}

/**
 * Normalise and validate an Indian mobile number.
 * Accepts 10 digits starting with 6–9, optionally prefixed by +91, 91 or 0.
 * Returns the cleaned 10-digit number, or null if invalid.
 */
function normaliseMobile(value) {
  let digits = value.replace(/[\s\-().]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  if (!/^\d+$/.test(digits)) return null;
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

/** Format "2026-11-15" as "15 November 2026" without time-zone shifts. */
function formatDate(isoDate) {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return isoDate;
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric"
  });
}

function todayIso() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Show or clear an error message under a form field. */
function setFieldError(field, message) {
  const group = field.closest(".form-group");
  if (!group) return;
  const errorEl = group.querySelector(".field-error");
  group.classList.toggle("has-error", Boolean(message));
  field.setAttribute("aria-invalid", message ? "true" : "false");
  if (errorEl) errorEl.textContent = message || "";
}

/**
 * Validate a form using a list of rules.
 * rules: [{ name, label, required, type }] — type "mobile" or "date" adds checks.
 * Returns { valid, values } where values holds trimmed field values.
 */
function validateForm(form, rules) {
  const values = {};
  let firstInvalid = null;

  rules.forEach((rule) => {
    const field = form.elements[rule.name];
    if (!field) return;
    const value = field.value.trim();
    let error = "";

    if (rule.required && !value) {
      error = `Please enter ${rule.label}.`;
      if (field.tagName === "SELECT") error = `Please select ${rule.label}.`;
    } else if (value && rule.type === "mobile") {
      const cleaned = normaliseMobile(value);
      if (!cleaned) error = "Please enter a valid 10-digit mobile number.";
      else values[rule.name] = cleaned;
    } else if (value && rule.type === "date" && value < todayIso()) {
      error = "Please choose today or a future date.";
    } else if (value && rule.minLength && value.length < rule.minLength) {
      error = `Please enter at least ${rule.minLength} characters.`;
    }

    if (!(rule.name in values)) values[rule.name] = value;
    setFieldError(field, error);
    if (error && !firstInvalid) firstInvalid = field;
  });

  if (firstInvalid) firstInvalid.focus();
  return { valid: !firstInvalid, values };
}

/** Clear a field's error as soon as the user edits it. */
function clearErrorsOnInput(form) {
  form.addEventListener("input", (e) => setFieldError(e.target, ""));
  form.addEventListener("change", (e) => setFieldError(e.target, ""));
}

function showStatus(statusEl, message, isError = false) {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.classList.toggle("is-error", isError);
  statusEl.hidden = false;
}

/* ----------------------------------------------------------- Mobile menu */
function initMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;

  const setOpen = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };

  toggle.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));

  // Close after choosing a link, on Escape, on outside click, or when resized to desktop
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) { setOpen(false); toggle.focus(); }
  });
  document.addEventListener("click", (e) => {
    if (nav.classList.contains("is-open") && !nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
  });
  window.matchMedia("(min-width: 1025px)").addEventListener("change", (mq) => { if (mq.matches) setOpen(false); });
}

/* ------------------------------------------------------- Header on scroll */
function initHeaderShadow() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const update = () => header.classList.toggle("is-scrolled", window.scrollY > 10);
  update();
  window.addEventListener("scroll", update, { passive: true });
}

/* -------------------------------------------- WhatsApp buttons (config) */
// Any link with data-whatsapp gets its URL from SITE_CONFIG, so the number
// only needs changing in one place. data-whatsapp="custom text" sets a message.
function initWhatsAppLinks() {
  document.querySelectorAll("[data-whatsapp]").forEach((link) => {
    const text = link.getAttribute("data-whatsapp") || SITE_CONFIG.DEFAULT_WHATSAPP_TEXT;
    link.href = buildWhatsAppUrl(text);
    link.target = "_blank";
    link.rel = "noopener";
  });
}

function initFooterYear() {
  document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
}

function initDateInputs() {
  document.querySelectorAll('input[type="date"]').forEach((input) => { input.min = todayIso(); });
}

/* ------------------------------------------------------ Home quote form */
function initQuoteForm() {
  const form = document.getElementById("quote-form");
  if (!form) return;
  const statusEl = document.getElementById("quote-status");
  clearErrorsOnInput(form);

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const { valid, values } = validateForm(form, [
      { name: "name", label: "your full name", required: true, minLength: 2 },
      { name: "mobile", label: "your mobile number", required: true, type: "mobile" },
      { name: "from", label: "the moving-from location", required: true },
      { name: "to", label: "the moving-to location", required: true },
      { name: "service", label: "a service", required: true },
      { name: "date", label: "your preferred moving date", required: true, type: "date" },
      { name: "details", label: "additional details", required: false }
    ]);

    if (!valid) {
      showStatus(statusEl, "Please correct the highlighted fields and try again.", true);
      return;
    }

    const message = [
      `Hello ${SITE_CONFIG.BUSINESS_NAME},`,
      "",
      "I would like to request a moving quote.",
      "",
      `Name: ${values.name}`,
      `Mobile: ${values.mobile}`,
      `Moving From: ${values.from}`,
      `Moving To: ${values.to}`,
      `Service: ${values.service}`,
      `Preferred Moving Date: ${formatDate(values.date)}`,
      `Additional Details: ${values.details || "None"}`,
      "",
      "Please contact me with the quotation.",
      "",
      "Thank you."
    ].join("\n");

    openWhatsApp(message);
    showStatus(statusEl, "Opening WhatsApp with your quote details…");
  });
}

/* --------------------------------------------------- Contact enquiry form */
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  const statusEl = document.getElementById("contact-status");
  clearErrorsOnInput(form);

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const { valid, values } = validateForm(form, [
      { name: "name", label: "your name", required: true, minLength: 2 },
      { name: "mobile", label: "your mobile number", required: true, type: "mobile" },
      { name: "service", label: "a service", required: false },
      { name: "message", label: "your enquiry", required: true, minLength: 5 }
    ]);

    if (!valid) {
      showStatus(statusEl, "Please correct the highlighted fields and try again.", true);
      return;
    }

    const lines = [
      `Hello ${SITE_CONFIG.BUSINESS_NAME},`,
      "",
      "I have an enquiry.",
      "",
      `Name: ${values.name}`,
      `Mobile: ${values.mobile}`
    ];
    if (values.service) lines.push(`Service: ${values.service}`);
    lines.push(`Message: ${values.message}`, "", "Please get back to me.", "", "Thank you.");

    openWhatsApp(lines.join("\n"));
    showStatus(statusEl, "Opening WhatsApp with your enquiry…");
  });
}

/* ------------------------------------- Preselect service (?service=...) */
// Service cards link to index.html?service=Home%20Shifting#quote
function preselectServiceFromUrl() {
  const select = document.getElementById("quote-service");
  if (!select) return;
  const wanted = new URLSearchParams(window.location.search).get("service");
  if (!wanted) return;

  const match = Array.from(select.options).find(
    (opt) => opt.value && opt.value.toLowerCase() === wanted.trim().toLowerCase()
  );
  if (!match) return;
  select.value = match.value;

  // Draw attention to the form once it is in view
  const card = document.querySelector(".quote-card");
  if (card) {
    card.classList.add("is-highlighted");
    setTimeout(() => card.classList.remove("is-highlighted"), 2600);
  }
  const nameField = document.getElementById("quote-name");
  if (nameField && window.location.hash === "#quote") {
    setTimeout(() => nameField.focus({ preventScroll: true }), 600);
  }
}

/* --------------------------------------------------------------- Lightbox */
// Each [data-gallery] container is its own set. Links still open the full
// image directly if JavaScript is unavailable.
function initLightbox() {
  const galleries = document.querySelectorAll("[data-gallery]");
  if (!galleries.length) return;

  const icon = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;

  const box = document.createElement("div");
  box.className = "lightbox";
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-modal", "true");
  box.setAttribute("aria-label", "Image viewer");
  box.innerHTML = `
    <button class="lightbox__btn lightbox__close" type="button" aria-label="Close image">${icon('<path d="M18 6 6 18M6 6l12 12"/>')}</button>
    <button class="lightbox__btn lightbox__prev" type="button" aria-label="Previous image">${icon('<path d="m15 18-6-6 6-6"/>')}</button>
    <figure class="lightbox__figure">
      <img class="lightbox__img" src="" alt="">
      <figcaption class="lightbox__caption"><span class="lightbox__counter"></span><span class="lightbox__text"></span></figcaption>
    </figure>
    <button class="lightbox__btn lightbox__next" type="button" aria-label="Next image">${icon('<path d="m9 18 6-6-6-6"/>')}</button>`;
  document.body.appendChild(box);

  const img = box.querySelector(".lightbox__img");
  const counter = box.querySelector(".lightbox__counter");
  const text = box.querySelector(".lightbox__text");
  const closeBtn = box.querySelector(".lightbox__close");
  let items = [];
  let index = 0;
  let lastFocus = null;

  const show = (i) => {
    index = (i + items.length) % items.length;
    const link = items[index];
    const thumb = link.querySelector("img");
    img.src = link.getAttribute("href");
    img.alt = thumb ? thumb.alt : "";
    counter.textContent = `${index + 1} / ${items.length}`;
    text.textContent = link.dataset.caption || (thumb ? thumb.alt : "");
  };

  const open = (group, i) => {
    items = Array.from(group.querySelectorAll(".gallery-item"));
    lastFocus = document.activeElement;
    show(i);
    box.classList.add("is-open");
    document.body.classList.add("no-scroll");
    closeBtn.focus();
  };

  const close = () => {
    box.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
    if (lastFocus) lastFocus.focus();
  };

  galleries.forEach((group) => {
    group.addEventListener("click", (e) => {
      const link = e.target.closest(".gallery-item");
      if (!link) return;
      e.preventDefault();
      open(group, Array.from(group.querySelectorAll(".gallery-item")).indexOf(link));
    });
  });

  closeBtn.addEventListener("click", close);
  box.querySelector(".lightbox__prev").addEventListener("click", () => show(index - 1));
  box.querySelector(".lightbox__next").addEventListener("click", () => show(index + 1));
  box.addEventListener("click", (e) => { if (e.target === box) close(); });

  document.addEventListener("keydown", (e) => {
    if (!box.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") show(index - 1);
    else if (e.key === "ArrowRight") show(index + 1);
    else if (e.key === "Tab") {
      // Keep keyboard focus inside the viewer
      const buttons = Array.from(box.querySelectorAll("button"));
      const pos = buttons.indexOf(document.activeElement);
      e.preventDefault();
      buttons[(pos + (e.shiftKey ? -1 : 1) + buttons.length) % buttons.length].focus();
    }
  });

  // Simple swipe support on touch screens
  let startX = null;
  box.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
  box.addEventListener("touchend", (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    startX = null;
  });
}
