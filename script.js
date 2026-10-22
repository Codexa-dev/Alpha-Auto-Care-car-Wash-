/* Alpha Auto Care - shared script. */

// >>> REPLACE THIS with the business WhatsApp number: country code + number, digits only (no +, spaces or dashes).
const WHATSAPP_NUMBER = "YOUR_WHATSAPP_NUMBER";

const waLink = (text) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

// Footer year
document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

// Mobile menu
const menuBtn = document.querySelector(".menu-btn");
const nav = document.getElementById("site-nav");
if (menuBtn && nav) {
  const setMenu = (open) => {
    nav.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", open);
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  menuBtn.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
  nav.addEventListener("click", (e) => e.target.closest("a") && setMenu(false));
  document.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));
}

// WhatsApp buttons: any link with data-wa="message" opens a chat with that message
document.querySelectorAll("a[data-wa]").forEach((a) => {
  a.href = waLink(a.dataset.wa);
  a.target = "_blank";
  a.rel = "noopener";
});

// Gallery filter
const filterBox = document.querySelector(".filters");
if (filterBox) {
  filterBox.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    filterBox.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", b === btn));
    document.querySelectorAll(".gallery figure").forEach((fig) => {
      fig.hidden = btn.dataset.filter !== "all" && fig.dataset.cat !== btn.dataset.filter;
    });
  });
}

// Contact form: validate, then prepare a WhatsApp message (nothing is sent to a server)
const form = document.getElementById("inquiry-form");
if (form) {
  const service = form.elements.service;
  const wanted = new URLSearchParams(location.search).get("service");
  if (wanted) [...service.options].forEach((o) => o.value === wanted && (service.value = wanted));

  const rules = {
    name: (v) => (v.trim() ? "" : "Please enter your full name."),
    phone: (v) => (v.replace(/\D/g, "").length >= 7 ? "" : "Please enter a phone or WhatsApp number (at least 7 digits)."),
    email: (v) => (!v.trim() || /^\S+@\S+\.\S+$/.test(v) ? "" : "Please enter a valid email address, or leave it empty."),
    service: (v) => (v ? "" : "Please choose a service."),
  };
  const check = (field) => {
    const msg = rules[field] ? rules[field](form.elements[field].value) : "";
    form.elements[field].setAttribute("aria-invalid", Boolean(msg));
    form.querySelector(`[data-error-for="${field}"]`).textContent = msg;
    return !msg;
  };
  Object.keys(rules).forEach((f) => form.elements[f].addEventListener("blur", () => check(f)));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const ok = Object.keys(rules).map(check).every(Boolean);
    if (!ok) return form.querySelector('[aria-invalid="true"]').focus();
    const f = form.elements;
    const lines = [
      "Hello Alpha Auto Care, I would like to make an inquiry.",
      `Name: ${f.name.value.trim()}`,
      `Phone/WhatsApp: ${f.phone.value.trim()}`,
      f.email.value.trim() && `Email: ${f.email.value.trim()}`,
      `Service: ${f.service.value}`,
      f.vehicle.value.trim() && `Vehicle: ${f.vehicle.value.trim()}`,
      f.message.value.trim() && `Message: ${f.message.value.trim()}`,
    ].filter(Boolean);
    window.open(waLink(lines.join("\n")), "_blank", "noopener");
  });
}

// Before & After slider: drag with mouse or finger, or use the keyboard on the hidden range input
document.querySelectorAll("[data-compare]").forEach((box) => {
  const range = box.querySelector(".compare-range");
  const setPos = (v) => {
    v = Math.min(100, Math.max(0, v));
    range.value = v;
    range.setAttribute("aria-valuetext", `Showing ${Math.round(v)}% of the before image`);
    box.style.setProperty("--pos", v + "%");
  };
  const fromPointer = (e) => {
    const r = box.getBoundingClientRect();
    setPos(((e.clientX - r.left) / r.width) * 100);
  };
  box.addEventListener("pointerdown", (e) => {
    box.setPointerCapture(e.pointerId);
    fromPointer(e);
  });
  // Focus after the press ends (a mouse press would otherwise move focus away) so arrow keys work next
  box.addEventListener("pointerup", () => range.focus({ preventScroll: true }));
  box.addEventListener("pointermove", (e) => box.hasPointerCapture(e.pointerId) && fromPointer(e));
  range.addEventListener("input", () => setPos(+range.value));
  range.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      setPos(+range.value + (e.key === "ArrowRight" ? 5 : -5));
    }
  });
  setPos(+range.value);
});
